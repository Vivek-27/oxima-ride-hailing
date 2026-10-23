# 🏎️ Oxima - Real-Time All-India Ride-Hailing & Fleet Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0-red.svg)](https://redis.io/)
[![Kafka](https://img.shields.io/badge/Apache%20Kafka-7.5-black.svg)](https://kafka.apache.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, real-time MERN full-stack ride-hailing and fleet management platform engineered with **Node.js, Express, React 18, Vite, MongoDB (2dsphere Geospatial), Redis (Spatial GEO & 3-Hour TTL City Surge), Apache Kafka (Telemetry Streaming), and Open Source Routing Machine (OSRM Turn-by-Turn Road Navigation)**.

---

## 🌟 Key Platform Features

- 🇮🇳 **Nationwide Global Indian Coverage**: Works across Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Kochi, and all Indian cities.
- 🛣️ **Turn-by-Turn Road Navigation (OSRM)**: Calculates exact road network geometries and realistic driving durations between pickup and destination.
- 🧭 **Driver-to-Pickup Navigation & Road Simulation**: Displays turn-by-turn road paths to passenger pickups with an interactive driving speed multiplier (`1x`, `2x`, `5x`, `10x`).
- 📏 **20-Meter Proximity PIN Lock**: Drivers can only unlock the 4-digit PIN verification when their vehicle arrives within 20 meters of the pickup point.
- 🛵 **6 Standardized Vehicle Categories**: Custom SVG Leaflet markers with heading rotation for **Moto**, **Auto**, **Mini**, **Sedan**, **SUV**, and **Electric (EV ⚡)**.
- 📡 **Animated Radar Searching Pulse**: Real-time searching radar rings and broadcast indicators when matching riders with nearby drivers.
- ❌ **Structured Cancellation Reasons**: Multi-choice cancellation feedback for passengers and drivers with real-time audit logging in the Admin operations dashboard.
- 🏙️ **City-Specific Surge Pricing with 3-Hour Auto-Expiry**: Admin can select target cities, apply peak multipliers, and let them automatically expire back to 1.0x after 3 hours.
- 🟢 **Live Real-Time Driver Presence Lifecycle**: Drivers strictly start as `OFFLINE`; automatic offline transition on browser tab closure or logout.
- 📱 **Mobile-First Dark Glassmorphic Design**: Responsive Apple-styled layout optimized for mobile phones, tablets, and desktop workstations.

---

## 🏗️ System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|   React 18 + Vite 6 + Tailwind CSS + React-Leaflet (Interactive Map & Routing)    |
+-----------------------------------------+-----------------------------------------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
                  HTTPS / REST                         WSS / Socket.IO
                        |                                   |
+-----------------------v-----------------------------------v-----------------------+
|                                 BACKEND LAYER                                     |
|           Node.js v20+ / Express.js 4 + Socket.IO 4 WebSockets Gateway            |
|                     Zod Validation + JWT Authentication + RBAC                    |
+---------+--------------------+--------------------+--------------------+----------+
          |                    |                    |                    |
+---------v----------+  +------v-----------+  +-----v------------+  +----v----------+
|     MongoDB 7      |  |     Redis 7      |  |  Apache Kafka    |  |   OSRM API    |
| (2dsphere Spatial) |  | (GEO & 3hr Surge)|  | (Event Streams)  |  | (Road Engine) |
+--------------------+  +------------------+  +------------------+  +---------------+
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **MongoDB**: Local Community Server (`mongodb://127.0.0.1:27017`) or MongoDB Atlas
- **Redis**: Local Redis Server (`redis://127.0.0.1:6379`) or Redis Cloud
- **Git**: Installed on your system

### 2. Installation & Running Locally

```bash
# 1. Clone repository
git clone https://github.com/<your-username>/oxima-ride-hailing.git
cd oxima-ride-hailing

# 2. Install dependencies
cd server && npm install
cd ../client && npm install && cd ..

# 3. Seed test fleet and sample accounts
cd server && node src/utils/seedData.js && cd ..

# 4. Start backend (Port 5000)
cd server && node src/server.js

# 5. Start frontend client (Port 5173) in a new terminal
cd client && npm run dev
```

Open **`http://localhost:5173`** in your browser!

---

## 🐳 Docker Multi-Stage Deployment

To build and run the complete containerized stack (**MongoDB, Redis, Kafka, ZooKeeper, and Oxima Application**):

```bash
# Build and run all services in detached mode
docker-compose up --build -d

# Verify running containers
docker-compose ps

# View live application logs
docker-compose logs -f oxima-app

# Stop all services
docker-compose down
```

---

## ☁️ Cloud Deployment Options

### Option 1: Deploy on Render (Recommended Free/Simple)
1. **Database**: Create a free MongoDB database on [MongoDB Atlas](https://www.mongodb.com/atlas) and free Redis on [Upstash Redis](https://upstash.com/).
2. **Backend Web Service**:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node src/server.js`
   - Environment Variables: `MONGODB_URI`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `JWT_SECRET`, `NODE_ENV=production`.
3. **Frontend Static Site**:
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment Variables: `VITE_API_URL=https://your-backend.onrender.com/api/v1`, `VITE_SOCKET_URL=https://your-backend.onrender.com`.

### Option 2: Deploy on VPS / DigitalOcean / AWS EC2 using Docker Compose
```bash
git clone https://github.com/<your-username>/oxima-ride-hailing.git
cd oxima-ride-hailing
docker-compose up --build -d
```

---

## 🔑 Pre-Configured Test Credentials

| Role | Email | Password | Role Description |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@oxima.com` | `adminpassword123` | Fleet Operations, 3hr City Surge Multiplier, Vehicle RC Verification |
| **Passenger / Rider** | `rider@oxima.com` | `password123` | Instant All-India Booking, Road Polylines, UPI QR Payments |
| **Driver (Auto)** | `venkatesh.auto@oxima.com` | `password123` | Bajaj Auto (`RC-TS-AUTO-202`), Road Driving Simulation |
| **Driver (Mini)** | `rizwan.mini@oxima.com` | `password123` | Maruti WagonR (`RC-TS-MINI-303`), 20m Proximity PIN Verification |
| **Driver (Sedan)** | `srinivas.sedan@oxima.com` | `password123` | Hyundai Verna (`RC-TS-SEDAN-404`) |
| **Driver (SUV)** | `anand.suv@oxima.com` | `password123` | Toyota Innova (`RC-TS-SUV-505`) |
| **Driver (EV)** | `naresh.ev@oxima.com` | `password123` | Tata Nexon EV (`RC-TS-EV-606`) |

---

## 📚 Technical Documentation
- 📘 **Master Architecture & Code Manual**: [OXIMA_ARCHITECTURE_AND_CODE_GUIDE.md](OXIMA_ARCHITECTURE_AND_CODE_GUIDE.md)
- 🚀 **Local & Docker Running Guide**: [RUNNING_GUIDE.md](RUNNING_GUIDE.md)
- 📄 **Master Engineering PDF**: `OXIMA_MASTER_DOCUMENTATION.pdf`

---

## 📄 License
This project is licensed under the MIT License.
