# 🚀 Oxima Ride-Hailing Platform - Comprehensive Running & Installation Guide

Welcome to **Oxima**, an enterprise-grade, real-time MERN ride-hailing and fleet management platform engineered with **Node.js, Express, React 18, Vite, MongoDB (Geospatial 2dsphere), Redis (Spatial GEO & 3hr Surge Cache), Apache Kafka (Telemetry Streaming), and Open Source Routing Machine (OSRM Road Navigation)**.

---

## 📦 Exact Software & Technology Versions

| Layer | Technology | Exact Version Used | Purpose in Oxima |
| :--- | :--- | :--- | :--- |
| **Runtime** | **Node.js** | `v20.x` / `v22.x` (LTS) | Asynchronous backend server execution engine |
| **Package Manager** | **npm** | `v10.x` / `v12.x` | Dependency resolution and workspace scripting |
| **Frontend Framework** | **React.js** | `18.3.1` | Declarative UI component architecture |
| **Build Tool & Bundler** | **Vite** | `6.4.3` | Instant Hot Module Replacement (HMR) & ESBuild production bundling |
| **CSS Utility Framework** | **Tailwind CSS** | `3.4.17` | Responsive mobile styling & dark glassmorphic design system |
| **Mapping Engine** | **Leaflet & React-Leaflet** | `leaflet 1.9.4`, `react-leaflet 4.2.1` | Interactive vector maps, turn-by-turn road polylines & vehicle disc markers |
| **UI Icons** | **Lucide React** | `0.468.0` | SVG icons for vehicles, navigation, and controls |
| **Backend Framework** | **Express.js** | `4.19.2` | RESTful API routing, middleware execution, and route dispatching |
| **Primary Database** | **MongoDB** | `7.0.x` | Document persistence, ACID transactions, and `2dsphere` spatial geospatial indexes |
| **ODM (Object Data Modeling)** | **Mongoose** | `8.4.1` | Schema enforcement, document validation, lifecycle hooks, and aggregations |
| **In-Memory Cache & GEO** | **Redis** | `7.0.x` (via `ioredis 5.4.1`) | Redis GEO indexing (`GEOADD`, `GEOSEARCH`) and 3-Hour City Surge TTL caching |
| **Message Streaming Bus** | **Apache Kafka** | `7.5.0` (via `kafkajs 2.2.4`) | High-throughput telemetry streaming with graceful fallback |
| **WebSocket Engine** | **Socket.IO** | `4.7.5` | Bidirectional real-time event broadcasting (Rides, Fleet, Location updates) |
| **Schema Validation** | **Zod** | `3.23.8` | Type-safe runtime schema parsing and request payload validation |
| **Authentication** | **JSON Web Token (JWT) & bcryptjs** | `jsonwebtoken 9.0.2`, `bcryptjs 2.4.3` | Cryptographic session tokens and salted password hashing |
| **Routing & Directions** | **OSRM Project API** | `v1 Driving API` | Road turn-by-turn routing with Contraction Hierarchy shortest-path graph calculations |

---

## 🛠️ Prerequisites Before Running

Ensure the following tools are installed on your host machine:
1. **Node.js**: `v20.0.0` or higher ([Download Node.js](https://nodejs.org/))
2. **MongoDB**: Local Community Server (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI ([Download MongoDB](https://www.mongodb.com/try/download/community))
3. **Redis**: Local Redis Server (`redis://127.0.0.1:6379`) or Docker Redis ([Download Redis](https://redis.io/downloads/))
4. **Git**: Installed and available in PATH.
5. *(Optional)* **Docker & Docker Compose**: For containerized single-command execution.

---

## 💻 Option A: Running from Scratch on Local Machine (Step-by-Step)

### Step 1: Clone Repository & Navigate to Project Directory
```bash
git clone <repository_url>
cd antihgravity_env
```

### Step 2: Configure Environment Variables
Create or verify `.env` files for both Server and Client.

#### 1. Backend `.env` (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/oxima_db
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
KAFKA_BROKERS=localhost:9092
JWT_SECRET=oxima_super_secure_jwt_secret_key_2026_dev_mode
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

#### 2. Frontend `.env` (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

### Step 3: Install Dependencies
Open your terminal and install packages for both backend and frontend:

```bash
# 1. Install Backend Dependencies
cd server
npm install

# 2. Install Frontend Dependencies
cd ../client
npm install
cd ..
```

---

### Step 4: Seed Database with Initial All-India Fleet & Test Accounts
Run the automated seed script to populate sample drivers, admin credentials, and sample trip records:

```bash
cd server
node src/utils/seedData.js
cd ..
```

---

### Step 5: Start Backend and Frontend Servers

#### Terminal 1: Launch Backend Server
```bash
cd server
node src/server.js
# Output: 🚀 Oxima Backend Server is running on port 5000
```

#### Terminal 2: Launch Frontend Client
```bash
cd client
npm run dev
# Output: ➜ Local: http://localhost:5173/
```

Open your browser at **`http://localhost:5173`**!

---

## 🐳 Option B: Running with Docker & Docker Compose (Containerized Single Command)

To run the full stack including **MongoDB, Redis, Kafka, Zookeeper, and Oxima Multi-Stage Application** in Docker containers:

### Step 1: Build & Launch Containers
```bash
docker-compose up --build -d
```

### Step 2: Check Container Health
```bash
docker-compose ps
```

### Step 3: View Live Application Logs
```bash
docker-compose logs -f oxima-app
```

### Step 4: Stop Containers
```bash
docker-compose down
```

---

## 🔑 Pre-Configured Test Credentials

| Role | Email | Password | Role Description |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@oxima.com` | `adminpassword123` | Real-time fleet analytics, surge multiplier manager (3hr TTL), vehicle RC approvals |
| **Passenger / Rider** | `rider@oxima.com` | `password123` | Book rides anywhere across India, turn-by-turn road navigation, UPI QR / Cash payments |
| **Driver (Auto)** | `venkatesh.auto@oxima.com` | `password123` | Bajaj Auto (`RC-TS-AUTO-202`), manual online toggle, road simulation speed controls |
| **Driver (Mini)** | `rizwan.mini@oxima.com` | `password123` | Maruti WagonR (`RC-TS-MINI-303`), PIN arrival verification |
| **Driver (Sedan)** | `srinivas.sedan@oxima.com` | `password123` | Hyundai Verna (`RC-TS-SEDAN-404`) |
| **Driver (SUV)** | `anand.suv@oxima.com` | `password123` | Toyota Innova (`RC-TS-SUV-505`) |
| **Driver (EV)** | `naresh.ev@oxima.com` | `password123` | Tata Nexon EV (`RC-TS-EV-606`) |

---

## 🧪 How to Test End-to-End Rides in Browser

1. **Open Tab 1 (Rider)**: Navigate to `http://localhost:5173` $\rightarrow$ Sign in with `rider@oxima.com` / `password123`.
2. **Search Destination**: Type any Indian landmark (e.g. *Inorbit Mall*, *BKC Mumbai*, *Koramangala*, *Connaught Place*) or click a quick destination pill. Observe turn-by-turn road polyline in Apple Blue.
3. **Open Tab 2 / Incognito (Driver)**: Navigate to `http://localhost:5173` $\rightarrow$ Sign in with `venkatesh.auto@oxima.com` / `password123`. Click **"Go Online"**.
4. **Request Ride (Tab 1)**: Select Auto / Mini and click **"Order"** $\rightarrow$ Observe radar search animation.
5. **Accept & Navigate (Tab 2)**: Driver accepts offer $\rightarrow$ Road path from Driver to Pickup appears in amber dashed lines. Adjust Driving Speed (`1x`, `2x`, `5x`, `10x`) and click **"Start Simulation"**!
6. **20-Meter PIN Verification**: Once vehicle is within 20m of pickup, driver enters passenger's 4-digit PIN.
7. **Complete & Pay**: Driver views UPI QR code, clicks **"Confirm Payment"**, and both parties rate the trip!
