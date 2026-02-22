# Indoor Environment Monitoring System

A web-based IoT system for monitoring indoor environmental conditions using an ESP32 microcontroller and a Django-based backend.

---

## Overview

The system collects environmental data from an ESP32 device, stores it in a database, and exposes it through a REST API for visualization in a web frontend.

Measured parameters:

- Temperature
- Humidity
- CO₂ concentration

---

## Architecture

ESP32 (MicroPython)  
↓  
Django REST API  
↓  
Database  
↓  
React Frontend (SPA)

---

## Technology Stack

- **Backend:** Django + Django REST Framework
- **Frontend:** React (SPA)
- **Database:** SQLite (development) / PostgreSQL (planned)
- **Hardware:** ESP32 (MicroPython)

---

## Backend Capabilities

- Secure data ingestion via API token
- Data validation
- Pagination and date filtering
- Statistical aggregation endpoint
- CORS configuration for frontend integration

---

## Running the Project (Development)

```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

API available at:

```
http://127.0.0.1:8000/
```

---

## Project Status

Backend: Completed  
Frontend: In progress  
ESP32 integration: In progress