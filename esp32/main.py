from machine import Pin, I2C, ADC
import time
import network
import urequests
import bme280

# ======================
# KONFIG
# ======================
SSID = "BurningKrzak"
PASSWORD = "98ExoDVs()"

API_URL = "http://192.168.33.2:8000/api/measurements/"  # Twój backend
API_KEY = "a3f9c8b4e6d12f7a9b0c5e8d4f1a2b3c9d7e6f5a4c3b2a1f8e7d6c5b4a3f2e1"

SEND_INTERVAL = 10  # sekundy

# ======================
# WIFI
# ======================
def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if not wlan.isconnected():
        print("Łączenie z WiFi...")
        wlan.connect(SSID, PASSWORD)

        timeout = 15
        while not wlan.isconnected() and timeout > 0:
            time.sleep(1)
            timeout -= 1

    if wlan.isconnected():
        print("WiFi OK:", wlan.ifconfig())
    else:
        print("WiFi ERROR")

# ======================
# I2C (jeśli masz 2 czujniki z tym samym adresem → użyj 2 magistral)
# ======================
# Wersja z 2 magistralami (zalecana przy konflikcie adresów)
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
# FUNKCJE
# ======================
def read_bme(sensor):
    t, p, h = sensor.read_compensated_data()
    return {
        "temperature": round(t, 2),
        "pressure": round(p / 100, 2),  # hPa
        "humidity": round(h, 2),
    }

def read_mq7(sensor):
    raw = sensor.read()
    voltage = raw * (3.3 / 4095)

    if voltage < 0.3:
        status = "OK"
    elif voltage < 0.8:
        status = "LOW"
    elif voltage < 1.5:
        status = "WARNING"
    else:
        status = "DANGER"

    return {
        "voltage": round(voltage, 3),
        "status": status,
    }

def send_data(payload):
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Api-Key " + API_KEY,
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
# PĘTLA
# ======================
while True:
    try:
        # ===== living_room =====
        bme_data1 = read_bme(bme1)
        mq7_data1 = read_mq7(mq7_1)

        room1 = {
            "point": "living_room",  # ❗ ważne: zgodne z backendem
            "temperature": bme_data1["temperature"],
            "pressure": bme_data1["pressure"],
            "humidity": bme_data1["humidity"],
            "co_voltage": mq7_data1["voltage"],
            "co_status": mq7_data1["status"],
        }

        # ===== bedroom =====
        bme_data2 = read_bme(bme2)
        mq7_data2 = read_mq7(mq7_2)

        room2 = {
            "point": "bedroom",
            "temperature": bme_data2["temperature"],
            "pressure": bme_data2["pressure"],
            "humidity": bme_data2["humidity"],
            "co_voltage": mq7_data2["voltage"],
            "co_status": mq7_data2["status"],
        }

        print("=== SEND ===")
        print(room1)
        print(room2)

        # POST do API
        send_data(room1)
        time.sleep(1)
        send_data(room2)

    except Exception as e:
        print("ERROR:", e)

    time.sleep(SEND_INTERVAL)