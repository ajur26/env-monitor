from machine import Pin, I2C, ADC
import time
import bme280

# ======================
# I2C (1 magistrala)
# ======================
i2c = I2C(0, scl=Pin(20), sda=Pin(22))

bme1 = bme280.BME280(i2c=i2c, address=0x76)
bme2 = bme280.BME280(i2c=i2c, address=0x77)

# ======================
# MQ7
# ======================
mq7_1 = ADC(Pin(34))
mq7_1.atten(ADC.ATTN_11DB)

mq7_2 = ADC(Pin(39))
mq7_2.atten(ADC.ATTN_11DB)

# ======================
# Funkcje
# ======================

def read_bme(sensor):
    t, p, h = sensor.read_compensated_data()
    return {
        "temperature": round(t, 2),
        "pressure": round(p / 100, 2),
        "humidity": round(h, 2)
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
        "status": status
    }

# ======================
# Pętla
# ======================

while True:
    try:
        # ROOM 1
        bme_data1 = read_bme(bme1)
        mq7_data1 = read_mq7(mq7_1)

        room1 = {
            "room": "room_1",
            "temperature": bme_data1["temperature"],
            "pressure": bme_data1["pressure"],
            "humidity": bme_data1["humidity"],
            "co_voltage": mq7_data1["voltage"],
            "co_status": mq7_data1["status"]
        }

        # ROOM 2
        bme_data2 = read_bme(bme2)
        mq7_data2 = read_mq7(mq7_2)

        room2 = {
            "room": "room_2",
            "temperature": bme_data2["temperature"],
            "pressure": bme_data2["pressure"],
            "humidity": bme_data2["humidity"],
            "co_voltage": mq7_data2["voltage"],
            "co_status": mq7_data2["status"]
        }

        print("=== ROOM 1 ===")
        print(room1)

        print("=== ROOM 2 ===")
        print(room2)

        print("------------------------")

    except Exception as e:
        print("ERROR:", e)

    time.sleep(2)