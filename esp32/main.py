from machine import Pin, I2C, ADC
import time
import network
import urequests
import bme280
import json
import machine

CONFIG_FILE = "config.json"

ADC_MAX = 4095
VCC = 3.3


def load_config():
    with open(CONFIG_FILE, "r") as f:
        return json.load(f)


cfg = load_config()

API_URL = cfg["api_url"]
API_KEY = cfg["api_key"]
SEND_INTERVAL = int(cfg.get("send_interval", 10))

CALIBRATION_MODE = cfg.get("calibration_mode", False)
CALIBRATION_SAMPLES = int(cfg.get("calibration_samples", 60))

R0_ROOM1 = float(cfg.get("r0_room1", 0.7383))
R0_ROOM2 = float(cfg.get("r0_room2", 0.6658))


def ensure_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if wlan.isconnected():
        return True

    print("WiFi disconnected. Restarting...")
    time.sleep(2)
    machine.reset()
    return False


# ======================
# I2C
# ======================
i2c1 = I2C(0, scl=Pin(20), sda=Pin(22))
i2c2 = I2C(1, scl=Pin(5), sda=Pin(4))

bme1 = bme280.BME280(i2c=i2c1)  # living_room
bme2 = bme280.BME280(i2c=i2c2)  # bedroom

# ======================
# MQ-7
# ======================
mq7_1 = ADC(Pin(34))
mq7_1.atten(ADC.ATTN_11DB)

mq7_2 = ADC(Pin(39))
mq7_2.atten(ADC.ATTN_11DB)


def read_bme(sensor):
    t, p, h = sensor.read_compensated_data()
    return {
        "temperature": round(t, 2),
        "pressure": round(p / 100, 2),
        "humidity": round(h, 2),
    }


def adc_to_voltage(raw):
    return (raw / ADC_MAX) * VCC


def calc_rs(vout):
    if vout <= 0 or vout >= VCC:
        return None
    return (VCC - vout) / vout


def read_adc_avg(sensor, samples=20, delay_ms=50):
    total = 0
    for _ in range(samples):
        total += sensor.read()
        time.sleep_ms(delay_ms)
    return total / samples


def calibrate_r0(sensor, label):
    rs_values = []

    print("=== KALIBRACJA", label, "===")
    print("Umiesc czujnik w mozliwie czystym powietrzu.")
    print("Zbieranie probek...")

    for i in range(CALIBRATION_SAMPLES):
        raw = read_adc_avg(sensor, samples=10, delay_ms=50)
        vout = adc_to_voltage(raw)
        rs = calc_rs(vout)

        if rs is not None:
            rs_values.append(rs)

        print(
            "CAL", label,
            "sample=", i + 1,
            "raw=", round(raw, 1),
            "vout=", round(vout, 3),
            "rs=", None if rs is None else round(rs, 4),
        )
        time.sleep(1)

    if not rs_values:
        print("Brak poprawnych probek dla", label)
        return None

    rs_air = sum(rs_values) / len(rs_values)
    r0 = rs_air / 27.5

    print("=== KONIEC KALIBRACJI", label, "===")
    print("RS_air =", round(rs_air, 6))
    print("R0 =", round(r0, 6))
    return r0


def calc_co_ppm(sensor, r0):
    raw = read_adc_avg(sensor, samples=15, delay_ms=30)
    vout = adc_to_voltage(raw)
    rs = calc_rs(vout)

    if rs is None or r0 is None or r0 <= 0:
        return {
            "raw": round(raw, 1),
            "voltage": round(vout, 3),
            "rs": None,
            "ratio": None,
            "ppm": 0,
            "status": "unknown",
        }

    ratio = rs / r0
    ppm = 400 / ratio

    if ppm < 0:
        ppm = 0

    ppm_int = int(ppm)

    if ppm_int < 30:
        status = "ok"
    elif ppm_int < 70:
        status = "warning"
    else:
        status = "danger"

    return {
        "raw": round(raw, 1),
        "voltage": round(vout, 3),
        "rs": round(rs, 4),
        "ratio": round(ratio, 4),
        "ppm": ppm_int,
        "status": status,
    }


def send_data(payload):
    response = None
    try:
        headers = {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY,
        }
        response = urequests.post(API_URL, json=payload, headers=headers)
        print("POST:", response.status_code, response.text)
    except Exception as e:
        print("Send error:", e)
    finally:
        if response:
            response.close()


if CALIBRATION_MODE:
    print("")
    print("TRYB KALIBRACJI WLACZONY")
    print("Nie wysylam danych do backendu.")
    print("Po zakonczeniu przepisz nowe R0 do config.json")
    print("")

    r0_1 = calibrate_r0(mq7_1, "living_room")
    time.sleep(2)
    r0_2 = calibrate_r0(mq7_2, "bedroom")

    print("")
    print("WYNIKI KALIBRACJI:")
    print("R0_ROOM1 =", r0_1)
    print("R0_ROOM2 =", r0_2)
    print("")

    while True:
        time.sleep(5)


while True:
    try:
        ensure_wifi()

        # living_room
        bme_data1 = read_bme(bme1)
        mq7_data1 = calc_co_ppm(mq7_1, R0_ROOM1)

        room1 = {
            "point": "living_room",
            "temperature": bme_data1["temperature"],
            "pressure": bme_data1["pressure"],
            "humidity": bme_data1["humidity"],
            "co": mq7_data1["ppm"],
            "co_voltage": mq7_data1["voltage"],
            "co_status": mq7_data1["status"],
        }

        # bedroom
        bme_data2 = read_bme(bme2)
        mq7_data2 = calc_co_ppm(mq7_2, R0_ROOM2)

        room2 = {
            "point": "bedroom",
            "temperature": bme_data2["temperature"],
            "pressure": bme_data2["pressure"],
            "humidity": bme_data2["humidity"],
            "co": mq7_data2["ppm"],
            "co_voltage": mq7_data2["voltage"],
            "co_status": mq7_data2["status"],
        }

        print("=== SEND ===")
        print("ROOM1:", room1, "raw=", mq7_data1["raw"], "rs=", mq7_data1["rs"], "ratio=", mq7_data1["ratio"])
        print("ROOM2:", room2, "raw=", mq7_data2["raw"], "rs=", mq7_data2["rs"], "ratio=", mq7_data2["ratio"])

        send_data(room1)
        time.sleep(1)
        send_data(room2)

    except Exception as e:
        print("ERROR:", e)

    time.sleep(SEND_INTERVAL)