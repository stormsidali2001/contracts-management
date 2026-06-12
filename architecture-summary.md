# Contracts Management System - Project Summary

An enterprise-grade, monorepo-based platform designed to streamline the lifecycle of legal agreements, vendor relationships, and organizational hierarchies. Built with a focus on scalability, maintainability, and domain integrity using modern architectural patterns.

## 🏗️ Monorepo Architecture
The project is structured as a high-performance **Turborepo** monorepo using **pnpm workspaces**, ensuring efficient dependency management and fast build times.

- **`apps/api`**: A robust NestJS backend implementing Domain-Driven Design (DDD).
- **`apps/web`**: A modern Next.js frontend with heavy data visualization and real-time capabilities.
- **`packages/types`**: Shared TypeScript definitions ensuring type safety across the entire stack.

---

## 🛡️ Backend Architecture: Clean Architecture & DDD
The backend is built following **Clean Architecture** principles, ensuring the core business logic is completely decoupled from infrastructure, frameworks, and external tools. Using the **Dependency Inversion Principle**, all dependencies point inwards toward the Domain.

### 1. Physical Directory Structure & Subdomains
The system is strategically divided into **Core** (Agreements), **Supporting** (Hierarchy, Stats), and **Generic** (IAM, Infrastructure) subdomains. Each module is strictly organized to enforce Clean Architecture:
- `domain/`: Pure business logic (Aggregates, Value Objects, Domain Events, Repository Interfaces).
- `application/`: Use cases and services that orchestrate domain logic.
- `infrastructure/`: Framework-specific implementations (Persistence, Controllers, **Presenters**, Handlers).

### 2. Deep Dive: Aggregate Roots (The Core of the Domain)
The system has **five Aggregate Roots**, each owning its own consistency boundary. No cross-aggregate state mutation is ever performed in a single transaction:

- **`Agreement` Aggregate** — Core domain, manages the full contract/convention lifecycle.
  - **Derived State**: `status` is a computed getter (`get status()`) based on execution date fields vs. the expiration date — never stored as a redundant column in the DB. The same business logic is mirrored in a SQL `CASE` expression in the repository for aggregate stat queries.
  - **Invariants**: `execute()` enforces that start ≥ signature date, start < end date, and the agreement isn't already executed — all via pure domain errors before any persistence call.
  - **References other aggregates by ID only**: Stores `vendorId`, `directionId`, `departementId` as plain strings — never holds references to other aggregate objects, following DDD's cross-aggregate access by identity rule.

- **`Vendor` Aggregate** — Manages external contractor data, supports full CRUD lifecycle with event emission on every mutation (`VendorCreatedEvent`, `VendorUpdatedEvent`, `VendorDeletedEvent`).
  - **Deletion Guard**: `canBeDeleted(agreementCount): boolean` is a domain-level business rule that prevents removing a vendor linked to active contracts, enforced before any DB call.

- **`Direction` Aggregate** — The most structurally complex aggregate, managing the entire organizational hierarchy.
  - **Child Entity**: `Departement` is a **child entity** of `Direction`, not an independent aggregate. All mutations to departments occur through the `Direction` aggregate root to preserve the consistency boundary.
  - **Encapsulated collection**: Departments are held in a private `_departements: Departement[]` field, exposed only as a readonly view (`get departements()`), preventing external mutation entirely.
  - **Invariants on child entity management**:
    - `addDepartement()` throws `ConflictError` if a department with the same title or abbreviation already exists within the direction.
    - `updateDepartement()` throws `NotFoundError` if the target doesn't exist, and `ConflictError` on duplicate naming.
    - `removeDepartement()` throws `ForbiddenError` if the department still has users (`dp.hasEmployees()`), preventing orphaned employees.
    - `canBeDeleted()` checks recursively that none of its departments have employees before the Direction itself is removed.
  - **5 Domain Events**: `DirectionCreatedEvent`, `DirectionUpdatedEvent`, `DepartementAddedEvent`, `DepartementUpdatedEvent`, `DepartementRemovedEvent`.

- **`User` Aggregate** — Manages the user's profile, role, and organizational placement.
  - **Deferred Event Emission**: `create()` does NOT immediately emit a domain event. Instead, a dedicated `recordCreated(deptAbbr, dirAbbr)` method is called *after* persistence (once the org abbreviations are resolved), attaching them to the event payload. This prevents data-incomplete events from being dispatched.
  - **Fine-grained mutations**: Separate methods for `update()`, `updateImage()`, and `toggleNotifications()` ensure each interaction is explicit and auditable.
  - **3 Domain Events**: `UserCreatedEvent`, `UserUpdatedEvent`, `UserDeletedEvent` — each carrying the full organizational context (`directionId`, `departementId`, abbreviations) for downstream handlers.

- **`UserCredentials` Aggregate** — A separate aggregate deliberately decoupled from the `User` profile, containing all security-sensitive data.
  - **Separation of Concerns**: Authentication state (`passwordHash`, `refreshTokenHash`, `passwordToken`) is isolated from the domain profile. This follows the **Single Responsibility Principle** at the aggregate level — compromising credentials does not expose profile data within the same boundary.
  - **Password Reset Lifecycle**: Full token lifecycle encapsulated in the aggregate: `requestPasswordReset()` stores the hashed token, `resetPassword()` updates the hash and clears the token in a single atomic operation, `clearPasswordToken()` cleans up.
  - **Refresh Token Management**: `setRefreshToken()` and `clearRefreshToken()` manage the JWT refresh token hash, enabling stateful logout without a separate token blacklist table.

### 3. The Presenter & View Pattern (Inter-Layer Communication)
A standout feature of this architecture is the sophisticated handling of data flow between the API and UI:
- **Shared `views/`**: Located in `packages/types`, these are the strictly typed "Read Models" (e.g., `AgreementView`) that act as a formal contract between the backend and frontend.
- **Presenters**: Located in the infrastructure layer (e.g., `AgreementPresenter`), these are responsible for transforming complex Domain Aggregates into simple, shared View models. This ensures the Domain is never leaked to the API response.
- **Data Projection**: Presenters handle the aggregation of data from multiple sources (e.g., merging `Agreement` state with hierarchical `direction` data) without polluting the core entities.

### 4. Domain Layer (The Pure Center)
- **Framework Independence & Error Handling**: The domain is HTTP/Framework agnostic. It throws custom, pure errors (e.g., `NotFoundError`, `ConflictError`). A custom `DomainExceptionFilter` dynamically intercepts these and maps them to HTTP statuses, preventing abstraction leaks.
- **Aggregate Roots**: Encapsulates core business logic and ensures consistency. Aggregates do NOT inject event buses directly. Instead, they record internal events and expose a `pullEvents()` method.
- **Domain Events**: Triggers side effects across subdomains (e.g., a new agreement triggers a notification).
- **Reconstitution**: Cleanly distinguishes between object creation and reconstruction from persistence.

### 5. Application Layer: CQRS Event Integration
- **Use Case Orchestration**: Clean separation of services that handle specific business flows. Services fetch Aggregates, invoke domain behaviors, persist State, and then publish recorded events via NestJS's **CQRS `EventBus`**.
- **Command/Service Pattern**: Highly testable, focused logic.

### 6. Infrastructure Layer
- **Persistence**: TypeORM `QueryBuilder` with role-aware SQL and domain mappers (`toDomain`, `toDetail`).
- **Real-time Communication**: Socket.IO backed by a **Redis Pub/Sub adapter** (`@socket.io/redis-emitter`). Clients join rooms on connection using a room convention (`role`, `dept:<id>`, `user:<id>`), making the system horizontally scalable across multiple API processes.
- **Real-time Dashboard Updates**: When an agreement is created or executed, the `AgreementCreatedHandler` broadcasts an `INC_AGR` signal via WebSocket to all clients in the relevant department and role rooms. The frontend listens for this signal and triggers a TanStack Query cache invalidation, causing a live refetch of the statistics — **without any polling**.
- **Scheduled Jobs**: `@nestjs/schedule` cron jobs for daily contract expiry checks at 08:00.
- **File Storage**: Multer-based disk storage with magic-byte MIME validation for secure PDF and image uploads.

---

## 💻 Frontend Architecture: Feature-Sliced Design (FSD)
The frontend is built for extreme scalability and maintainability by bypassing standard flat folder layouts in favor of a strictly modular, Domain-Driven approach on the client.

- **Feature-Driven Architecture**: Code is co-located in `apps/web/features/` (e.g., `contract`, `vendors`, `direction`). Each feature encapsulates its own `components/`, `queries/`, and `models/`, ensuring high cohesion and low coupling.
- **Stack**: Next.js 16 (App Router), React 19, TypeScript.
- **State Management Ecosystem**: 
  - **TanStack Query (v5)**: Feature-scoped mutations and queries for sophisticated server-state synchronization, caching, and optimistic updates.
  - **Zustand**: Lightweight, high-performance client-side global state.
- **UI/UX Excellence**: 
  - **Material UI (MUI)**: For a professional, consistent design system.
  - **Framer Motion**: For smooth, micro-interactions and premium transitions.
  - **Data Visualization**: Advanced reporting using **ApexCharts**, **Chart.js**, and **Recharts**.
- **User Onboarding**: Integrated **Onborda** for interactive product tours.

---

## 📋 Functional & Non-Functional Requirements

---

### ✅ Functional Requirements (FR)

#### FR-1 — Contract & Convention Lifecycle Management
- **FR-1.1** The system shall allow Juridical users to create new agreements (contracts or conventions), associating each with a vendor, a direction, and a department.
- **FR-1.2** Each agreement shall carry a unique reference number; the system shall reject creation if the number already exists.
- **FR-1.3** The system shall allow Juridical users to mark an agreement as executed by providing a start date, end date, and an observation note.
- **FR-1.4** The system shall validate execution dates: the start date must be ≥ signature date and strictly < end date. An already-executed agreement cannot be re-executed.
- **FR-1.5** Agreement status shall be **derived dynamically** from date fields: `not_executed`, `in_execution`, `in_execution_with_delay`, `executed`, `executed_with_delay`.
- **FR-1.6** All users shall be able to browse agreements paginated and filtered by type, status, amount range, date range, vendor, direction, and department.
- **FR-1.7** Employees shall only see agreements belonging to their own department. Admins and Juridicals can filter across all departments.
- **FR-1.8** Juridical users shall be able to attach a signed PDF document to an agreement via upload.
- **FR-1.9** Any authenticated user shall be able to download a contract document via its filename.

#### FR-2 — Vendor Management
- **FR-2.1** Juridical users shall be able to create, update, and delete vendors with attributes: company name, NIF, NRC, address, mobile and home phone numbers.
- **FR-2.2** The system shall prevent deletion of a vendor that still has linked agreements, enforcing this as a domain-level invariant.
- **FR-2.3** All authenticated users shall be able to browse vendors with pagination, full-text search, and sorting.
- **FR-2.4** The system shall expose vendor creation statistics (new vendors per time period).

#### FR-3 — Organizational Hierarchy Management
- **FR-3.1** Admins shall be able to create, update, and delete Directions (top-level org units).
- **FR-3.2** A direction cannot be deleted if any of its departments have assigned employees.
- **FR-3.3** Authenticated users shall be able to create, update, and delete Departments within a direction.
- **FR-3.4** A department cannot be deleted if it still has employees assigned to it.
- **FR-3.5** No two departments within the same direction shall share the same title or abbreviation.

#### FR-4 — Identity, Access & User Management
- **FR-4.1** Only Admins shall be able to register new user accounts, assigning them a role (Admin, Juridical, Employee, Chief).
- **FR-4.2** Users shall authenticate via email/password and receive a short-lived JWT access token plus a long-lived refresh token stored as an HTTP-only cookie.
- **FR-4.3** Any authenticated user shall be able to refresh their access token using the refresh cookie without re-entering credentials.
- **FR-4.4** Users shall be able to log out, which immediately invalidates their refresh token server-side.
- **FR-4.5** Users shall be able to reset their password via a time-limited email token (forgot-password flow).
- **FR-4.6** Authenticated users shall be able to change their password directly while logged in.
- **FR-4.7** The system shall expose a permissions endpoint returning the current user's role-based access policy.
- **FR-4.8** Admins shall be able to update, disable, and delete user accounts.
- **FR-4.9** Users shall be able to upload and update their profile picture.
- **FR-4.10** Users shall be able to toggle their notification subscription preference.

#### FR-5 — Real-Time Notifications
- **FR-5.1** When an agreement is created, all users in the relevant department shall receive a real-time in-app notification identifying the agreement type and vendor.
- **FR-5.2** All Juridical users shall receive a real-time notification when any agreement is created anywhere in the organization.
- **FR-5.3** When an agreement is executed, a system audit event shall be broadcast to all users in the relevant department and role rooms in real time.
- **FR-5.4** Juridical users shall receive a notification when a contract is 30, 7, or 1 day(s) away from expiry, delivered by a daily scheduled cron job.
- **FR-5.5** Users shall be able to fetch their full notification history, and mark individual or all notifications as read.
- **FR-5.6** Users shall be able to opt out of receiving notifications.

#### FR-6 — Real-Time Dashboard & Audit Log
- **FR-6.1** The dashboard shall display live KPI statistics: agreement count by status, agreement count by type (contract vs. convention), and vendor growth metrics.
- **FR-6.2** The dashboard statistics **shall update in real time** without page refresh. When an agreement is created or executed, the backend emits an `INC_AGR` WebSocket event to all relevant clients, which triggers an immediate cache invalidation and data refetch on the frontend.
- **FR-6.3** The system shall maintain a scoped, role-aware audit log of all mutation events (INSERT, UPDATE, EXECUTE, DELETE) associated with agreements, vendors, directions, departments, and users.
- **FR-6.4** Each user shall only see audit log entries relevant to their organizational scope (department for employees, all for admins and juridicals).

---

### 🔒 Non-Functional Requirements (NFR)

#### NFR-1 — Security
- **NFR-1.1** All API routes (except login, forgot-password, reset-password, and file serving) shall require a valid JWT access token.
- **NFR-1.2** Role enforcement shall be applied at the infrastructure layer via Guards, independently of the domain logic, using NestJS Reflector metadata.
- **NFR-1.3** Refresh tokens shall be stored as hashed values and transmitted only via HTTP-only cookies, never in response bodies.
- **NFR-1.4** Password reset tokens shall be time-limited and hashed at rest inside the `UserCredentials` aggregate.
- **NFR-1.5** Uploaded files shall be validated for MIME type using magic-byte inspection, not just file extension, before being stored on disk.
- **NFR-1.6** The domain layer shall never throw HTTP exceptions directly; all domain errors shall be mapped to HTTP responses exclusively via a global `DomainExceptionFilter`.

#### NFR-2 — Real-Time & Performance
- **NFR-2.1** Dashboard KPI statistics shall reflect changes within seconds of a mutation, driven by server-push WebSocket signals (`INC_AGR`, `SEND_EVENT`) — no polling.
- **NFR-2.2** In-app notifications shall be delivered in real time without requiring a page refresh, via persistent WebSocket connections scoped to per-user and role rooms.
- **NFR-2.3** WebSocket event emission shall be backed by a **Redis Pub/Sub adapter** (`@socket.io/redis-emitter`), allowing the system to scale horizontally across multiple API instances while maintaining consistent event delivery.
- **NFR-2.4** Contract expiry checks shall run daily at 08:00 via `@nestjs/schedule` without impacting API response performance.

#### NFR-3 — Scalability & Maintainability
- **NFR-3.1** The system shall be structured as a Turborepo monorepo with `pnpm` workspaces, enabling independent builds and dependency management per application.
- **NFR-3.2** Each NestJS module shall be self-contained with its own domain, application, and infrastructure layers, following Clean Architecture's Dependency Inversion Principle.
- **NFR-3.3** Repository interfaces (Ports) shall be bound to concrete implementations (Adapters) via Symbol-based IoC tokens, enabling persistence layer replacement with zero domain-layer changes.
- **NFR-3.4** Shared TypeScript types (`packages/types/views`) shall serve as the formal API contract between the backend and frontend, enforced at compile time.
- **NFR-3.5** The frontend shall be organized by domain feature (`features/contract`, `features/vendor`, etc.), preventing cross-feature coupling and enabling independent iteration.

#### NFR-4 — Reliability & Data Integrity
- **NFR-4.1** Business invariants (unique agreement numbers, valid date intervals, occupied department guards) shall be enforced at the domain layer before any database operation, independent of database constraints.
- **NFR-4.2** Aggregate reconstitution from persistence shall never emit domain events, ensuring side effects are only triggered by genuine mutations.
- **NFR-4.3** All repositories shall include integration tests running against a real test database, validating query correctness, mapper fidelity, and edge cases.
- **NFR-4.4** All aggregate roots shall have dedicated unit test suites covering every public method's happy path and all failure invariants.

#### NFR-5 — Observability
- **NFR-5.1** All HTTP requests shall be logged with method, URL, and status via a global `HttpLoggingInterceptor`.
- **NFR-5.2** Domain exception filter shall log all caught domain errors with their context for server-side tracing.
- **NFR-5.3** A full, role-scoped audit log of all system events shall be persisted, queryable by authenticated users based on their organizational scope.




## ⚙️ Complete Execution Flow: How the Architecture is Wired

This traces the full lifecycle of a single request — **"Execute an Agreement"** (`PATCH /Agreements/exec`) — from the incoming HTTP call all the way to a real-time WebSocket notification delivered to connected clients.

---

### Step 1 — HTTP Request → Guard Chain

The request first passes through the **NestJS Guard pipeline** in sequence:

1. **`JwtAccessTokenGuard`** — extends `AuthGuard('jwt-access-token')` from Passport. It validates the JWT signature, extracts the payload (`{ id, role, directionId, departementId }`), and attaches it to `request.user`.
2. **`RoleGuard`** — uses NestJS's `Reflector` to read the `@RequiredRoles(UserRole.JURIDICAL)` metadata set on the route decorator. It checks `request.user.role` against the allowed roles. If it fails, the request is rejected with `403 Forbidden` before the controller is ever invoked.

---

### Step 2 — Controller (Thin Dispatcher, Infrastructure Layer)

The controller is **intentionally thin** — no business logic lives here:
- Receives the validated HTTP body (validated by `class-validator` via DTOs).
- Delegates entirely to the Application Service.
- Passes the returned domain object through a **Presenter** to map it to a shared `View` model before returning the HTTP response. The raw domain Aggregate is never serialized directly.

---

### Step 3 — Application Service (Orchestration Layer)

The Application Service follows a strict **load → mutate → save → publish** sequence:

1. **Load**: Fetches the `Agreement` Aggregate from the repository via the `IAgreementRepository` port (a pure domain interface). For mutations, it uses `findByIdForExecution()` which loads the bare aggregate with no joins. If not found, throws a `NotFoundError`.
2. **Mutate**: Calls `agreement.execute(startDate, endDate, observation)` — business logic is invoked on the Aggregate.
3. **Persist**: Calls `this.agreementRepository.save(agreement)` to write the updated state.
4. **Publish**: Calls `agreement.pullEvents()` to drain the Aggregate's internal event queue, then dispatches all recorded events via `this.eventBus.publishAll(...)`. This is **fire-and-forget** (`void`) — the HTTP response is not delayed by side effects.

---

### Step 4 — Aggregate Root Enforces Business Rules (Domain Layer — Zero Dependencies)

The `Agreement.execute()` method is **pure TypeScript with zero external imports**:
- Reads `this.status` (a computed getter based on date fields — never stored in the DB).
- Throws `ConflictError` if already executed.
- Throws `ValidationError` if dates are logically impossible (start ≥ end, or start before signature).
- On success, mutates state and calls `this.addEvent(new AgreementExecutedEvent(...))` to record the domain event internally without touching any event bus.

---

### Step 5 — Domain Errors → HTTP (Global Exception Filter)

Any `DomainError` thrown anywhere in the call stack is caught by the globally registered **`DomainExceptionFilter`**:

| Domain Error Class | HTTP Status |
|---|---|
| `ValidationError` | `400 Bad Request` |
| `NotFoundError` | `404 Not Found` |
| `ConflictError` | `409 Conflict` |
| `ForbiddenError` | `403 Forbidden` |
| `UnauthorizedError` | `401 Unauthorized` |

The domain never imports from `@nestjs/common`. The mapping is entirely the infrastructure's responsibility.

---

### Step 6 — Repository Port ↔ Adapter (Persistence, Infrastructure Layer)

The Application Service depends on `IAgreementRepository` — a **TypeScript interface defined in the domain layer** (the Port). It is bound to the concrete `AgreementRepository` (the Adapter) via Symbol-based IoC injection in the module:

```
{ provide: AGREEMENT_REPOSITORY, useClass: AgreementRepository }
```

The concrete repository:
- Executes SQL via TypeORM `QueryBuilder` with role-aware filtering (e.g., `EMPLOYEE` role automatically scoped to their `departementId`/`directionId`).
- Has a **`toDomain()` mapper** that calls `Agreement.reconstitute()` — rebuilding the Aggregate from a DB entity without firing any domain events.
- Has a **`toDetail()` mapper** that assembles a denormalized `AgreementDetail` read model with joined vendor, direction, and department data — used only for single-item view endpoints.
- For stat queries, a SQL `CASE` expression **mirrors** the Aggregate's `get status()` computation, ensuring consistency between domain logic and DB-level aggregation.

---

### Step 7 — CQRS EventBus → Handler → Side Effects (Infrastructure: Handlers)

The `@nestjs/cqrs` `EventBus` routes the published `AgreementExecutedEvent` to its registered handler:

**`AgreementExecutedHandler`**:
1. Persists an audit log entry via `EventService`.
2. Broadcasts a live `SEND_EVENT` to all WebSocket clients whose `departementId`/`directionId` matches, via `SocketStateService.emitDataToConnectedUsersWithContrainsts()`.

**`AgreementCreatedHandler`** (the creation flow) is even richer:
1. Concurrently loads the vendor name + direction abbreviations.
2. Fetches department users → persists per-user `Notification` DB records → emits `send_notification` via socket for each connected user.
3. Fetches juridical users → does the same.
4. Persists an audit log entry.
5. Broadcasts the audit event to constrained rooms on WebSocket.
6. Broadcasts an `INC_AGR` signal to trigger live stat re-fetching on the frontend dashboard.

---

### Bonus: Scheduled Domain Events (Cron Job Flow)

`ContractExpiryService` runs `@Cron(EVERY_DAY_AT_8AM)`:

```
1. Fires at 08:00 every day
2. Queries DB for agreements expiring in exactly 30, 7, and 1 days
   (using DATE(execution_end_date) = DATE(DATE_ADD(NOW(), INTERVAL N DAY)))
3. For each → publishes ContractExpiringEvent to the EventBus
4. ContractExpiringHandler handles:
   a. Fetches all juridical users
   b. Persists expiry warning notification for each
   c. Emits real-time socket notification to connected juridicals
```

No cron logic bleeds into the Domain. The scheduled service only interacts with the repository interface and the EventBus — both are infrastructure concerns.

---

### NestJS Dependency Injection Map (Module Wiring)

```
AgreementModule
├── CqrsModule                    ← EventBus + QueryBus
├── TypeOrmModule.forFeature()    ← AgreementEntity, VendorEntity, ...
├── DirectionModule               ← DirectionService (cross-domain dep)
├── EventModule                   ← EventService (audit log)
├── UserModule                    ← UserService, UserNotificationService
├── Providers
│   ├── AGREEMENT_REPOSITORY → AgreementRepository  (Symbol token DI)
│   ├── VENDOR_REPOSITORY    → VendorRepository     (Symbol token DI)
│   ├── AgreementService
│   ├── VendorService
│   ├── ContractExpiryService
│   └── 6x Event Handlers (AgreementCreated, AgreementExecuted,
│         VendorCreated, VendorUpdated, VendorDeleted, ContractExpiring)
└── Controllers
    ├── AgreementController
    ├── VendorController
    └── AgreementFileController
```

> Symbol-token injection (`AGREEMENT_REPOSITORY`) means the persistence adapter can be swapped (e.g., MySQL → MongoDB) with **zero changes** to the domain or application layers — demonstrating true Clean Architecture.

---

## 🚀 Technical Highlights for Architects & Recruiters
- **Clean Architecture & SOLID**: Strictly following the Dependency Inversion Principle, ensuring the domain remains a "pure" representation of business rules, independent of the database or UI.
- **Advanced CQRS Integration**: Flawless execution of the Event-Driven pattern where the Application layer orchestrates state changes, explicitly pulls Domain Events from the Aggregate Root, and dispatches them via `@nestjs/cqrs` for side-effect isolation.
- **HTTP-Agnostic Core**: Strategic use of Exception Filters to prevent "Domain Leakage," mapping pure structural Domain errors seamlessly into standard REST HTTP responses.
- **Feature-Sliced UI Modules**: Applying Backend modular concepts to the Frontend, isolating React code logic inside domain-specific features rather than sprawling atomic directories.
- **Full-Stack Type Safety**: Shared types and strict View/Presenter contracts across the monorepo eliminate "hidden" runtime errors between API and UI.
- **Data-Driven Design**: Heavy focus on data visualization and real-time Socket updates, making it a powerful tool for decision-makers.
- **Comprehensive Testing Strategy**: Tests are cleanly separated by architectural layer, covering both unit and integration concerns:

  **Unit Tests — Domain Layer** (pure, no DB, no framework):
  | File | What's Covered |
  |---|---|
  | `agreement.aggregate.spec.ts` | `create`, `reconstitute`, `execute` (happy + all failure invariants: conflict, date validation) |
  | `vendor.aggregate.spec.ts` | `create`, `reconstitute`, `update`, `markDeleted`, `canBeDeleted` |
  | `direction.spec.ts` | `create`, `reconstitute`, `rename`, `addDepartement`, `updateDepartement`, `removeDepartement`, `pullEvents` — all conflict/not-found/forbidden invariants |
  | `user.aggregate.spec.ts` | `create`, `reconstitute`, `recordCreated/Updated/Deleted`, `update`, `updateImage`, `toggleNotifications` |
  | `user-credentials.aggregate.spec.ts` | `create`, `reconstitute`, `setRefreshToken`, `clearRefreshToken`, `requestPasswordReset`, `resetPassword`, `clearPasswordToken` |

  **Unit Tests — Application Layer** (mocked repositories and services):
  | File | What's Covered |
  |---|---|
  | `Agreement.service.spec.ts` | `createAgreement` (happy + failure), `executeAgreement` (happy + failure), `findAll` |
  | `vendor.service.spec.ts` | Full vendor CRUD and guard logic |
  | `user.service.spec.ts` | `create`, `updateUser`, `deleteUser`, `recieveNotifications`, `getUserTypesStats`, `updateImage` — all happy + failure paths |
  | `user-notification.service.spec.ts` | `getUserNotifications`, `saveForUsers`, `markAsRead`, `markAllAsRead` |

  **Integration Tests — Infrastructure/Persistence Layer** (real TypeORM queries against a test DB):
  | File | What's Covered |
  |---|---|
  | `agreement.repository.spec.ts` | `save`, `findById`, `findByIdForExecution`, `findExpiringContracts`, `findOneByNumber` |
  | `vendor.repository.spec.ts` | Full vendor CRUD persistence |
  | `direction.repository.spec.ts` | `save`, `findById`, `findByDepartementId`, `findByTitleOrAbriviation`, `findDepartementById`, `delete` |
  | `user.repository.spec.ts` | User persistence integration |
  | `notification.repository.spec.ts` | Notification persistence integration |
