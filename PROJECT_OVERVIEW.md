# AttendTrack Enterprise PWA — Project Overview

## 🗂️ Directory Structure

```
Anti/                          ← Project root
├── app/                       ← All pages & API routes (Next.js App Router)
├── components/                ← Reusable UI building blocks
├── hooks/                     ← Custom React hooks
├── lib/                       ← Business logic, Firebase, utilities
├── public/                    ← Static assets (icons, manifest)
├── proxy.ts                   ← Admin route security guard
├── next.config.ts             ← Next.js configuration
├── .env.local.example         ← Environment variable template
└── package.json               ← Dependencies & scripts
```

---

## 📁 `/app` — Pages & Routes

This is the heart of the application. In Next.js App Router, **every folder = a URL route**, and `page.tsx` is what renders at that URL.

```
app/
├── layout.tsx          ← Root layout: wraps ALL pages with AuthProvider + PWA metadata
├── page.tsx            ← "/" → Smart redirect (login? dashboard? 2FA?)
├── globals.css         ← Global design system: colors, fonts, animations, tokens
│
├── login/              ← /login  — Employee email/password sign-in
├── register/           ← /register — New employee account creation
├── setup-2fa/          ← /setup-2fa — First-login TOTP QR code setup wizard
├── verify-2fa/         ← /verify-2fa — 6-digit code entry on every login
│
├── dashboard/          ← /dashboard — Main attendance panel (Clock In/Out buttons)
├── history/            ← /history — Personal attendance log grouped by day
├── profile/            ← /profile — Account info, 2FA status, sign out
│
├── admin/
│   ├── login/          ← /admin/login — Admin root credential login (separate UI)
│   ├── page.tsx        ← /admin — KPI dashboard (present, on lunch, clocked out)
│   ├── employees/      ← /admin/employees — All employees with live status
│   ├── records/        ← /admin/records — Full filterable attendance log
│   └── reports/        ← /admin/reports — Report builder + CSV/PDF export
│
└── api/
    ├── auth/
    │   └── verify-totp/ ← POST /api/auth/verify-totp — Server-side TOTP check
    └── admin/
        └── verify/      ← POST /api/admin/verify — Admin login + cookie
                         ← DELETE /api/admin/verify — Admin logout
```

> **Why server-side API routes?** The TOTP secret and admin password must never be exposed
> to the browser. These routes run only on the server, keeping secrets safe.

---

## 📁 `/components` — Reusable UI Pieces

These are the visual building blocks used across pages. Changing one component updates it everywhere.

```
components/
├── ui/                    ← Generic, design-system-level components
│   ├── Button.tsx         ← Button with 7 variants (primary, success, danger…)
│   ├── Card.tsx           ← White/dark card with optional hover lift
│   ├── Badge.tsx          ← Status pill (success, warning, danger, etc.)
│   └── Input.tsx          ← Text input with label, error, icon support
│
├── attendance/            ← Domain-specific attendance components
│   ├── ActionPanel.tsx    ← The 4 big Clock In/Out buttons with state machine
│   └── StatusBadge.tsx    ← "Clocked In" / "On Lunch" indicator with pulsing dot
│
└── layout/                ← Page shells (navigation + content area)
    ├── AppShell.tsx        ← Employee layout: navy sidebar (desktop) + bottom nav (mobile)
    └── AdminShell.tsx      ← Admin layout: very dark sidebar with shield branding
```

---

## 📁 `/hooks` — Custom React Hooks

Hooks extract logic that multiple components share, keeping components clean.

```
hooks/
├── useAttendanceStatus.ts  ← Subscribes to today's Firestore events in real time.
│                             Derives current status: idle | clocked_in | on_lunch | clocked_out
│                             → Drives which buttons are active on the ActionPanel
│
└── useOnlineStatus.ts      ← Watches navigator.onLine events.
                              When offline: disables Firestore network (queues writes locally)
                              When back online: re-enables network → auto-sync triggers
```

---

## 📁 `/lib` — Business Logic & Services

Pure logic files, no UI. These are imported by both pages and components.

```
lib/
├── firebase.ts         ← Initializes Firebase (singleton pattern).
│                         Enables IndexedDB offline persistence with unlimited cache.
│                         Exports: auth, db
│
├── auth-context.tsx    ← React Context that tracks the logged-in employee:
│                         user, profile, is2FAVerified, needs2FASetup
│                         Provides: signIn, signUp, signOut
│
├── attendance.ts       ← All Firestore operations for attendance:
│                         recordAttendanceEvent() → offline-first write
│                         subscribeToTodayEvents() → real-time listener
│                         subscribeToUserHistory() → personal log
│                         fetchAllAttendanceRecords() → admin bulk query
│                         deriveStatus() → converts event list → status enum
│
├── totp.ts             ← TOTP helpers using otplib:
│                         generateTOTPSecret() → creates the secret key
│                         buildOTPAuthURI() → builds the otpauth:// URL for the QR code
│                         verifyTOTPClient() → used only during initial setup
│
├── reports.ts          ← Attendance analytics engine:
│                         aggregateDailyReports() → pairs clock-in/out, calculates hours
│                         aggregateSummaryReports() → per-employee totals, late arrivals
│                         minutesToHHMM() → "125" → "2h 05m"
│
└── export.ts           ← File generation:
                          generateDailyCSV() / generateSummaryCSV() → CSV strings
                          downloadCSV() → triggers browser download
                          generateDailyPDF() / generateSummaryPDF() → branded PDF via jsPDF
```

---

## 📄 Root-level Files. 

| File | Purpose |
|---|---|
| `proxy.ts` | **Security guard** — runs on every request to `/admin/*`. If no `admin_session` cookie → redirects to `/admin/login`. This is the Next.js 16 replacement for `middleware.ts`. |
| `next.config.ts` | Tells Next.js to treat `firebase-admin` and `otplib` as server-only packages (not bundled into browser JavaScript). |
| `public/manifest.json` | PWA manifest — name, theme color (`#1e293b`), icons, and the `standalone` display mode that makes it installable as a mobile app. |
| `.env.local.example` | Template showing all required environment variables. Copy to `.env.local` and fill in Firebase credentials + admin password. |
| `package.json` | Lists all dependencies and defines `npm run dev` / `npm run build` / `npm run start`. |
| `tsconfig.json` | TypeScript configuration — `@/*` path alias maps to the project root. |
| `AGENTS.md` | Auto-generated by Next.js 16 to warn AI assistants that this version of Next.js has breaking API changes from older versions. |

---

## 🔄 How It All Connects

```
User visits /dashboard
    ↓
proxy.ts checks: is this /admin/* route? → No, pass through
    ↓
app/layout.tsx renders → wraps with <AuthProvider>
    ↓
app/dashboard/page.tsx renders
    ↓
Uses useAuth() from lib/auth-context.tsx → checks if logged in + 2FA verified
    ↓
Renders <AppShell> from components/layout/AppShell.tsx (sidebar + bottom nav)
    ↓
Renders <ActionPanel> from components/attendance/ActionPanel.tsx
    ↓
ActionPanel uses useAttendanceStatus() hook
    ↓
Hook calls subscribeToTodayEvents() from lib/attendance.ts
    ↓
Firestore real-time listener → derives status → enables correct buttons
    ↓
User clicks "Clock In" → recordAttendanceEvent() writes to IndexedDB (offline-safe)
    ↓
When online: Firestore syncs automatically → listener fires → UI updates
```

---

## 🔐 Security Model

| Layer | Mechanism |
|---|---|
| Employee login | Firebase Authentication (email + password) |
| Employee 2FA | TOTP via `otplib`, verified **server-side** at `/api/auth/verify-totp` |
| Admin login | Root credentials checked server-side, session stored in **httpOnly cookie** |
| Admin route protection | `proxy.ts` intercepts every `/admin/*` request at the edge |
| Data isolation | Firestore Security Rules — employees read/write only their own records |
| Secret protection | TOTP secret and admin password never sent to the browser |

---

## 📦 Key Dependencies

| Package | Why |
|---|---|
| `firebase` | Client SDK — Auth, Firestore with offline persistence |
| `firebase-admin` | Server SDK — secure server-side Firestore reads in API routes |
| `otplib` | TOTP secret generation + token verification |
| `qrcode.react` | Renders the QR code during 2FA setup |
| `lucide-react` | Icon library (consistent, tree-shakeable) |
| `date-fns` | Date formatting and arithmetic for reports |
| `jspdf` + `jspdf-autotable` | PDF generation for admin reports |
| `js-cookie` | Cookie utilities (client-side admin session checks) |
