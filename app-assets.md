# App Assets — DALL-E Prompts

The app theme (reference: the dashboard screenshot):
- Page background: #F1F5F9 (very light gray)
- Cards: white (#FFFFFF) with 1px border (#E2E8F0) and subtle shadow
- Primary accent: #2563EB (blue-600) — used for buttons, left-border accents, icons
- Amber accent: #F59E0B — used sparingly for warnings
- Text: #0F172A (primary), #475569 (secondary), #94A3B8 (muted)
- Sidebar: white background, blue rounded logo badge, dark nav text
- Overall: clean, light, professional — no dark sections

Generate each prompt in **ChatGPT → DALL-E**, download, and drop into `apps/web/public/illustrations/`.

---

## Asset 1 — Sign-in left panel character
**File:** `public/illustrations/signin-hero.png`
**Used in:** `app/signin/page.tsx` — bottom half of the white left panel.
**Rendered size:** ~300×260px on a white (#ffffff) background.

```
Flat vector illustration, fully transparent background, 800x800 pixels, square canvas.
A confident, friendly professional character — gender-neutral, wearing a navy blue
suit (#0f172a) with a white shirt — sitting at a minimal desk reviewing a contract
document held in both hands, with a calm satisfied smile. On the desk: a small stack
of contract folders in slate blue (#64748b), a calendar with one date circled in
amber (#f59e0b), and a small glowing bell icon in blue (#2563eb) indicating a
notification alert.
Color palette: dark navy (#0f172a) outlines on all shapes, blue (#2563eb) for accent
details (bell, folder tabs, pen), amber (#f59e0b) for the calendar date. Fully
transparent background — no fill whatsoever. Bold dark outlines, no shading, no
gradients. Must read clearly on a white (#ffffff) surface. Subject centered with
generous padding.
```

---

## Asset 2 — Auth panel (forgot & reset password pages)
**File:** `public/illustrations/auth-panel.png`
**Used in:** `ForgotPassword.tsx` and `ResetPassword.tsx` — full-bleed right panel (50vw × 100vh), `objectFit: cover`.
**Rendered size:** fills a vertical panel on a light gradient fallback background.

```
A tall vertical illustration, 900x1200 pixels, portrait orientation. Full bleed —
designed to fill a panel completely with objectFit cover.

Background: soft gradient from very light blue-white (#EFF6FF) at the top to
very light gray (#F1F5F9) at the bottom, with a subtle dot-grid pattern at 4%
opacity across the entire surface.

Main composition — centered vertically and horizontally:
A large, confident friendly professional character in flat vector style — gender-
neutral, wearing a neat navy (#0f172a) suit and white shirt — standing upright and
holding a large contract document open in both hands, smiling with satisfaction.
The document shows "CONTRAT" in bold at the top, with faint horizontal lines below
suggesting text, and a bold blue (#2563eb) circular seal with a checkmark in the
bottom-right corner.

Floating around the character in an airy arrangement, drawn in flat vector style:
- Top-left: a shield icon with a lock, in blue (#2563eb) with white fill
- Top-right: an envelope with a small checkmark, in blue (#2563eb)
- Bottom-left: a calendar with a circled date in amber (#f59e0b)
- Bottom-right: a bell icon with small motion lines, in blue (#2563eb)

Scattered background accents: 10–14 small four-pointed stars and tiny dots in
blue (#2563eb) at 10% opacity.

Style: clean flat vector art, dark (#0f172a) outlines, no gradients on shapes,
no laptop, no UI, no text labels. Character uses navy/white color scheme with
blue and amber accents. The overall mood is professional, reassuring, and calm.
```

---

## Asset 3 — Empty state character (all DataGrid tables)
**File:** `public/illustrations/empty-state.png`
**Used in:** all DataGrid tables (Contracts, Conventions, Vendors, Users) via `EmptyState` component.
**Rendered size:** 120×120px on a white (#ffffff) card background.

```
Flat vector illustration, fully transparent background, 600x600 pixels, square canvas.
A small friendly document character — a white contract/paper sheet with rounded
corners and three faint horizontal lines suggesting text, given a simple face: two
small circular dot eyes and a small curved smile. The paper has two short stick
arms: the left arm holds a blue (#2563eb) magnifying glass up to one eye, searching
curiously. The right arm is raised in a small friendly wave. Top-right corner of
the paper: a small four-pointed star in amber (#f59e0b) as a decorative accent.

Color palette: white paper body, dark (#0f172a) outlines, blue (#2563eb) magnifying
glass, amber (#f59e0b) star. Fully transparent background — no fill, no shadow,
no ground line.

Style: clean flat vector art, bold rounded outlines, friendly and approachable —
not sad. Zero gradients, zero shading. Centered with padding. Must be legible and
charming at 120px rendered size.
```

---

## Asset 4 — Landing page hero preview
**File:** `public/illustrations/landing-preview.png`
**Used in:** `app/page.tsx` — hero section right side, replacing the placeholder.
**Rendered size:** ~520px wide on a white background.

> **Strongly preferred:** Use your real dashboard screenshot (from Chrome DevTools full-page capture) wrapped in a browser frame via [Screely](https://screely.com). It will match the app exactly. Use the DALL-E prompt below only as a fallback.

```
A realistic web app dashboard UI mockup, 1040x700 pixels, displayed inside a flat
macOS-style browser window frame. Browser chrome: white title bar, three traffic-
light circles on the left (red, yellow, green), centered URL bar showing
"contracts.app/dashboard" in gray.

The browser content area exactly matches this design:
- Left sidebar: white background, narrow (about 15% width), with a small blue
  rounded square logo at the top, then 4–5 small icon + label nav items in dark
  gray text (Accueil, Fournisseurs, Contrats, Convensions)
- Main content area: light gray (#f1f5f9) background with:
  - Page title "Tableau de bord" in bold dark text, subtitle below in muted gray
  - A row of 4 white KPI cards with subtle borders, each showing a large bold
    number ("281", "272" in red, "306", "603") and a small label beneath
    ("Total accords", "Non exécutés", "Fournisseurs", "Utilisateurs")
  - Below: 3 white cards side by side — left shows status breakdown with small
    metric boxes, center shows a line chart for vendor growth, right shows a
    recent events list with blue "CRÉATION" badge chips

All text is very small and slightly blurred — not readable. The browser frame has
a subtle drop shadow. Image sits on a transparent background.
Style: realistic light-themed SaaS UI, clean, no dark areas except text.
```

---

## Asset 5a — Admin default avatar
**Files (drop both copies):**
- `apps/api/upload/images/default-admin.png` — served by the API, assigned automatically on user creation
- `apps/web/public/avatars/default-admin.png` — used by the frontend directly (mock mode and onError fallback)

**Used in:** Topbar, PopoverContent, UsersContent DataGrid, DepartementUsersList, UserProfile, Settings. The frontend resolves to the local copy when `imageUrl` is empty or starts with `default-`.
**Rendered size:** 36-40px, always cropped to a circle.

```
Flat vector cartoon avatar, 256x256 pixels, transparent background.
A friendly professional man, short dark navy hair, slight confident smile,
neat dark navy (#0f172a) suit with a white shirt and a blue (#2563eb) tie.
Portrait cropped just below the chest, centered in the canvas with generous
padding. Behind the character: a soft light-blue circle (#dbeafe) that fills
the area behind the bust, with no hard edge (softly fading outward).
Bottom-right of that circle: a small circular badge in solid blue (#2563eb)
with a white shield-and-star icon inside (admin rank symbol).
Bold rounded outlines throughout, no shading or gradients, flat color fills.
Style: modern friendly app avatar similar to Notion or Linear user illustrations.
```

---

## Asset 5b — Employee default avatar
**Files (drop both copies):**
- `apps/api/upload/images/default-employee.png` — served by the API
- `apps/web/public/avatars/default-employee.png` — frontend direct / mock fallback

**Rendered size:** 36-40px, always cropped to a circle.

```
Flat vector cartoon avatar, 256x256 pixels, transparent background.
A friendly professional woman, short dark shoulder-length hair, warm smile,
neat green (#22c55e) blazer with a white shirt underneath.
Portrait cropped just below the chest, centered in the canvas with generous
padding. Behind the character: a soft light-green circle (#dcfce7) that fills
the area behind the bust, with no hard edge (softly fading outward).
Bottom-right of that circle: a small circular badge in solid green (#22c55e)
with a white person-silhouette icon inside.
Bold rounded outlines throughout, no shading or gradients, flat color fills.
Style: modern friendly app avatar similar to Notion or Linear user illustrations.
```

---

## Asset 5c — Juridical default avatar
**Files (drop both copies):**
- `apps/api/upload/images/default-juridical.png` — served by the API
- `apps/web/public/avatars/default-juridical.png` — frontend direct / mock fallback

**Rendered size:** 36-40px, always cropped to a circle.

```
Flat vector cartoon avatar, 256x256 pixels, transparent background.
A friendly professional man, short dark hair, round glasses, calm confident
expression, neat dark navy (#0f172a) suit with a white shirt and an amber
(#f59e0b) tie.
Portrait cropped just below the chest, centered in the canvas with generous
padding. Behind the character: a soft light-amber circle (#fef3c7) that fills
the area behind the bust, with no hard edge (softly fading outward).
Bottom-right of that circle: a small circular badge in solid amber (#f59e0b)
with a white gavel icon inside.
Bold rounded outlines throughout, no shading or gradients, flat color fills.
Style: modern friendly app avatar similar to Notion or Linear user illustrations.
```

---

## Asset 6 — App favicon / icon
**File:** `apps/web/app/icon.png` (Next.js App Router auto-detects this and injects `<link rel="icon">` with no code change needed). Also convert to `public/favicon.ico` as a fallback using [favicon.io](https://favicon.io/favicon-converter/).
**Rendered size:** 16x16 and 32x32 in browser tabs; 180x180 for Apple touch icon.

```
App icon, 512x512 pixels, square canvas with corner radius ~115px (iOS-style
rounded square). Background: solid flat blue (#2563eb), no gradient, no border.

Center composition: a white judge's gavel (mallet) rotated 45 degrees, handle
pointing toward the bottom-left corner and head pointing toward the top-right.
The icon fills approximately 60% of the canvas, with equal padding on all sides.

Gavel anatomy (all white, #ffffff, no outlines):
  - Head: a solid rounded rectangle, width-to-height ratio 3:2, with heavily
    rounded corners (corner radius about 30% of the head height). The head sits
    at the top-right of the composition.
  - Neck: a short, slightly narrower rounded rectangle connecting head to handle,
    about 1/4 the length of the handle.
  - Handle: a long, slim rounded rectangle (width about 1/3 of the head width),
    extending diagonally toward the bottom-left.
  - Sound block: a wide flat rounded rectangle centered horizontally at the
    bottom of the icon, about half the canvas width and 1/8 as tall. The gavel
    head is positioned just above it as if mid-strike.

No text, no shadow, no gradient on any shape. All shapes are solid white fills
only. Pure flat vector. The overall composition should feel balanced and
immediately recognizable as a gavel at 16x16px.
```

> **How to set up:**
> 1. Generate the 512x512 PNG in ChatGPT/DALL-E.
> 2. Drop it as `apps/web/app/icon.png`. Next.js picks it up automatically.
> 3. To also update the `.ico` fallback: upload the PNG to [favicon.io](https://favicon.io/favicon-converter/), download the `.ico`, and replace `apps/web/public/favicon.ico`.

---

## Integration Checklist

| Asset | File path | Status |
|-------|-----------|--------|
| Sign-in character | `apps/web/public/illustrations/signin-hero.png` | ⬜ Generate & drop: code ready |
| Auth panel | `apps/web/public/illustrations/auth-panel.png` | ⬜ Generate & drop: code ready |
| Empty state | `apps/web/public/illustrations/empty-state.png` | ⬜ Generate & drop: code ready |
| Landing hero | `apps/web/public/illustrations/landing-preview.png` | ⬜ Real screenshot (preferred) or generate: code ready |
| Admin avatar | `upload/images/default-admin.png` + `public/avatars/default-admin.png` | SVG placeholder active: replace with DALL-E PNG, then change `.svg` to `.png` in `lib/avatar.ts` |
| Employee avatar | `upload/images/default-employee.png` + `public/avatars/default-employee.png` | SVG placeholder active: replace with DALL-E PNG, then change `.svg` to `.png` in `lib/avatar.ts` |
| Juridical avatar | `upload/images/default-juridical.png` + `public/avatars/default-juridical.png` | SVG placeholder active: replace with DALL-E PNG, then change `.svg` to `.png` in `lib/avatar.ts` |
| App favicon | `apps/web/app/icon.png` + `apps/web/public/favicon.ico` | ⬜ Generate, drop PNG in app/, convert to .ico for public/ |

> **Note on existing users:** users already in the database will still have `imageUrl = ''`. To backfill them, run: `UPDATE users SET image_url = CONCAT('default-', LOWER(role), '.png') WHERE image_url = '' OR image_url IS NULL;` in MySQL.

All assets are already wired up in code with graceful fallbacks. Drop each file into the correct path and it appears automatically.
