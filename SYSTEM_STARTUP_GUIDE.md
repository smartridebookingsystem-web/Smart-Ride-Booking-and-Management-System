# 🚀 Smart Ride Booking System — System Startup & Operations Manual

---

## 📋 Prerequisites
Ensure **Docker Desktop for Windows** is installed and actively running on your PC.

---

## 🛠️ Step 1: Open Terminal in Project Root
Open PowerShell, Command Prompt, or VS Code Terminal inside the project root folder:
```powershell
cd "d:\Project\smart ride booking system\Smart-Ride-Booking-and-Management-System"
```

---

## 🚀 Step 2: Start All Microservices & Frontends

### 🟢 Option A: Normal Fast Start (Recommended)
Starts all 7 containers using existing built images:
```powershell
docker compose up -d
```

### 🛠️ Option B: Rebuild & Start (Use if you modified Java/Backend files)
Recompiles Java source code, builds Docker images, and starts all containers:
```powershell
docker compose up --build -d
```

---

## 🔍 Step 3: Verify Container Status
Check that all containers show status **`Up`** or **`Running`**:
```powershell
docker compose ps
```

---

## 🌐 Application URLs & Endpoints

| Component | Role & Functionality | Live Browser URL |
| :--- | :--- | :--- |
| 🛡️ **Admin Dashboard** | Driver verification, View PDF/Photo, Status Updates & Deletions | [http://localhost:5173](http://localhost:5173) |
| 🚗 **Driver Portal** | Driver registration, Document Upload & Driver Dashboard | [http://localhost:5174](http://localhost:5174) |
| 🛵 **Rider Portal** | Rider registration, Ride Booking & Profile | [http://localhost:5175](http://localhost:5175) |
| 🌐 **API Gateway** | Microservice REST API routing | [http://localhost:8080](http://localhost:8080) |
| 🔍 **Eureka Discovery** | Spring Cloud Service Registry Dashboard | [http://localhost:8761](http://localhost:8761) |
| 🗄️ **MySQL Database** | MySQL 8.0 (DB: `p03_srbms`, User: `root`, Pass: `system`) | `localhost:3307` |

---

## ⚡ Hot Reload (HMR) for Frontend Development
- Any changes saved in VS Code for React files (`.jsx`, `.js`, `.css`) will **automatically update live in your browser** without rerunning Docker commands!

---

## 🛠️ Useful Log & Maintenance Commands

### View Logs of Auth Service:
```powershell
docker logs -f srbms-auth-service
```

### View Logs of Admin Frontend:
```powershell
docker logs -f srbms-frontend-admin
```

### Restart a Single Service (e.g. `auth-service`):
```powershell
docker compose restart auth-service
```

---

## 🛑 How to Stop the System
To cleanly shut down and stop all running containers:
```powershell
docker compose down
```
