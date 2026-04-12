from machine import Pin, I2C, ADC
import time
import network
import urequests
import bme280
import math

# ======================
# KONFIG
# ======================
SSID = "BLANCO"
PASSWORD = "Blanco_0126_"

API_URL = "http://192.168.88.43:8000/api/measurements/"
API_KEY = "a3f9c8b4e6d12f7a9b0c5e8d4f1a2b3c9d7e6f5a4c3b2a1f8e7d6c5b4a3f2e1"

SEND_INTERVAL = 10  # sekundy

# ======================
# MQ-7 / ADC
# ======================
ADC_MAX = 4095
VCC = 3.3

# Tryb kalibracji
CALIBRATION_MODE = False

# Ile próbek do kalibracji
CALIBRATION_SAMPLES = 60

# Wartości po kalibracji
R0_ROOM1 = 0.7383
R0_ROOM2 = 0.6658

# ======================
# WIFI
# ======================
def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if not wlan.isconnected():
        print("Laczenie z WiFi...")
        wlan.connect(SSID, PASSWORD)

        timeout = 20
        while not wlan.isconnected() and timeout > 0:
            time.sleep(1)
            timeout -= 1

    if wlan.isconnected():
        print("WiFi OK:", wlan.ifconfig())
    else:
        print("WiFi ERROR")

# ======================
# I2C
# ======================
i2c1 = I2C(0, scl=Pin(20), sda=Pin(22))
i2c2 = I2C(1, scl=Pin(5), sda=Pin(4))

bme1 = bme280.BME280(i2c=i2c1)  # living_room
bme2 = bme280.BME280(i2c=i2c2)  # bedroom

# ======================
# MQ7
# ======================
mq7_1 = ADC(Pin(34))
mq7_1.atten(ADC.ATTN_11DB)

mq7_2 = ADC(Pin(39))
mq7_2.atten(ADC.ATTN_11DB)

# ======================
# FUNKCJE BME280
# ======================
def read_bme(sensor):
    t, p, h = sensor.read_compensated_data()
    return {
        "temperature": round(t, 2),
        "pressure": round(p / 100, 2),
        "humidity": round(h, 2),
    }

# ======================
# FUNKCJE MQ-7
# ======================
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
            "status": "UNKNOWN",
        }

    ratio = rs / r0

    ppm = 400 / ratio

    if ppm < 0:
        ppm = 0

    ppm_int = int(ppm)

    if ppm_int < 30:
        status = "OK"
    elif ppm_int < 70:
        status = "LOW"
    elif ppm_int < 150:
        status = "WARNING"
    else:
        status = "DANGER"

    return {
        "raw": round(raw, 1),
        "voltage": round(vout, 3),
        "rs": round(rs, 4),
        "ratio": round(ratio, 4),
        "ppm": ppm_int,
        "status": status,
    }

# ======================
# API
# ======================
def send_data(payload):
    try:
        headers = {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY,
        }
        r = urequests.post(API_URL, json=payload, headers=headers)
        print("POST:", r.status_code, r.text)
        r.close()
    except Exception as e:
        print("Send error:", e)

# ======================
# START
# ======================
connect_wifi()

# ======================
# KALIBRACJA
# ======================
if CALIBRATION_MODE:
    print("")
    print("TRYB KALIBRACJI WLACZONY")
    print("Nie wysylam danych do backendu.")
    print("Po zakonczeniu przepisz R0_ROOM1 i R0_ROOM2 do kodu,")
    print("a potem ustaw CALIBRATION_MODE = False.")
    print("")

    r0_1 = calibrate_r0(mq7_1, "living_room")
    time.sleep(2)
    r0_2 = calibrate_r0(mq7_2, "bedroom")

    print("")
    print("WYNIKI KALIBRACJI:")
    print("R0_ROOM1 =", r0_1)
    print("R0_ROOM2 =", r0_2)
    print("")
    print("Przepisz te wartosci do kodu i ustaw CALIBRATION_MODE = False.")

    while True:
        time.sleep(5)

# ======================
# PĘTLA GŁÓWNA
# ======================
while True:
    try:
        # ===== living_room =====
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

        # ===== bedroom =====
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