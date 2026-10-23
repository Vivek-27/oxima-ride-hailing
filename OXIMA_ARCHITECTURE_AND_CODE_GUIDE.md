# 📘 Oxima - Master Architecture, Code & Technology Deep-Dive Guide

A comprehensive, zero-to-hero engineering manual explaining the entire Oxima platform from scratch: system design, frontend & backend frameworks, lifecycle hooks, state management, databases, in-memory spatial caches, event streaming, routing algorithms, mathematical formulas, and line-by-line code breakdowns.

---

## 📑 Table of Contents
1. [Executive System Overview & High-Level Architecture](#1-executive-system-overview)
2. [Exact Technologies & Version Specifications](#2-exact-technologies--version-specifications)
3. [How to Run from Scratch (Local & Docker)](#3-how-to-run-from-scratch)
4. [Frontend Engineering Deep Dive (React 18, Vite, Tailwind CSS)](#4-frontend-engineering-deep-dive)
   - React Hooks Explained: `useEffect`, `useState`, `useRef`, `useContext`
   - Context API vs Alternatives (Redux, Zustand)
   - Vite 6 vs Webpack: ESM & HMR Architecture
   - Tailwind CSS: JIT Engine & Responsive Glassmorphic Mobile UI
   - Leaflet & React-Leaflet: Maps, EPSG:3857, SVG Vehicle Markers & Polylines
5. [Backend Engineering Deep Dive (Node.js, Express, Middleware Pipeline)](#5-backend-engineering-deep-dive)
   - Node.js Event Loop & Non-Blocking I/O
   - `app.js` vs `server.js`: Separation of Concerns
   - Complete Express Middleware Chain Explained
   - Environment Variables & 12-Factor App Principles
6. [Databases & In-Memory Geospatial Caching (MongoDB & Redis)](#6-databases--in-memory-geospatial-caching)
   - MongoDB 7 & Mongoose 8: `2dsphere` Spatial Indexes & ACID Transactions
   - Redis 7: Data Types, Redis GEO Commands (`GEOADD`, `GEOSEARCH`) & 3-Hour TTL City Surge
   - Database Alternatives Comparison
7. [Real-Time Telemetry & Messaging (Apache Kafka & Socket.IO 4)](#7-real-time-telemetry--messaging)
   - Apache Kafka: Event-Driven Commit Log, Topics, Partitions, Consumer Groups
   - WebSockets & Socket.IO 4: Multi-Tenant Rooms & Live Presence Lifecycle
8. [Algorithms, Mathematics & Routing Engines](#8-algorithms-mathematics--routing-engines)
   - Haversine Spherical Distance Formula & Derivation
   - 20-Meter Proximity Arrival Algorithm
   - Dynamic Fare Estimation & City Surge Pricing Formula
   - OSRM Turn-by-Turn Road Navigation & Contraction Hierarchies (CH)
9. [Line-by-Line Code Breakdown of Core Application Files](#9-line-by-line-code-breakdown)
10. [Multi-Stage Docker Containerization & Deployment](#10-multi-stage-docker-containerization)

---

## 1. Executive System Overview

Oxima is an enterprise-grade, real-time ride-hailing platform built to coordinate riders, drivers, and fleet operators nationwide across India.

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

## 2. Exact Technologies & Version Specifications

| Technology | Version | Purpose in Codebase |
| :--- | :--- | :--- |
| **Node.js** | `v20.x` / `v22.x` | Non-blocking runtime executing backend JavaScript services |
| **React.js** | `18.3.1` | Declarative component hierarchy and reactive state management |
| **Vite** | `6.4.3` | Next-generation ESM dev server and Rollup production bundler |
| **Tailwind CSS** | `3.4.17` | Utility-first responsive CSS styling with dark glassmorphic UI |
| **Leaflet / React-Leaflet** | `1.9.4` / `4.2.1` | Interactive vector maps, turn-by-turn road polylines, vehicle markers |
| **Express.js** | `4.19.2` | REST API framework, route dispatching, and security middlewares |
| **MongoDB** | `7.0.x` | Primary NoSQL document database with geospatial `2dsphere` indexes |
| **Mongoose** | `8.4.1` | Object Data Modeling (ODM), schema enforcement, and aggregations |
| **Redis** | `7.0.x` (`ioredis 5.4.1`) | In-memory spatial GEO search & 3-hour city surge TTL cache |
| **Apache Kafka** | `7.5.0` (`kafkajs 2.2.4`) | High-throughput telemetry and audit event bus |
| **Socket.IO** | `4.7.5` | Full-duplex WebSocket communication and room broadcasting |
| **Zod** | `3.23.8` | Type-safe runtime request payload validation |
| **jsonwebtoken / bcryptjs** | `9.0.2` / `2.4.3` | Cryptographic JWT auth tokens and salted password hashing |

---

## 3. How to Run from Scratch

### Local npm Setup
```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install && cd ..

# 2. Seed initial data
cd server && node src/utils/seedData.js && cd ..

# 3. Start Backend & Frontend
# Terminal 1:
cd server && node src/server.js
# Terminal 2:
cd client && npm run dev
```

### Docker Compose Single-Command Setup
```bash
docker-compose up --build -d
```

---

## 4. Frontend Engineering Deep Dive

### React Hooks: Deep Line-by-Line Breakdown

#### 1. `useEffect` Hook
- **What it does**: Schedules a callback function to run *after* DOM rendering finishes.
- **Why we use it**: For subscribing to WebSocket events, fetching initial API data, starting timers, and synchronizing external map state.
- **Syntax**:
  ```jsx
  useEffect(() => {
    // 1. Setup phase: runs on component mount or when dependency changes
    const timer = setInterval(fetchDrivers, 5000);

    // 2. Cleanup phase: runs on unmount or before the effect re-runs
    return () => clearInterval(timer);
  }, [pickup]); // Dependency array
  ```
- **Pitfall Avoided**: Without the dependency array, `useEffect` runs on *every single render*, causing infinite loops when calling state setters!

#### 2. `useState` Hook
- **What it does**: Declares a state variable and a setter function.
- **Why we use it**: Whenever state changes, React triggers a re-render to update the visual UI.
- **Example**: `const [isOnline, setIsOnline] = useState(false);`

#### 3. `useRef` Hook
- **What it does**: Returns a mutable object `{ current: initialValue }` whose value persists across renders without triggering a re-render when changed.
- **Why we use it**: For storing interval IDs (`simIntervalRef.current = setInterval(...)`), simulation step indices, and DOM elements.

#### 4. `useContext` & React Context API
- **What it is**: Built-in global state management providing values across the component tree without passing props through intermediate layers.
- **Why we use it**:
  - `AuthContext.jsx`: Persists JWT auth tokens in `localStorage`, decodes user role, provides `login()`, `logout()`, and `refreshUser()`.
  - `SocketContext.jsx`: Instantiates a single persistent WebSocket connection across the whole app.

---

## 5. Backend Engineering Deep Dive

### `app.js` vs `server.js`
- **`app.js`**: Contains pure application logic: Express initialization, middleware pipeline (`cors`, `helmet`, `morgan`, `rateLimit`, `express.json`), route attachments (`/api/v1/auth`, `/api/v1/rides`, `/api/v1/drivers`, `/api/v1/admin`), and global error handling.
- **`server.js`**: Responsible for environment startup: connecting MongoDB, connecting Redis, resetting inactive drivers to `OFFLINE`, initializing Socket.IO on the HTTP server, and listening on port `5000`.

---

## 6. Databases & In-Memory Geospatial Caching

### MongoDB 7 & 2dsphere Spatial Indexing
- Coordinates are stored as GeoJSON:
  ```json
  "currentLocation": {
    "type": "Point",
    "coordinates": [78.3772, 17.4504] // [Longitude, Latitude]
  }
  ```
- `driverSchema.index({ currentLocation: '2dsphere' })` allows MongoDB to calculate spherical Euclidean distances on Earth's curved surface.

### Redis 7 Spatial Commands & 3-Hour TTL Surge
- **`GEOADD oxima:drivers:locations 78.3772 17.4504 driver_123`**: Inserts driver coordinates into a 52-bit Geohash sorted set.
- **`GEOSEARCH oxima:drivers:locations FROMLONLAT 78.3772 17.4504 BYRADIUS 20 KM`**: Finds all online drivers within 20 KM in &lt;1 millisecond.
- **`SET oxima:surge:city:bengaluru '{"multiplier":1.8,"expiresAt":...}' EX 10800`**: Sets a 3-hour surge (10,800 seconds). Redis automatically purges the key after 3 hours, reverting surge back to 1.0x!

---

## 7. Real-Time Telemetry & Messaging

### Apache Kafka vs WebSockets
- **Kafka**: Asynchronous, distributed commit log for high-throughput batching, billing event audit trails, and data pipelines.
- **Socket.IO**: Real-time bidirectional WebSocket transport for sub-100ms user/driver interactions, location tracking, and trip notifications.

---

## 8. Algorithms, Mathematics & Routing Engines

### Haversine Spherical Distance Formula
Given two points $(\phi_1, \lambda_1)$ and $(\phi_2, \lambda_2)$ with Earth radius $R = 6371$ km:

$$\Delta\phi = \phi_2 - \phi_1, \quad \Delta\lambda = \lambda_2 - \lambda_1$$
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$c = 2\operatorname{atan2}\left(\sqrt{a}, \sqrt{1-a}\right), \quad d = R \cdot c$$

### 20-Meter Proximity PIN Lock
$$\text{Distance in meters} = \text{Haversine}(lat_{\text{driver}}, lon_{\text{driver}}, lat_{\text{pickup}}, lon_{\text{pickup}}) \times 1000$$
If $\text{Distance} > 20\text{m}$, the PIN input is locked with a warning badge until the driver arrives within 20m of the passenger.

### Dynamic Fare Formula
$$\text{Total Fare (₹)} = \max\Big(\text{MinFare}, \; \big(\text{BaseFare} + (d_{\text{km}} \times \text{Rate}_{\text{km}}) + (t_{\text{mins}} \times \text{Rate}_{\text{min}})\big) \times \text{CitySurge}\Big)$$

---

## 9. Line-by-Line Code Breakdown

- **`client/src/components/MapView.jsx`**: Leaflet setup, custom navigation controls (`useMap` zoom & recenter), user zoom persistence, SVG directional markers, and OSRM turn-by-turn road polylines.
- **`client/src/pages/DriverDashboard.jsx`**: Real-time road navigation, speed multiplier controller (`1x`, `2x`, `5x`, `10x`), 20m proximity verification, and automatic offline unload handler.
- **`server/src/controllers/adminController.js`**: Live real-time gross volume aggregations, fleet presence monitoring, and city surge management endpoints with 3-hour expiration.
- **`server/src/services/fareService.js`**: Calculates INR category fares, handles multi-city surge lookups, and manages 3-hour TTL Redis caching.

---

## 10. Multi-Stage Docker Containerization

- **Stage 1 (Vite Builder)**: Installs frontend dependencies and compiles minified static assets to `/dist`.
- **Stage 2 (Production Runner)**: Minimal Node.js Alpine base, non-root user (`USER node`), `dumb-init` PID 1 signal forwarding, automated container healthcheck on `/api/v1/health`.
