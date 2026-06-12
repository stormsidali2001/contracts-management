# Contract Management Platform: Project Summary

**Internship project, built for a client's internal use**

---

## PRISM Summary

### Version A: Single Paragraph

Developed during an internship for a client's internal use. Built a full-stack web application for managing organizational contracts and conventions across departments, with a standout feature: **real-time, horizontally scalable live updates**. Dashboard statistics and in-app notifications refresh instantly across all connected clients the moment a contract is created or executed, with no polling. This is powered by a **Socket.io + Redis Pub/Sub broker** (`@socket.io/redis-adapter`), meaning the system scales across multiple API instances while maintaining consistent event delivery to every client. The **NestJS backend** follows **Domain-Driven Design (DDD)** and **CQRS**: domain events (agreement created, executed, expiring) flow through an event bus into dedicated handlers that emit scoped WebSocket signals, which trigger **TanStack Query cache invalidations** on the frontend for zero-latency UI updates. A daily cron job pushes contract expiry alerts (30/7/1-day) through the same pipeline to all Juridical users in real time. Role-scoped dashboards for Admin, Employee, and Juridical users serve 500+ agreements and 300+ vendors with filterable statistics and execution-status tracking.

---

### Version B: PRISM Bullets

```
CONTRACT MANAGEMENT PLATFORM  |  NestJS · Next.js · MySQL · TypeORM · Redis · Socket.io · Turborepo
Internship project, built for a client's internal use

Problem
  The client needed an internal tool to centralize contract and convention
  tracking across departments, with visibility into vendor relationships,
  execution statuses, and upcoming expiry deadlines.

Results
  • Built a real-time, horizontally scalable event pipeline: Socket.io backed by a
    Redis Pub/Sub broker routes live signals (INC_AGR, SEND_EVENT, send_notification)
    to scoped client rooms, so dashboard stats and notifications update instantly across
    all connected users with zero polling, and the architecture scales across multiple
    API processes without dropping events
  • Domain events (AgreementCreated, AgreementExecuted, ContractExpiring) flow through
    @nestjs/cqrs EventBus into handlers that emit WebSocket signals, which trigger
    TanStack Query cache invalidations on the frontend. The full round-trip from DB
    write to live UI refresh happens in under a second
  • Delivered a full-stack platform managing 500+ agreements, 300+ vendors,
    and multi-department hierarchies with role-based access (Admin / Employee / Juridical)
  • Implemented automated expiry notifications (30/7/1-day) via daily cron →
    domain event → Redis-brokered Socket.io → per-user in-app alert, with no manual
    intervention required
  • Built 6 derived contract statuses (NOT_EXECUTED → EXECUTED_WITH_DELAY) computed
    purely from date fields. No stored state, no stale data

Impact
  • Juridical staff and managers see live contract KPIs the moment data changes,
    with no refresh, no delay, and no polling overhead on the server
  • The Redis broker decouples socket emission from the API process, making the
    real-time layer production-ready for horizontal scaling from day one
  • Gave the client a centralized system for contract oversight and deadline
    awareness across all directions and departments

Stack
  Backend  : NestJS, CQRS (@nestjs/cqrs), TypeORM, MySQL 8, Redis (Pub/Sub broker),
             Socket.io + @socket.io/redis-adapter, @nestjs/schedule, Nodemailer
  Frontend : Next.js 14 (App Router), TanStack Query (cache invalidation on WS signal),
             Zustand, CSS Modules
  Infra    : pnpm + Turborepo monorepo, Docker Compose, shared @contracts/types package
  Patterns : DDD aggregates, domain events, CQRS, repository pattern, RBAC, JWT auth

Metrics
  • 3 user roles · 6 contract statuses · 2 agreement types (Contract / Convention)
  • 15+ domain events · 3 real-time WebSocket signal types (INC_AGR, SEND_EVENT,
    send_notification) · 3 expiry alert thresholds (30 / 7 / 1 day)
```

---

## Screenshot Guide

Take these 8 screenshots at **1440×900** (Chrome DevTools device toolbar). Log in as `admin.admin / 123456` for full access.

| # | Page | What to show |
|---|------|-------------|
| 1 | `/dashboard`: Dashboard | Stats cards, agreement status chart, vendor stats, date range picker |
| 2 | `/contracts` | Contracts table with color-coded status badges, filters open |
| 3 | Contract create/edit modal | Full form with all fields visible |
| 4 | `/convensions` | Conventions list |
| 5 | `/vendors` | Vendors table with stats |
| 6 | `/users` | Users table with role chips |
| 7 | `/directions` | Directions + departments hierarchy |
| 8 | Notification bell (as `storm.sidali`) | Dropdown open with an expiry alert |

**How to take them:**
1. Run `pnpm dev` + `docker compose up -d`, seed with `pnpm generate:agreements -- 500` etc.
2. Log in as `admin.admin / 123456` for full access. For screenshot #8, switch to `storm.sidali / 123456`.
3. Chrome → DevTools → Toggle device toolbar → set **1440×900**.
4. `Cmd+Shift+P` → "Capture full size screenshot" so nothing is cut off.

---

## DALL-E Prompts

Use these directly in **ChatGPT → DALL-E**. Prompt 1 is self-contained (upload as-is). Prompts 2–4 are feature frames: drop your screenshot into the blank white card area in Canva.

> **Upwork spec:** 700×394px displayed, 16:9. Generate at 1400×788, downscale before uploading.

---

### Prompt 1: Upwork Thumbnail (most important)

> Self-contained: no screenshot needed. Upload directly to Upwork.

```
A wide promotional app banner, 1400x788 pixels, 16:9 aspect ratio.
Background: very light gray (#f1f5f9), clean, light, professional. Scattered
in the background: very subtle four-pointed stars and small dots in blue (#2563eb)
at 6% opacity. Two barely-visible radial glow blobs: bottom-right in
rgba(37,99,235,0.07) and top-left in rgba(245,158,11,0.05).

Left third: a friendly cartoon character in flat illustration style, a professional
office worker in a neat dark navy (#0f172a) suit and white shirt, sitting at a desk,
cheerfully holding a large contract document labeled "CONTRACT" in both hands, smiling
confidently. On the desk: a stack of blue folders, a calendar with one date circled
in amber (#f59e0b), and a small blue (#2563eb) bell icon. Bold dark outlines, no
gradients, no shading. Generous padding around subject.

Center: bold sans-serif text. "ContractFlow" in blue (#2563eb), heavy, 72px.
Below: "Contract Management Made Simple." in dark (#0f172a), semi-bold, 36px.
Below in muted gray (#475569), 18px: "Track contracts, monitor execution status,
and get automatic alerts before any deadline expires."

Right side: a clean cluster of three small white cards with 1px borders and soft
drop shadows, matching the app's KPI card style:
  • Card 1: bold number "306", label "Active Contracts", thin blue left-border
  • Card 2: bold number "272" in red (#ef4444), label "Not Executed", amber left-border
  • Card 3: small bell icon + "3 expiry alerts", small blue rounded chip

No dark background, no laptop, no browser window. Light, modern, trustworthy.
```

---

### Prompt 2: Feature Frame: Real-time Dashboard

> Drop your `/dashboard` screenshot into the blank white card area in Canva.
> Feature: live KPI cards, contract status breakdown, vendor growth chart, all updating instantly via WebSocket without page refresh.

**How to get this screenshot:**
1. Make sure the database is seeded: run `pnpm generate:agreements -- 500` and `pnpm generate:vendors -- 300` from the project root.
2. Log in as `admin.admin / 123456`.
3. Navigate to `/dashboard`.
4. Open the date range picker and set a wide range (e.g. Jan 2023 to Dec 2026) so all KPI cards show large numbers.
5. Make sure the status chart and vendor growth chart are both fully visible without scrolling.
6. In Chrome: `Cmd+Shift+P` → "Capture full size screenshot" at 1440x900.
7. Wrap it in a browser frame using [Screely](https://screely.com) (style: white frame, light shadow), then drop the result into the Canva white card.

```
A feature highlight card, 1400x788 pixels, 16:9 aspect ratio. Light gray
(#f1f5f9) background throughout.

Top-left area (about 30% width, full height): vertical feature description column.
  - Small rounded pill badge at top: "DASHBOARD" in blue (#2563eb) text on
    a light blue (#eff6ff) background, 13px, all caps, bold.
  - Below the badge: bold heading "Real-time Statistics" in dark (#0f172a),
    Outfit-style, 28px.
  - Below heading: muted description text in gray (#475569), 14px, two lines:
    "KPIs update the moment a contract is created or modified.
    No refresh needed."
  - Below description: three small icon+text rows, each with a blue bullet:
      • "500+ contracts tracked"
      • "Filter by date range"
      • "Live WebSocket updates"

Right 65%: a large white rounded card (border-radius 16px, 1px border #e2e8f0,
soft drop shadow rgba(15,23,42,0.08) blur 24px) that fills most of the right
area with generous margin. The card interior is a completely flat white
(#ffffff) rectangle, blank placeholder for a real screenshot.

Overall: clean, no icons overlapping the white card, no text inside the white
card. Subtle background: scattered 8-10 small four-pointed stars in blue at 5%
opacity.
```

---

### Prompt 3: Feature Frame: Contract Status Tracking

> Drop your `/contracts` screenshot into the blank white card area in Canva.
> Feature: paginated contracts table with color-coded status pills (Executed, In Execution, Delayed, Not Executed), advanced filters by vendor/date/department.

**How to get this screenshot:**
1. Log in as `admin.admin / 123456`.
2. Navigate to `/contracts`.
3. Open the filter panel so it is visible on screen.
4. Make sure the table shows at least one row of each status color (green, orange, red, blue). If not, adjust the date filter to widen the range until all statuses appear.
5. Scroll so the column headers and at least 6-8 rows are visible, with the status pills clearly readable.
6. Do not open any modal or drawer. The goal is the table + open filter panel in one clean view.
7. Capture at 1440x900, wrap in Screely, drop into Canva.

```
A feature highlight card, 1400x788 pixels, 16:9 aspect ratio. White (#ffffff)
background.

Top-left area (about 30% width, full height): vertical feature description column.
  - Small rounded pill badge: "CONTRACTS" in blue (#2563eb) on light blue (#eff6ff),
    13px, all caps, bold.
  - Bold heading: "Status Tracking" in dark (#0f172a), 28px.
  - Muted description in gray (#475569), 14px:
    "Filter and track all agreements by status, vendor,
    direction, or expiry date."
  - Below: a small vertical stack of 4 colored status pill badges (flat rounded
    chips, 12px text, bold):
      • Green (#22c55e bg tint, #166534 text): "In Execution"
      • Orange (#f97316 bg tint, #9a3412 text): "In Execution with Delay"
      • Red (#ef4444 bg tint, #991b1b text): "Not Executed"
      • Blue (#2563eb bg tint, #1e40af text): "Executed"
    Each chip has a white background with 1px colored border and a small colored
    dot on the left.

Right 65%: a large white rounded card (border-radius 16px, 1px border #e2e8f0,
soft drop shadow) filling most of the right area with generous margin. Card
interior is completely flat white (#ffffff), blank placeholder for screenshot.

Background: very light gray (#f8fafc). No UI elements inside the white card.
```

---

### Prompt 4: Feature Frame: Automated Expiry Alerts

> Drop your notification bell screenshot into the blank white card area in Canva.
> Feature: automated expiry alerts sent 30, 7, and 1 day before contract deadline via a daily cron job triggering real-time Socket.io notifications per user.

**How to get this screenshot:**
1. You need contracts that expire within 30 days in the database. The quickest way: open the database directly (MySQL on port 3306) and update 3-4 agreement `endDate` values to be 1, 7, and 25 days from today. Alternatively, create new contracts via the UI with near-future expiry dates while logged in as `admin.admin`.
2. Manually trigger the expiry cron by calling the endpoint or restarting the API (the job runs at 08:00 daily). If you cannot trigger it, create a contract and wait for the `INC_AGR` socket event to fire a notification on creation instead.
3. Switch to the `juridical.adala / 123456` account, since expiry notifications are scoped to Juridical users.
4. Navigate to `/dashboard`.
5. Click the bell icon in the top bar to open the notification dropdown.
6. Make sure at least 2-3 alert rows are visible in the dropdown, each showing a contract reference, vendor name, and days remaining.
7. Capture at 1440x900 with the dropdown open. Wrap in Screely, drop into Canva.

```
A feature highlight card, 1400x788 pixels, 16:9 aspect ratio. Very light blue
(#f0f7ff) background.

Top-left area (about 30% width, full height): vertical feature description column.
  - Small rounded pill badge: "NOTIFICATIONS" in blue (#2563eb) on white, with
    a small bell icon to the left, 13px bold.
  - Bold heading: "Expiry Alerts" in dark (#0f172a), 28px.
  - Muted description in gray (#475569), 14px:
    "Automatic alerts sent 30, 7, and 1 day before expiry.
    No manual follow-up required."
  - Below: three small alert preview rows, each styled as a mini notification card
    (white bg, 1px border, 8px radius, padding 8px), left-bordered in amber (#f59e0b):
      • Row 1: "30 days left - Contract #2024-089" in dark text, vendor name below in gray
      • Row 2: "7 days left - Contract #2024-102" with amber left border
      • Row 3: "1 day left - Contract #2024-117" with red left border

Right 65%: a large white rounded card (border-radius 16px, 1px border #e2e8f0,
soft drop shadow) filling most of the right area with generous margin. Card
interior completely flat white (#ffffff), blank placeholder for screenshot.

No UI elements inside the white card. Scattered background: 6-8 tiny bell icons
and star shapes in blue (#2563eb) at 8% opacity.
```

---

### Prompt 5: Feature Frame: Role-Based Access Control

> Self-contained: no screenshot needed. The visual is fully generated by DALL-E.
> Feature: three distinct user roles (Admin, Employee, Juridical), each with scoped permissions and a tailored dashboard view.

```
A feature highlight card, 1400x788 pixels, 16:9 aspect ratio. White (#ffffff)
background with a very subtle dot-grid pattern at 3% opacity.

Top-center area: small rounded pill badge "ACCESS CONTROL" in blue (#2563eb) on
light blue (#eff6ff), all caps, 13px bold. Below it: bold heading "Three roles,
one platform." in dark (#0f172a), 32px, centered. Below that: muted subtext in
gray (#475569), 15px: "Each user sees exactly what they need, nothing more."

Center of the card: three side-by-side role cards, each white with 1px border
(#e2e8f0), border-radius 16px, soft drop shadow, equal width, generous padding.

Card 1, Admin:
  - Top: a round avatar illustration (flat vector style, friendly face, navy suit,
    blue (#2563eb) badge icon on the avatar circle indicating admin rank)
  - Bold label: "Admin" in dark (#0f172a), 18px
  - Small blue rounded chip: "Full Access"
  - Four bullet points in gray (#475569), 13px:
      • Manage users, vendors, and directions
      • Create and oversee all contracts
      • Access full statistics and reports
      • Configure organizational hierarchy

Card 2, Employee:
  - Top: a round avatar illustration (flat vector style, friendly face, casual
    business attire, green (#22c55e) badge icon on the avatar circle)
  - Bold label: "Employee" in dark (#0f172a), 18px
  - Small green rounded chip: "View Access"
  - Four bullet points in gray (#475569), 13px:
      • View contracts scoped to their department
      • Browse vendor and direction data
      • Track contract execution status
      • Receive in-app contract notifications

Card 3, Juridical:
  - Top: a round avatar illustration (flat vector style, friendly face, formal
    attire with a small gavel icon, amber (#f59e0b) badge icon on the avatar circle)
  - Bold label: "Juridical" in dark (#0f172a), 18px
  - Small amber rounded chip: "Legal Access"
  - Four bullet points in gray (#475569), 13px:
      • Create and manage contracts and conventions
      • Execute agreements and record completion dates
      • Manage the vendor directory
      • Receive automatic expiry alerts

Style: flat vector avatars, bold dark outlines, no gradients. Cards are evenly
spaced with a small gap. Background is clean white. No extra decorations.
```

---

### Prompt 6: Feature Frame: Vendor Management

> Drop your `/vendors` screenshot into the blank white card area in Canva.
> Feature: centralized vendor directory with contract count per vendor, search, filters, and direct link to associated contracts.

**How to get this screenshot:**
1. Log in as `admin.admin / 123456`.
2. Run `pnpm generate:vendors -- 300` to make sure vendor data is populated.
3. Navigate to `/vendors`.
4. Make sure the table is visible with vendor names, associated contract counts, and any status indicators. Do not open any modals.
5. Capture at 1440x900, wrap in Screely, drop into Canva.

```
A feature highlight card, 1400x788 pixels, 16:9 aspect ratio. Very light gray
(#f8fafc) background.

Top-left area (about 30% width, full height): vertical feature description column.
  - Small rounded pill badge: "VENDORS" in blue (#2563eb) on light blue (#eff6ff),
    13px, all caps, bold.
  - Bold heading: "Vendor Management" in dark (#0f172a), 28px.
  - Muted description in gray (#475569), 14px:
    "Centralize all vendor information and track
    their associated contracts in one place."
  - Below: four small icon+text rows with blue bullet dots:
      • "300+ vendors tracked"
      • "Linked to contracts and conventions"
      • "Searchable and filterable directory"
      • "Instant contract count per vendor"

Right 65%: a large white rounded card (border-radius 16px, 1px border #e2e8f0,
soft drop shadow rgba(15,23,42,0.08) blur 24px) filling most of the right area
with generous margin. Card interior is completely flat white (#ffffff), blank
placeholder for screenshot.

No UI elements inside the white card. Background accents: 6-8 tiny outlined
building/storefront icons in blue (#2563eb) at 6% opacity scattered around.
```

---

### Prompt 7: Feature Frame: Organizational Hierarchy

> Drop your `/directions` screenshot into the blank white card area in Canva.
> Feature: multi-level organizational structure with directions and departments, used to scope contracts and filter statistics by unit.

**How to get this screenshot:**
1. Log in as `admin.admin / 123456`.
2. Run `pnpm generate:directions` from the project root to seed directions.
3. Navigate to `/directions`.
4. Expand at least one direction to show its nested departments underneath.
5. The goal is to show the tree/hierarchy structure clearly, with at least 3-4 directions and expanded sub-departments visible.
6. Capture at 1440x900, wrap in Screely, drop into Canva.

```
A feature highlight card, 1400x788 pixels, 16:9 aspect ratio. White (#ffffff)
background.

Top-left area (about 30% width, full height): vertical feature description column.
  - Small rounded pill badge: "ORGANIZATION" in blue (#2563eb) on light blue
    (#eff6ff), 13px, all caps, bold.
  - Bold heading: "Direction Hierarchy" in dark (#0f172a), 28px.
  - Muted description in gray (#475569), 14px:
    "Structure your organization into directions and
    departments to scope contracts precisely."
  - Below: four small icon+text rows with blue bullet dots:
      • "Multi-level direction structure"
      • "Departments nested under directions"
      • "Filter contracts by organizational unit"
      • "Role-scoped visibility per direction"
  - Below the bullets: a small flat illustration of a tree diagram with 2 levels:
    one top node in blue (#2563eb) labeled "Direction" connected by lines to 3
    smaller nodes in light blue labeled "Dept A", "Dept B", "Dept C". Clean,
    minimal, no shadows on the diagram itself.

Right 65%: a large white rounded card (border-radius 16px, 1px border #e2e8f0,
soft drop shadow) filling most of the right area with generous margin. Card
interior is completely flat white (#ffffff), blank placeholder for screenshot.

No UI elements inside the white card.
```

---

### Prompt 8: Feature Frame: Guided Onboarding Tour

> Drop your onboarding tour screenshot into the blank white card area in Canva.
> Feature: role-aware interactive step-by-step tour that walks new users through the platform on first login, with highlighted elements and step tooltips.

**How to get this screenshot:**
1. Log in as any account (e.g. `storm.sidali / 123456`).
2. Open the profile popover from the top bar avatar and click "Reprendre le tour" to restart the onboarding tour.
3. Let the tour land on a step that highlights a meaningful UI element (e.g. the sidebar nav item or the "Nouveau contrat" button).
4. Make sure the tooltip/popover from the tour step is fully visible on screen alongside the highlighted element.
5. The tour overlay with the step counter (e.g. "Step 2 of 5") should be readable.
6. Capture at 1440x900, wrap in Screely, drop into Canva.

```
A feature highlight card, 1400x788 pixels, 16:9 aspect ratio. Light gray
(#f1f5f9) background.

Top-left area (about 30% width, full height): vertical feature description column.
  - Small rounded pill badge: "ONBOARDING" in blue (#2563eb) on light blue
    (#eff6ff), 13px, all caps, bold.
  - Bold heading: "Guided Tour" in dark (#0f172a), 28px.
  - Muted description in gray (#475569), 14px:
    "New users are walked through the platform
    step by step, tailored to their role."
  - Below: four small icon+text rows with blue bullet dots:
      • "Role-aware tour (Admin, Employee, Juridical)"
      • "Highlights key UI elements on each step"
      • "Restartable from the profile menu"
      • "Skippable and progress-tracked per user"
  - Below the bullets: a small horizontal stepper illustration showing 4 circles
    connected by lines. Circle 1 is filled blue (#2563eb) with a white checkmark.
    Circle 2 has a blue ring with a blue dot inside (active step). Circles 3 and 4
    are outlined in light gray (#cbd5e1). Below each circle: tiny step labels in
    gray. Clean flat style, no shadows.

Right 65%: a large white rounded card (border-radius 16px, 1px border #e2e8f0,
soft drop shadow rgba(15,23,42,0.08) blur 24px) filling most of the right area
with generous margin. Card interior is completely flat white (#ffffff), blank
placeholder for screenshot.

No UI elements inside the white card. Subtle background: 5-6 small four-pointed
stars in blue (#2563eb) at 5% opacity.
```

---

## Assembly Workflow

1. **Take the 8 screenshots** in Chrome at 1440×900. Use `Cmd+Shift+P` → "Capture full size screenshot".
2. **Generate the 4 DALL-E images** in ChatGPT.
3. In **Canva**: for Prompts 2–4, upload your screenshot → drag it over the blank white card on the right → resize and clip to fit the card bounds.
4. **Upwork**: export at 1400×788, Upwork downscales to 700×394 automatically.

| Tool | Purpose |
|------|---------|
| [Screely](https://screely.com) | Wrap a screenshot in a clean browser frame first, then place into the Canva white card |
| [Figma](https://figma.com) | Full layout control if you want to adjust the feature frame composition |
