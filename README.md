# Indoor Environment Monitoring System

A full-stack IoT system for monitoring indoor environmental conditions using an ESP32 microcontroller, a Django REST API backend, and a React-based web dashboard.

---

## Overview

The system collects environmental measurements from an ESP32 device, stores them in a database, and exposes them via a REST API for real-time visualization.

Measured parameters:
- Temperature
- Humidity
- CO (Carbon Monoxide)

---

## Architecture

ESP32 (MicroPython) → Django REST API → Database → React Frontend (SPA)

---

## Technology Stack

Backend: Django, Django REST Framework  
Frontend: React (Vite)  
Database: SQLite (development), PostgreSQL (planned)  
Hardware: ESP32 (MicroPython)

---

## Key Features

- Secure data ingestion via API token (`X-API-KEY`)
- Data validation and pagination
- Statistical aggregation (latest, 1h avg, 24h avg)
- Responsive dashboard
- Automatic data refresh

---

## Development Setup

Backend:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

Frontend:
cd frontend
npm install
npm run dev

Backend: http://127.0.0.1:8000/  
Frontend: http://localhost:5173/

---

## Project Status

Backend: MVP complete  
Frontend: Functional dashboard  
ESP32 integration: In progress  
Production deployment: Planned