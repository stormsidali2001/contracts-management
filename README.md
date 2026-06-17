# CONTRACT MANAGEMENT PLATFORM

![Project Thumbnail](apps/web/public/marketing-assets/project-thumbnail.png)

A full-stack web application for managing organizational contracts and conventions across departments, featuring real-time, horizontally scalable live updates and automated expiry alerts.

---

## 📝 Problem & Results

**Problem:** The client needed an internal tool to centralize contract and convention tracking across departments, with visibility into vendor relationships, execution statuses, and upcoming expiry deadlines.

**Results:**
*   **Real-time Event Pipeline:** Socket.io backed by a Redis Pub/Sub broker routes live signals (`INC_AGR`, `SEND_EVENT`, `send_notification`) to scoped client rooms. Dashboard stats and notifications update instantly across all connected users with zero polling.
*   **DDD & CQRS Architecture:** Domain events (`AgreementCreated`, `AgreementExecuted`, `ContractExpiring`) flow through `@nestjs/cqrs` EventBus into handlers that emit WebSocket signals, triggering TanStack Query cache invalidations for zero-latency UI updates.
*   **Scalable Oversight:** Manages 500+ agreements, 300+ vendors, and multi-department hierarchies with role-based access (Admin / Employee / Juridical).
*   **Automated Expiry Notifications:** Implemented 30/7/1-day alerts via daily cron → domain event → Redis-brokered Socket.io → per-user in-app alert.
*   **Dynamic Statuses:** 6 derived contract statuses computed purely from date fields, ensuring no stored state and no stale data.

---

## 🚀 Core Features

### 📊 Real-time Dashboard & Statistics
![Real-time Statistics](apps/web/public/marketing-assets/real-time-statistics/frame-and-content-blended.jpeg)
KPIs update the moment a contract is created or modified. No refresh needed. Track 500+ contracts with filterable date ranges and live WebSocket updates.

### 📝 Contract Status Tracking
![Contract Status Tracking](apps/web/public/marketing-assets/contract-status-tracking/merged.png)
Filter and track all agreements by status, vendor, direction, or expiry date. Color-coded status pills (Executed, In Execution, Delayed, Not Executed) provide instant visibility.

### 🔔 Automated Expiry Alerts
![Automated Expiry Alerts](apps/web/public/marketing-assets/automated-expiry-alert/merged.png)
Automatic alerts sent 30, 7, and 1 day before expiry. No manual follow-up required. Notifications are delivered in real-time to Juridical users.

### 👥 Role-Based Access Control
![Access Control](apps/web/public/marketing-assets/access-control.png)
Three distinct user roles (Admin, Employee, Juridical), each with scoped permissions and a tailored dashboard view. Each user sees exactly what they need.

### 🏢 Organizational Hierarchy
![Direction Hierarchy](apps/web/public/marketing-assets/direction-heirarchy/merged.png)
Structure your organization into directions and departments to scope contracts precisely and filter statistics by organizational unit.

### 🤝 Vendor Management
![Vendor Management](apps/web/public/marketing-assets/vendor-management/merged.png)
Centralize all vendor information and track their associated contracts in one place. Includes a searchable and filterable directory with instant contract counts.

### 🎓 Guided Onboarding
![Guided Tour](apps/web/public/marketing-assets/guided-tour/merged.png)
Role-aware interactive step-by-step tour that walks new users through the platform on first login, highlighting key UI elements tailored to their role.

---

## 🛠 Tech Stack

*   **Backend:** NestJS, CQRS (`@nestjs/cqrs`), TypeORM, PostgreSQL 16, Redis (Pub/Sub broker), Socket.io, `@nestjs/schedule`, Nodemailer.
*   **Frontend:** Next.js 16 (App Router), TanStack Query (cache invalidation), Zustand, CSS Modules.
*   **Infra:** pnpm + Turborepo monorepo, Docker Compose, shared `@contracts/types` package.
*   **Patterns:** Domain-Driven Design (DDD), Domain Events, CQRS, Repository Pattern, RBAC, JWT Auth.

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- [Docker](https://www.docker.com/) (for PostgreSQL and Redis)
- [pnpm](https://pnpm.io/) 10.6.3+
- Node.js 18+

### 2. Clone & Install
```bash
git clone https://github.com/stormsidali2001/contracts-management
cd contracts-management
pnpm install
```

### 3. Start Infrastructure
```bash
docker compose up -d
```

### 4. Configure Environment
Create `apps/api/.env` with your database and Redis credentials (see `apps/api/.env-example`).

### 5. Start Development
```bash
pnpm dev
```

---

## 🧪 Testing & Data Generation

### Generate Fake Data
```bash
pnpm generate:directions
pnpm generate:users -- 200
pnpm generate:vendors -- 300
pnpm generate:agreements -- 500
pnpm generate:accounts
```

### Test Accounts
| Role | Username | Password |
|------|----------|----------|
| ADMIN | admin.admin | 123456 |
| JURIDICAL | juridical.adala | 123456 |
| EMPLOYEE | storm.sidali | 123456 |

### Running Tests
```bash
# Backend Tests
cd apps/api
pnpm test

# E2E Tests (Playwright)
cd apps/web
pnpm test:e2e:mock  # Mock mode
pnpm test:e2e:prod  # Prod mode (requires backend)
```
