# TaskForge — Distributed Job Scheduling & Execution Platform

**Tagline:** Schedule. Execute. Monitor.

TaskForge is an enterprise-grade distributed background job scheduling and execution platform built with **Java 21**, **Spring Boot 3.3**, **PostgreSQL**, **Flyway**, **RabbitMQ**, and a high-performance **React + Vite + Tailwind CSS** dashboard.

---

## 🏗️ Architecture & Core Components

```
                           +------------------------+
                           |  React + Vite Frontend |
                           |  (Tailwind, Recharts)  |
                           +-----------+------------+
                                       | REST APIs
                                       v
                     +------------------------------------+
                     |  TaskForge Core API & Coordinator  |
                     |  - DistributedJobScheduler         |
                     |  - ScheduleCalculator (Cron/Fixed) |
                     |  - Transactional Job Claiming      |
                     +-------+--------------------+-------+
                             |                    |
             Durable State   |                    | AMQP Dispatch
                             v                    v
                  +--------------------+   +-----------------------+
                  |  PostgreSQL / H2   |   |  RabbitMQ Broker      |
                  |  - Schema & Audit  |   |  - taskforge.exchange |
                  |  - Leases & States |   |  - taskforge.dlx(DLQ) |
                  +--------------------+   +-----------+-----------+
                                                       |
                                                       v
                                            +---------------------+
                                            | Worker Fleet Engine |
                                            | - Bounded Pools     |
                                            | - Exponential Retry |
                                            | - Heartbeat Monitor |
                                            +---------------------+
```

### Key Technical Highlights:
1. **Durable Distributed Scheduling:** PostgreSQL acts as the source of truth with version-controlled Flyway schema migrations, indexes on scheduled time, status, and job priority.
2. **Safe Transactional Job Claiming:** Prevents double execution across concurrent workers using status transitions (`SCHEDULED` -> `QUEUED` -> `RUNNING`).
3. **Allowlisted Task Handlers:** Security enforced by design; only allowlisted handlers are executed (`REPORT_GENERATION`, `BATCH_DATA_PROCESS`, `SYSTEM_HEALTH_CHECK`, `SEND_NOTIFICATION`, and `SIMULATED_BENCHMARK_TASK`).
4. **Resilience & Reliability:** Configurable retry policies with exponential backoff and dead-letter queue routing (`taskforge.jobs.dlq`) upon retries exhaustion.
5. **Worker Heartbeat & Reaper:** Online/offline status detection based on actual heartbeat records. Automatically marks stale workers as `OFFLINE` if no heartbeat is received within 30 seconds.
6. **Performance Lab:** Standout interactive benchmarking tool measuring real-time throughput (jobs/sec), latency percentiles (p50, p75, p90, p95, p99), and retry recovery under variable workloads.
7. **Observability:** Spring Boot Actuator, Micrometer Prometheus metrics, and Swagger/OpenAPI documentation.

---

## 🛠️ Tech Stack

- **Backend:** Java 21, Spring Boot 3.3.4, Spring Web, Spring Data JPA, Hibernate, Spring Security, Spring AMQP (RabbitMQ), Flyway, Actuator, Micrometer.
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts.
- **Data & Broker:** PostgreSQL 16, H2 Database (in-memory dev profile), RabbitMQ 3.13.
- **Observability:** Prometheus, Grafana, Spring Actuator `/actuator/health` and `/actuator/prometheus`.

---

## 🚀 Quickstart Guide

### 1. Running Locally (Instant Dev Mode)

The backend comes configured with an in-memory profile ready to run without external database setup:

```bash
# In the backend directory
cd backend
../mvnw.cmd spring-boot:run
```

The API will start on `http://localhost:8080`.

Open Swagger UI at: `http://localhost:8080/swagger-ui.html`

### 2. Running Frontend

```bash
# In the frontend directory
cd frontend
npm install
npm run dev
```

Visit the dashboard at `http://localhost:5173`.

### 3. Running with Docker Compose (Full Distributed Setup)

```bash
docker-compose up -d
```

Services exposed:
- **TaskForge Dashboard:** `http://localhost:3000`
- **Backend API:** `http://localhost:8080`
- **RabbitMQ Management UI:** `http://localhost:15672` (Credentials: `taskforge` / `taskforge_rabbit_password`)
- **Prometheus UI:** `http://localhost:9090`
- **Grafana Dashboard:** `http://localhost:3001` (Credentials: `admin` / `admin`)

---

## 🧪 Testing

```bash
# Run backend tests (Spring Boot, Job Lifecycle, Scheduler & Handler unit tests)
cd backend
../mvnw.cmd test

# Run frontend production build & type checks
cd frontend
npm run build
```

---

## 📊 Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/jobs` | Register and schedule a new background job |
| `GET` | `/api/jobs` | List jobs with status and keyword filter |
| `POST` | `/api/jobs/{id}/trigger` | Trigger a job run immediately |
| `POST` | `/api/jobs/{id}/pause` | Pause an active scheduled job |
| `POST` | `/api/jobs/{id}/resume` | Resume a paused job |
| `GET` | `/api/executions` | View execution history with correlation IDs and logs |
| `POST` | `/api/executions/{id}/retry` | Manually retry a failed execution |
| `GET` | `/api/workers` | Real-time worker cluster nodes and heartbeat status |
| `POST` | `/api/benchmark/run` | Execute controlled stress performance benchmark |
| `GET` | `/api/dashboard/overview` | Aggregated cluster telemetry for dashboard metrics |
| `GET` | `/actuator/prometheus` | Prometheus formatted scrape metric gauge stream |
