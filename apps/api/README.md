# contracts-management — API

NestJS backend following Domain-Driven Design (DDD) + CQRS. Connects to PostgreSQL via TypeORM and Redis via Socket.IO adapter.

## Stack

- **NestJS** with `@nestjs/cqrs` for event-driven domain logic
- **TypeORM** with `synchronize: true` (schema is auto-migrated on startup, no migration files)
- **PostgreSQL 16** — main DB on port 5432, test DB on port 5433
- **Redis 7** — Socket.IO pub/sub adapter
- **Swagger** — available at `http://localhost:8080/docs` when running

## Commands

```bash
pnpm start:dev        # NestJS watch mode (port 8080)
pnpm build            # compile TypeScript
pnpm lint             # ESLint
pnpm test             # Jest integration tests (requires Docker test DB on port 5433)
pnpm test --no-coverage --testPathPattern=<file>  # run a single spec
```

## Startup output

On every start the server logs:

```
[Bootstrap] Mode          : development | production
[Bootstrap] Data seeded   : yes | no
[Bootstrap] Server        : http://localhost:8080
```

"Data seeded" is determined by whether the `users` table has any rows.

## Architecture

Each domain aggregate lives under `src/<Aggregate>/` and follows this structure:

```
src/<Aggregate>/
  domain/          # aggregate root, repository interface, domain events, errors
  application/     # service layer — orchestrates use cases, publishes domain events
  infrastructure/  # TypeORM repository implementation, event handlers, controllers
```

Key aggregates: `Agreement`, `user`, `vendor`, `direction`, `auth`, `statistics`, `Event`, `socket`.

**Rules:**
- Aggregates expose `create()` (records domain events) and `reconstitute()` (no events, used when loading from DB).
- Services call `eventBus.publishAll(aggregate.pullEvents())` to publish events.
- Repository interfaces live in `domain/`; implementations live in `infrastructure/`. Services never import TypeORM.
- Domain errors (`ValidationError`, `NotFoundError`, `ConflictError`, `ForbiddenError`, `UnauthorizedError`) are mapped to HTTP status codes by `DomainExceptionFilter`.

Shared infrastructure is in `src/core/` (TypeORM entities, DTOs, mappers, enums).

## Testing

Integration tests hit the real test database — no mocking of TypeORM or the DB driver.

Two spec categories:

| Category | Pattern | Setup |
|----------|---------|-------|
| Repository integration | `*.repository.spec.ts` | Minimal module: `typeOrmTestingModule()` + the repository under test. FK prerequisites inserted with raw SQL. |
| Service-level integration | `*.spec.ts` with service providers | Full service + repository wired via `CqrsModule`. Data created through service methods, same as the seeder. |

The second category is used whenever the query under test depends on cross-aggregate data distribution (e.g. `getTopDirections` needs realistic agreement counts per direction).

## Environment variables

See `apps/api/.env-example` for the full list. Required variables:

| Variable | Description |
|----------|-------------|
| `DB_USERNAME` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_HOST` | DB host (default `localhost`) |
| `DB_PORT` | DB port (default `5432`) |
| `DB_NAME` | Database name |
| `DB_TEST_HOST` | Test DB host |
| `DB_TEST_PORT` | Test DB port (default `5433`) |
| `DB_TEST_NAME` | Test database name |
| `JWT_ACCESS_TOKEN_SECRET` | Access token signing secret |
| `JWT_REFRESH_TOKEN_SECRET` | Refresh token signing secret |
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port |
| `CLIENT_PORT` | Frontend port (for CORS allowlist) |
| `ethereal_user` | Ethereal SMTP user (email dev) |
| `ethereal_password` | Ethereal SMTP password |
