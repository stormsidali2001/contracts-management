# contracts-management — Web

Next.js 14 frontend (App Router) for the contracts management system.

## Stack

- **Next.js 14** — App Router, server components
- **TanStack Query** — server state / data fetching
- **Zustand** — client state
- **MUI v5** — component library
- **MSW v2** — mock service worker for offline / Vercel preview mode
- **Playwright** — end-to-end tests

## Commands

```bash
pnpm dev              # dev server on port 3000
pnpm build            # production build
pnpm lint             # ESLint
pnpm test:e2e         # Playwright — both mock and prod projects
pnpm test:e2e:mock    # mock project only (no backend required)
pnpm test:e2e:prod    # prod project only (requires running backend)
pnpm test:e2e:ui      # interactive Playwright UI
pnpm test:e2e:report  # open last HTML report
```

## Mock mode

Set `NEXT_PUBLIC_MOCK_MODE=true` in `.env.local` to run the app without the NestJS backend. MSW intercepts all HTTP requests at the network layer and serves in-memory fixture data.

```bash
echo "NEXT_PUBLIC_MOCK_MODE=true" >> apps/web/.env.local
```

The browser console confirms the active mode on every page load:

```
[App] Mode: mock
[App] Data: seeded (MSW fixtures active)
```

This is the mode used by Vercel Preview deployments (set `NEXT_PUBLIC_MOCK_MODE=true` scoped to Preview environments in Vercel project settings).

## Project structure

```
app/                  # route segments (Next.js App Router pages)
features/<domain>/    # components, hooks, and logic scoped to a feature
lib/                  # shared utilities (query-client, query-keys, tokens)
api/                  # axios instance configuration
providers/            # React context providers (root-provider, theme, etc.)
mocks/                # MSW worker, handlers, and fixture data
  fixtures/           # static seed data (users, vendors, directions, agreements)
  handlers/           # per-domain request handlers
```

**Import alias:** always use `@/` for internal imports.

## E2E tests

Tests live in `e2e/` and are split into two Playwright projects:

| Project | Backend required | Port |
|---------|-----------------|------|
| `mock` | No | 3001 (dedicated dev server) |
| `prod` | Yes (NestJS on 8080, Next.js on 3000) | 3000 |

To run prod tests, start Docker + `pnpm dev` from the repo root first, then seed accounts with `pnpm generate:accounts`.
