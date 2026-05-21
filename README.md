# ENV-MONITOR

ENV-MONITOR is a web application for monitoring indoor environmental conditions using an ESP32 microcontroller. The system collects data from sensors, sends measurements to the backend, stores them in a database, and presents current and historical readings in a web interface.

## Demo

The application is available at:

https://andrzejjur.pl/envmonitorapp/login

## Features

- temperature, humidity, and atmospheric pressure measurements,
- carbon monoxide monitoring using the MQ-7 sensor,
- support for multiple measurement points,
- data transmission from ESP32 to the backend via HTTP,
- measurement storage in a database,
- latest measurement preview,
- line charts for selected time ranges,
- measurement history,
- alarm system for CO threshold exceedances,
- user authentication,
- API protection using JWT tokens and a device API key.

## Technologies

### Frontend

- React
- Vite
- JavaScript
- CSS
- Recharts
- React Router

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- PostgreSQL / SQLite

### Measurement Module

- ESP32
- MicroPython
- BME280
- MQ-7
- Wi-Fi communication
- HTTP REST API

### Deployment

- VPS
- Nginx
- Gunicorn
- systemd
- Cloudflare DNS
