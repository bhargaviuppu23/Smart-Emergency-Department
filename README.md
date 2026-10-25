# Smart Emergency Department Queue Optimization Using Java & Data Structures

[![Java](https://img.shields.io/badge/Java-21%20%7C%2025%20LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

> **ACADEMIC & EDUCATIONAL USE DISCLAIMER:**  
> This software is an educational simulation developed to demonstrate **Java Data Structures** (Min-Heap PriorityQueue, ArrayDeque FIFO queues, HashMaps, and ArrayLists) applied to resource scheduling. It is **NOT** a clinically certified medical device and must **NEVER** be used to triage real patients or make actual clinical decisions.

---

## 1. Project Overview & Objectives

In emergency hospital environments, a traditional First-In-First-Out (FIFO) queue fails to meet clinical requirements: a patient presenting with an acute myocardial infarction or stroke cannot wait behind patients with minor abrasions simply because the minor injuries arrived earlier.

This project implements an **Emergency Department Queue Optimization Engine** based on the clinical principles of the **Emergency Severity Index (ESI)**. The application integrates:
1. **Multi-Factor Priority Scheduling**: Patients are scheduled primarily by clinical severity level (Critical > High > Medium > Low).
2. **Deterministic FIFO Tie-Breaking**: Patients presenting with identical clinical severity are scheduled strictly by chronological arrival order using server-side monotonic sequence tie-breakers.
3. **High-Performance In-Memory Algorithms**: Fast $O(\log N)$ heap scheduling and $O(1)$ lookup alongside persistent relational storage.
4. **Transparent Clinical Metrics**: Live calculation of actual wait duration ($t_{\text{treatment start}} - t_{\text{arrival}}$), bed utilization, and throughput trends.

---

## 2. Core Features

- **Executive Operations Dashboard**: Live Key Performance Indicators (Total registered, waiting, critical/emergent, active bed occupancy, completed discharges, and actual mean wait time).
- **Live Deterministic Queue Monitor**: Real-time position tracking (`#1`, `#2`, ...), live elapsed waiting timers, active treatment bed monitor, and single-click patient admission.
- **Patient Registration & Triage Intake**: Input validation with detailed severity criteria guidance, auto-generated unique identifier codes (`ED-YYYYMMDD-XXXX`), and arrival sequence stamping.
- **Dynamic Re-Triage**: Modify patient triage levels if clinical conditions deteriorate; the engine dynamically repositions the patient in the heap in $O(\log N)$ time.
- **Same-Priority FIFO Deque Inspector**: Visual inspect tool demonstrating the separate internal `ArrayDeque` queues managing each individual severity tier.
- **Resource Capacity Control**: Configurable treatment bay capacity (default 1 active resource) preventing concurrent duplicate treatment assignments with HTTP 409 Conflict protection.
- **Waiting-Time Analytics**: Explicitly defined eligible population calculations ($t_{\text{treatment}} - t_{\text{arrival}}$) with severity breakdown and 12-hour hourly volume trend charts.
- **Synthetic Simulation Lab**: Dedicated fictional patient generator with pre-built test scenarios and clean reset mechanisms isolated by `is_demo = true`.
- **Searchable Patient Encounter Records**: Paginated registry with multi-parameter filtering (by status, severity, text query) and full audit history.

---

## 3. System Architecture & Diagram

The system uses a **Hybrid Memory-Persistence Architecture**:
- **Persistence Layer (Durable Source of Truth)**: PostgreSQL (or in-memory H2 for zero-configuration local dev) stores all patient entities, status transitions, and audit logs.
- **Scheduling Layer (In-Memory Optimization)**: `EmergencyQueueEngine` maintains fast min-heaps and lookup tables for active queue scheduling.
- **Startup Reconciliation**: On server launch or restart, Spring Boot triggers `ApplicationReadyEvent` to query all persisted `WAITING` records and re-builds the in-memory queue state deterministically.

```mermaid
flowchart TD
    Client["React + TypeScript Frontend (Vite)"]
    
    subgraph SpringBootApp["Spring Boot 3.3 Backend"]
        Controllers["REST Controllers (Patient, Queue, Analytics, Demo)"]
        Services["Service Layer (QueueService, PatientService, AnalyticsService)"]
        
        subgraph MemoryEngine["EmergencyQueueEngine (In-Memory Data Structures)"]
            PQ["PriorityQueue&lt;PatientQueueEntry&gt; (Min-Heap O(log N))"]
            LookupMap["HashMap&lt;Long, PatientQueueEntry&gt; (O(1) Lookup)"]
            Buckets["EnumMap&lt;Severity, Deque&gt; (FIFO per Severity)"]
            Lock["ReentrantReadWriteLock (Thread Safety)"]
        end
        
        Repositories["Spring Data JPA Repositories"]
    end
    
    Database[("PostgreSQL Database (Durable Truth)")]
    
    Client -->|HTTP / REST JSON| Controllers
    Controllers --> Services
    Services <--> MemoryEngine
    Services --> Repositories
    Repositories --> Database
    Database -.->|Startup Queue Rebuild| MemoryEngine
```

---

## 4. Java Data Structures & Algorithmic Complexity

| Operation | Data Structure | Time Complexity | Space Complexity | Clinical Purpose |
| :--- | :--- | :---: | :---: | :--- |
| **Patient Arrival / Enqueue** | `PriorityQueue<PatientQueueEntry>` | $O(\log N)$ | $O(N)$ | Inserts patient into binary min-heap; bubbles up according to triage severity. |
| **Peek Next Eligible Patient** | `PriorityQueue.peek()` | $O(1)$ | $O(1)$ | Instantly inspects the highest-priority patient awaiting a treatment bed. |
| **Poll Next Patient (Admit)** | `PriorityQueue.poll()` | $O(\log N)$ | $O(1)$ | Extracts the root patient, replaces with leaf, and sifts down to restore heap property. |
| **Lookup by Patient ID** | `HashMap<Long, PatientQueueEntry>` | $O(1)$ | $O(N)$ | Avoids $O(N)$ linear scan of heap when checking queue status or patient details. |
| **Same-Priority Sub-Queue** | `ArrayDeque<PatientQueueEntry>` | $O(1)$ | $O(K)$ | Maintains pure FIFO queue within each individual severity category. |
| **Deterministic Snapshot** | `ArrayList + Collections.sort()` | $O(N \log N)$ | $O(N)$ | Creates an ordered array for UI display, overcoming `PriorityQueue` iteration disorder. |
| **Dynamic Re-Triage** | `remove()` + `enqueue()` | $O(N) + O(\log N)$ | $O(1)$ | Removes patient entry, updates severity, and re-enqueues into the heap. |

### Comparator Specification (`PatientPriorityComparator`)

```java
public int compare(PatientQueueEntry p1, PatientQueueEntry p2) {
    // 1. Primary: Acuity Rank (CRITICAL=1, HIGH=2, MEDIUM=3, LOW=4)
    int severityCmp = Integer.compare(
        p1.getSeverity().getPriorityRank(),
        p2.getSeverity().getPriorityRank()
    );
    if (severityCmp != 0) return severityCmp;

    // 2. Secondary: Chronological arrival time (FIFO)
    int timeCmp = p1.getArrivalTime().compareTo(p2.getArrivalTime());
    if (timeCmp != 0) return timeCmp;

    // 3. Deterministic Tie-Breaker: Monotonic sequence number
    return Long.compare(p1.getArrivalSequenceNumber(), p2.getArrivalSequenceNumber());
}
```

---

## 5. Technology Stack

- **Backend**: Java 21 / 25 LTS, Spring Boot 3.3.5, Spring Data JPA, Hibernate ORM, Apache Tomcat, Springdoc OpenAPI 2.6.
- **Frontend**: React 18, TypeScript 5, Vite 5, Tailwind CSS 3.4, Lucide React, Recharts.
- **Database**: PostgreSQL 16 (production), H2 Database (local zero-setup mode).
- **Testing**: JUnit 5, Mockito, AssertJ, MockMvc.
- **DevOps**: Docker, Docker Compose, Render Blueprint (`render.yaml`), Vercel SPA configuration (`vercel.json`).

---

## 6. REST API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/patients` | Register new patient, assign code, and enqueue into PriorityQueue |
| `GET` | `/api/patients` | Query paginated patient records with filters (`search`, `severity`, `status`) |
| `GET` | `/api/patients/{id}` | Retrieve patient details and queue position |
| `PATCH` | `/api/patients/{id}` | Update patient notes or re-triage severity level |
| `POST` | `/api/patients/{id}/start-treatment` | Admit waiting patient into active treatment bed |
| `POST` | `/api/patients/{id}/complete-treatment` | Complete treatment, discharge patient, record duration |
| `POST` | `/api/patients/{id}/cancel` | Cancel patient encounter safely from queue |
| `GET` | `/api/queue` | Get live deterministically ordered PriorityQueue snapshot |
| `GET` | `/api/queue/next` | Inspect next eligible patient at the head of the queue |
| `POST` | `/api/queue/start-next` | Admit highest-priority patient into treatment bed |
| `GET` | `/api/queue/fifo/{severity}` | Inspect internal FIFO `ArrayDeque` for a specific severity |
| `GET` | `/api/analytics/summary` | Real-time operations summary metrics |
| `GET` | `/api/analytics/waiting-times` | Documented waiting time calculations and hourly volume trends |
| `GET` | `/api/analytics/severity-distribution` | Waiting patient count and percentage breakdown by severity |
| `GET` | `/api/events` | Audit timeline of triage and queue status events |
| `POST` | `/api/demo/generate` | Generate synthetic simulation patients with varied severities |
| `DELETE` | `/api/demo/reset` | Purge simulation patients and reconcile PriorityQueue |
| `GET` | `/actuator/health` | Spring Boot health and readiness probe |
| `GET` | `/swagger-ui.html` | Interactive Swagger / OpenAPI documentation UI |

---

## 7. Local Development & Setup Instructions

### Prerequisites
- **Java**: OpenJDK 21 or 25 LTS.
- **Node.js**: Node 18+ (Node 22 LTS recommended) and npm.
- **Maven**: Maven 3.9+ (or use wrapper).

### 1. Run Backend Locally (Zero-Setup H2 Database)
Open Windows PowerShell:
```powershell
cd C:\Users\bharg\.gemini\antigravity\scratch\smart-emergency-queue\backend
mvn spring-boot:run
```
*The backend starts at `http://localhost:8080`. H2 database console is enabled at `http://localhost:8080/h2-console`.*

### 2. Run Frontend Locally
Open a second Windows PowerShell terminal:
```powershell
cd C:\Users\bharg\.gemini\antigravity\scratch\smart-emergency-queue\frontend
npm run dev
```
*The frontend starts at `http://localhost:5173` with automatic API proxying to `http://localhost:8080`.*

---

## 8. Build & Automated Testing Commands

### Backend Automated Test Suite
```powershell
cd backend
mvn test
```
*Executes unit and integration tests covering priority ordering, FIFO tie-breaking, preemption, lookup, capacity limits, and startup queue reconstruction.*

### Backend Production Packaging
```powershell
cd backend
mvn clean package -DskipTests
```
*Generates executable standalone JAR at `backend/target/smart-emergency-queue-backend-1.0.0.jar`.*

### Frontend Production Build
```powershell
cd frontend
npm run build
```
*Compiles TypeScript and bundles optimized static assets to `frontend/dist`.*

---

## 9. Deployment Guide

### A. Run with Docker Compose (Full Stack + PostgreSQL)
```powershell
cd C:\Users\bharg\.gemini\antigravity\scratch\smart-emergency-queue
docker-compose up --build -d
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- PostgreSQL: `localhost:5432`

### B. Production Cloud Deployment (Vercel + Render + PostgreSQL)

#### 1. PostgreSQL Database
- Create a free managed PostgreSQL database on [Render](https://render.com), [Neon](https://neon.tech), or [Supabase](https://supabase.com).
- Copy the External Database Connection URL (e.g. `postgresql://user:pass@host/emergencydb`).

#### 2. Backend Deployment on Render
1. Connect your Git repository to Render.
2. Select **New Web Service** using the Docker runtime.
3. Configure Environment Variables:
   - `PORT`: `8080`
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `DATABASE_URL`: `jdbc:postgresql://<host>:5432/<dbname>`
   - `SPRING_DATASOURCE_USERNAME`: `<db_user>`
   - `SPRING_DATASOURCE_PASSWORD`: `<db_password>`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend-domain.vercel.app`
4. Health Check Path: `/actuator/health`

#### 3. Frontend Deployment on Vercel
1. Import repository to [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend-app.onrender.com`

---

## 10. Screenshots & UI Progression

| View | Description |
| :--- | :--- |
| **Operations Dashboard** | KPI cards, Next-in-line callout, severity distribution bar chart, hourly throughput lines, and live events audit stream. |
| **Live Priority Queue** | Deterministic position ranking (`#1`, `#2`), live elapsed timers, active treatment bay manager, and sub-queue FIFO inspector. |
| **Patient Registration** | Clean form with ESI clinical criteria guides and quick presets (STEMI, Asthma, Sprain) for rapid simulation. |
| **Encounter Records** | Multi-attribute search, severity & status filters, and detailed patient modal with chronological event timeline. |
| **Waiting Analytics** | Transparent formulas, eligible population counters, wait extremes, and urgency tier breakdowns. |
| **Simulation Lab** | Synthetic cohort generation with explicit priority leapfrog and FIFO tie-breaker demonstrations. |
| **Architecture Guide** | Interactive reference explaining the Big-O complexities and hybrid memory-database reconciliation. |

---

## 11. Troubleshooting Common Issues

1. **Port 8080 already in use**:
   ```powershell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
   ```
2. **Database loopback connection error in sandbox**:
   Ensure the application is run with local host permissions (`BypassSandbox: true` or native terminal) as Windows Java NIO requires loopback sockets (`127.0.0.1`) for pipe initialization.
3. **Frontend CORS error**:
   Check that `CORS_ALLOWED_ORIGINS` on the backend includes the exact origin of the frontend (e.g., `http://localhost:5173` or your Vercel URL).
