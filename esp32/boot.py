import network
import time
import machine
import json
import socket
import ure

CONFIG_FILE = "config.json"


def load_config():
    try:
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {
            "wifi_ssid": "",
            "wifi_password": "",
            "api_url": "http://andrzejjur.pl/api/measurements/",
            "api_key": "",
            "send_interval": 10,
            "calibration_mode": False,
            "calibration_samples": 60,
            "r0_room1": 0.7383,
            "r0_room2": 0.6658,
            "ap_ssid": "ENV-MONITOR-SETUP",
            "ap_password": "envmonitor123",
        }


def save_config(cfg):
    with open(CONFIG_FILE, "w") as f:
        json.dump(cfg, f)


def connect_wifi(cfg, timeout=20):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if wlan.isconnected():
        print("WiFi already connected:", wlan.ifconfig())
        return True

    ssid = cfg.get("wifi_ssid", "")
    password = cfg.get("wifi_password", "")

    if not ssid:
        print("No WiFi SSID in config.")
        return False

    print("Connecting to WiFi:", ssid)
    wlan.connect(ssid, password)

    for _ in range(timeout):
        if wlan.isconnected():
            print("WiFi connected:", wlan.ifconfig())
            return True
        time.sleep(1)

    print("WiFi connection failed.")
    return False


def url_decode(value):
    value = value.replace("+", " ")
    parts = value.split("%")
    if len(parts) == 1:
        return value

    result = parts[0]
    for item in parts[1:]:
        try:
            result += chr(int(item[:2], 16)) + item[2:]
        except Exception:
            result += "%" + item
    return result


def parse_query(query):
    data = {}
    if not query:
        return data

    pairs = query.split("&")
    for pair in pairs:
        if "=" in pair:
            key, value = pair.split("=", 1)
            data[key] = url_decode(value)
    return data


def html_form(cfg, message=""):
    wifi_ssid = cfg.get("wifi_ssid", "")
    wifi_password = cfg.get("wifi_password", "")
    api_url = cfg.get("api_url", "")
    api_key = cfg.get("api_key", "")
    send_interval = cfg.get("send_interval", 10)
    r0_room1 = cfg.get("r0_room1", 0.7383)
    r0_room2 = cfg.get("r0_room2", 0.6658)

    return """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ENV Monitor Setup</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {{ font-family: Arial, sans-serif; margin: 20px; background: #111827; color: #f9fafb; }}
    .box {{ max-width: 560px; margin: 0 auto; background: #1f2937; padding: 20px; border-radius: 12px; }}
    input {{ width: 100%; padding: 10px; margin: 8px 0 16px 0; border-radius: 8px; border: 1px solid #374151; }}
    button {{ background: #2563eb; color: white; padding: 12px 16px; border: 0; border-radius: 8px; cursor: pointer; }}
    .msg {{ margin-bottom: 16px; color: #93c5fd; }}
    label {{ font-weight: bold; }}
  </style>
</head>
<body>
  <div class="box">
    <h2>ENV Monitor Setup</h2>
    <div class="msg">{message}</div>
    <form action="/save" method="get">
      <label>WiFi SSID</label>
      <input name="wifi_ssid" value="{wifi_ssid}">

      <label>WiFi Password</label>
      <input name="wifi_password" value="{wifi_password}">

      <label>API URL</label>
      <input name="api_url" value="{api_url}">

      <label>API Key</label>
      <input name="api_key" value="{api_key}">

      <label>Send interval (seconds)</label>
      <input name="send_interval" value="{send_interval}">

      <label>R0 Room1</label>
      <input name="r0_room1" value="{r0_room1}">

      <label>R0 Room2</label>
      <input name="r0_room2" value="{r0_room2}">

      <button type="submit">Save and restart</button>
    </form>
  </div>
</body>
</html>""".format(
        message=message,
        wifi_ssid=wifi_ssid,
        wifi_password=wifi_password,
        api_url=api_url,
        api_key=api_key,
        send_interval=send_interval,
        r0_room1=r0_room1,
        r0_room2=r0_room2,
    )


def start_setup_portal(cfg):
    print("Starting AP setup mode...")

    ap = network.WLAN(network.AP_IF)
    ap.active(True)

    ap_ssid = cfg.get("ap_ssid", "ENV-MONITOR-SETUP")
    ap_password = cfg.get("ap_password", "envmonitor123")

    try:
        ap.config(essid=ap_ssid, password=ap_password, authmode=network.AUTH_WPA_WPA2_PSK)
    except Exception:
        ap.config(essid=ap_ssid)

    print("AP active:", ap.ifconfig())
    print("Connect to WiFi:", ap_ssid)
    print("Setup page: http://192.168.4.1")

    addr = socket.getaddrinfo("0.0.0.0", 80)[0][-1]
    s = socket.socket()
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(addr)
    s.listen(1)

    while True:
        conn, _ = s.accept()
        try:
            request = conn.recv(2048).decode()

            first_line = request.split("\r\n")[0]
            match = ure.search("GET /(.*) HTTP", first_line)

            path = ""
            if match:
                path = match.group(1)

            if path.startswith("save?"):
                query = path[5:]
                params = parse_query(query)

                cfg["wifi_ssid"] = params.get("wifi_ssid", "")
                cfg["wifi_password"] = params.get("wifi_password", "")
                cfg["api_url"] = params.get("api_url", "")
                cfg["api_key"] = params.get("api_key", "")

                try:
                    cfg["send_interval"] = int(params.get("send_interval", "10"))
                except Exception:
                    cfg["send_interval"] = 10

                try:
                    cfg["r0_room1"] = float(params.get("r0_room1", "0.7383"))
                except Exception:
                    cfg["r0_room1"] = 0.7383

                try:
                    cfg["r0_room2"] = float(params.get("r0_room2", "0.6658"))
                except Exception:
                    cfg["r0_room2"] = 0.6658

                save_config(cfg)

                response = """HTTP/1.1 200 OK
Content-Type: text/html

<html><body><h2>Saved. Restarting device...</h2></body></html>
"""
                conn.send(response)
                conn.close()
                time.sleep(2)
                machine.reset()
                return

            page = html_form(cfg)
            response = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n" + page
            conn.send(response)

        except Exception as e:
            print("Portal error:", e)
        finally:
            try:
                conn.close()
            except Exception:
                pass


cfg = load_config()

if not connect_wifi(cfg):
    start_setup_portal(cfg)