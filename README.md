# contracts-management

A full-stack contract and agreement management system built with NestJS (DDD/CQRS), Next.js, MySQL, and Redis.

## Prerequisites

- [Docker](https://www.docker.com/) (for MySQL and Redis)
- [pnpm](https://pnpm.io/) 10.6.3+
- Node.js 18+

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/stormsidali2001/contracts-management
cd contracts-management
```

### 2. Start infrastructure
```bash
docker compose up -d
```
This starts MySQL 8.0 on port 3306 and Redis 7 on port 6379.

### 3. Install dependencies
```bash
pnpm install
```

### 4. Configure environment variables

Create `apps/api/.env` (or copy from `apps/api/.env-example`):

```env
# MySQL
MYSQL_USERNAME=user1
MYSQL_PASSWORD=password
MYSQL_DATABASE_HOST=localhost
MYSQL_DATABASE_PORT=3306
MYSQL_DATABASE_NAME=contracts_management

# JWT
JWT_ACCESS_TOKEN_SECRET=super_secret_access_token
JWT_ACCESS_TOKEN_EXPIRES_IN=10000
JWT_REFRESH_TOKEN_SECRET=super_secret_refresh_token
JWT_REFRESH_TOKEN_EXPIRES_IN=100000000

# Frontend
CLIENT_PORT=3000

# Email (Ethereal for dev)
ethereal_user=xxxxxxx@xxxx.com
ethereal_password=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 5. Start the application
```bash
pnpm dev
```
This runs the NestJS backend (watch mode) and Next.js frontend simultaneously via Turborepo.

## Other Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all workspaces |
| `pnpm lint` | Lint all workspaces |
| `pnpm format` | Prettier format all TS/TSX/MD files |

## Generate Fake Data

Run these commands from the root in order (the database must be running and the backend must have synced the schema at least once):

```bash
pnpm generate:directions
pnpm generate:users -- 200       # requires directions first
pnpm generate:vendors -- 300
pnpm generate:agreements -- 500
pnpm generate:accounts           # creates one account per role
```

### Test Accounts (after `pnpm generate:accounts`)

| Role | Username | Password |
|------|----------|----------|
| ADMIN | admin.admin | 123456 |
| ADMIN | admin1.admin1 | 123456 |
| EMPLOYEE | storm.sidali | 123456 |
| JURIDICAL | juridical.adala | 123456 |
