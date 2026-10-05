# AttendTrack — Master History of Changes & Implementation Log

**Last Updated:** Thursday, September 24, 2026 — 14:10:48 (Local Time: `2026-09-24T14:10:48-06:00`)  
**Project Repository:** `https://github.com/chona-23/attendtrack.git` (Branch: `main`)  
**Production Hosting URL:** `https://testchecker-4caeb.web.app`  

---

## 📌 Executive Summary

This document maintains the complete, comprehensive, and chronological record of all feature requests, bug fixes, architectural refactoring, and user interface enhancements implemented across the **AttendTrack** Enterprise Attendance PWA codebase. It serves as an authoritative persistence log to preserve system context and implementation details across agent sessions.

---

## 📜 Full Chronological Trajectory & Change History

### 1. Site Deployment & Firebase Hosting Setup
* **Date & Context:** Initial Phase — Hosting & Environment Setup
* **User Issue / Request:** Site was not accessible on the web URL (`I Still do not see my site ah I'm missing?`).
* **Root Cause:** Missing static export configuration in Next.js and unconfigured Firebase Hosting target.
* **Fix Applied & Implementation Summary:**
  - Configured `output: "export"` in `next.config.ts` for static generation.
  - Configured `firebase.json` and `.firebaserc` pointing to Firebase project `testchecker-4caeb`.
  - Built static bundle and deployed to `https://testchecker-4caeb.web.app`.

---

### 2. Admin Login Connection Failure (`Error de conexión`)
* **Date & Context:** Phase 1 — Admin Access & Security
* **User Issue / Request:** Admin login threw `Error de conexión. Por favor intente más tarde.` when attempting to log into `/admin/login`.
* **Root Cause:** Environment variable naming mismatch (`ADMIN_EMAIL` vs `NEXT_PUBLIC_ADMIN_EMAIL`) and missing client-side fallback handling.
* **Fix Applied & Implementation Summary:**
  - Standardized `.env.local` variables for admin credentials.
  - Updated [`app/admin/login/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/login/page.tsx) and [`app/api/admin/verify/route.ts`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/api/admin/verify/route.ts) with multi-stage authentication (API -> Firebase Auth -> Client Root Credential Check).

---

### 3. Employee Work Profile Visibility Switch ("Visibilidad del Empleado")
* **Date & Context:** Phase 1 — Admin Employee Management
* **User Issue / Request:** The "Visibilidad del Empleado" toggle was always resetting to "off" in Admin, and employees could not view their work profile details.
* **Root Cause:** Missing bidirectional property mapping between `profileVisible` and `showWorkProfile` in Firestore document updates.
* **Fix Applied & Implementation Summary:**
  - Updated [`app/admin/employees/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/employees/page.tsx) to persist both `profileVisible` and `showWorkProfile` flags.
  - Updated [`app/api/admin/employees/route.ts`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/api/admin/employees/route.ts) to write both fields in Firestore.
  - Updated employee dashboard profile cards to respect `profileVisible`.

---

### 4. Git Repository Clean-Up (10K+ Pending Files)
* **Date & Context:** Phase 2 — Repository Maintenance
* **User Issue / Request:** Git repo had over 10,000 pending/untracked changes.
* **Root Cause:** `.gitignore` was missing build output directories (`.next/`, `out/`, `node_modules/`, `.firebase/`).
* **Fix Applied & Implementation Summary:**
  - Updated `.gitignore` to ignore build artifacts.
  - Removed tracked build files from git cache (`git rm -r --cached`).
  - Staged, committed, and pushed clean state to `https://github.com/chona-23/attendtrack.git`.

---

### 5. Spanish Translation & Light Theme Styling Fixes
* **Date & Context:** Phase 2 — UI/UX Polish
* **User Issue / Request:** Login screen remained in English and light mode styling lacked contrast.
* **Root Cause:** Hardcoded English labels and unharmonized CSS color tokens in light mode.
* **Fix Applied & Implementation Summary:**
  - Translated all text across `/login` and `/admin/login` to Spanish.
  - Refactored `index.css` CSS variables for slate/gray contrast in light mode.
  - Updated [`components/ui/ThemeToggle.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/components/ui/ThemeToggle.tsx) for instant theme switching.

---

### 6. Custom Branding & High-Resolution Logo Integration
* **Date & Context:** Phase 2 — Branding & Assets
* **User Issue / Request:** Replace default generic icons on login screens with custom branding image.
* **Fix Applied & Implementation Summary:**
  - Embedded custom `icon.png` into `/public/icon.png`.
  - Replaced Lucide icons on `/login` and `/admin/login` headers with styled Next.js `<Image>` containers featuring subtle glow and shadow effects.

---

### 7. Branching, Testing & Rollback Architecture Plan (PDF Artifact)
* **Date & Context:** Phase 3 — Architecture & Deployment Planning
* **User Issue / Request:** Present an implementation plan for feature branching, API testing, and rollback strategy, exported as PDF.
* **Fix Applied & Implementation Summary:**
  - Created detailed markdown strategy documenting Git branching (`feature/*`), environment isolation (`dev`, `staging`, `prod`), and zero-downtime rollback procedures.
  - Compiled and generated [`feature_deployment_and_rollback_plan.pdf`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/feature_deployment_and_rollback_plan.pdf).

---

### 8. Paid Time-Off ("Vacaciones") & Medical Leave ("Incapacidad Médica")
* **Date & Context:** Phase 4 — Core Feature Addition
* **User Issue / Request:** Employees must be able to submit multi-day Vacaciones and Incapacidades Médicas. Employees on approved leave MUST NOT be marked as "Ausente".
* **Implementation Summary:**
  Integrated date range selection (`startDate` & `endDate`) into employee incidence submission form, allowing multi-day time-off requests.
* **Key Adjustments Applied:**
  1. [`lib/incidences.ts`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/lib/incidences.ts): Enhanced `recordIncidence` to loop through all calendar days in the date range and create daily Firestore records.
  2. [`app/dashboard/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/dashboard/page.tsx): Added `Fecha de Inicio` and `Fecha de Fin` date range pickers when "Vacaciones" or "Incapacidad Médica" is selected.
  3. [`lib/reports.ts`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/lib/reports.ts): Expanded `DailyStatus` to include `vacation` and `medical_leave`, ensuring employees on approved leave are excluded from absence counts (`daysAbsent`).

---

### 9. Admin Official Holidays Module ("Días Festivos")
* **Date & Context:** Phase 4 — Admin Calendar Control
* **User Issue / Request:** Admins must be able to flag official company/national holidays ("Días Festivos") so employees are not marked as absent.
* **Implementation Summary:**
  Built administrative control module for designating official company/national holidays.
* **Key Adjustments Applied:**
  1. [`lib/holidays.ts`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/lib/holidays.ts): Created Firestore collection `holidays` CRUD and real-time subscription helpers.
  2. [`app/admin/incidences/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/incidences/page.tsx): Added a dedicated **"Días Festivos 🌟"** tab for adding/removing official holidays.
  3. [`lib/reports.ts`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/lib/reports.ts): Integrated holiday lookup into daily status calculations (`status = "holiday"`), preventing workers from being marked absent on official holidays.

---

### 10. Local Development Server Error Fix (`http://localhost:3000`)
* **Date & Context:** Phase 5 — Development Environment Stability
* **User Issue / Request:** `/admin/login` displayed `"Internal server error"` on `http://localhost:3000`, but worked on production.
* **Root Cause:** Next.js dev server executed [`app/api/admin/verify/route.ts`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/api/admin/verify/route.ts), which threw an uncaught exception due to client-side Firebase SDK imports in Node runtime.
* **Implementation Summary:**
  Fixed `/admin/login` connection failure on local dev server (`http://localhost:3000`).
* **Key Adjustments Applied:**
  1. [`app/api/admin/verify/route.ts`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/api/admin/verify/route.ts): Removed client-side Firebase SDK imports that caused Node runtime crashes in Next.js server mode.
  2. [`app/admin/login/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/login/page.tsx): Updated submission handler so 500/network errors cleanly fall through to client-side authentication instead of displaying "Internal server error".

---

### 11. Multi-Day Period Grouping & Single-Click Approval in Admin
* **Date & Context:** Phase 5 — Admin UX Optimization
* **User Issue / Request:** Multi-day vacation requests generated multiple daily cards in Admin Incidences, forcing admins to approve each day individually.
* **Implementation Summary:**
  Grouped consecutive daily records into period items with single-button batch approval in the Admin Incidences console.
* **Key Adjustments Applied:**
  1. [`lib/incidences.ts`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/lib/incidences.ts): Added `updateBatchIncidenceStatus(incidenceIds: string[], status: IncidenceStatus)` using Firestore `writeBatch`.
  2. [`app/admin/incidences/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/incidences/page.tsx): Added `useMemo` grouping logic (`groupedPeriods`) merging daily records by employee, type, date range, and notes into single period cards.
  3. Rendered single action buttons: **"Aprobar Periodo Completo"** and **"Rechazar Periodo"**, reducing admin approval from $N$ clicks to 1 click.

---

### 12. "Días Ausente" & "Salida No Confirmada" Calculation Fixes
* **Date & Context:** Phase 6 — Attendance Calculations & Auditing
* **User Issue / Request:**
  1. **Días Ausente**: Fix absence calculation. Populated working days in a date range for each employee. Exclude Sundays (`getDay() === 0`), official Holidays, approved Vacaciones, and Incapacidades. If an employee has no Clock-In on a working day, mark as **"Ausente"** (`daysAbsent++`).
  2. **Salida No Confirmada**: Past days with Clock-In but missing Clock-Out must NOT display "En Curso". Flag as **"Salida no confirmada"** with an **Orange badge** and 0 worked minutes (to prevent false overtime).
* **Implementation Summary:**
  Corrected absence calculations for report generation and added orange status flagging for past unconfirmed check-outs.
* **Key Adjustments Applied:**
  1. [`lib/reports.ts`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/lib/reports.ts): Rewrote `aggregateDailyReports` to iterate through every calendar date in the requested date range for each employee.
  2. **Sunday Exclusion**: Automatically skips Sundays (`getDay() === 0`) as non-working days.
  3. **Absence Population**: Marks working days without a Clock-In (and not on holiday/vacation/medical leave) as **"Ausente"** (`status = "absent"`), accurately populating `daysAbsent`.
  4. **Salida No Confirmada**: Flagged past days (`date < todayDate`) with Clock-In but missing Clock-Out as **"Salida no confirmada"** with an **Orange badge** and 0 worked minutes (preventing false overtime accumulation).
  5. [`app/admin/reports/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/reports/page.tsx) & [`app/history/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/history/page.tsx): Updated badge rendering for `unconfirmed_out` with orange styling (`bg-amber-100 text-amber-800 border-amber-300`).

---

### 13. Employee Dashboard ("Tus Incidencias") Period Grouping
* **Date & Timestamp:** Thursday, September 24, 2026 — 13:54:07 (`2026-09-24T13:54:07-06:00`)
* **User Issue / Request:** In the worker profile dashboard (`app/dashboard/page.tsx`), under "Tus Incidencias", multi-day leave requests (such as **Vacaciones** or **Incapacidad Médica**) were displayed as separate individual rows for each date. The user requested that consecutive daily records be consolidated into a single period item (e.g. `Periodo: 2026-09-24 al 2026-09-28 (5 días)`), matching the Admin interface grouping behavior.
* **Root Cause:** The incidence list mapped over raw daily Firestore documents directly without grouping.
* **Implementation Summary:**
  Grouped multi-day time-off requests into single period rows in the worker profile dashboard for clean visualization.
* **Key Adjustments Applied:**
  1. [`app/dashboard/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/dashboard/page.tsx): Implemented `useMemo` grouping function (`groupedUserPeriods`) aggregating daily incidence records by `userId`, `type`, `startDate`, `endDate`, and `notes`.
  2. Under **"TUS INCIDENCIAS"**, multi-day leave requests render as a single row featuring a day count badge (e.g. `5 días`) and period date range label (`Periodo: 2026-09-24 al 2026-09-28 (5 días)`).
  3. Single-day requests continue to render as individual items.

---

## 🛠️ File Modification Reference Matrix

| Component / Module | Files Modified | Purpose |
| :--- | :--- | :--- |
| **Admin Authentication** | `app/admin/login/page.tsx`<br>`app/api/admin/verify/route.ts` | Credentials validation, fallback mechanisms, 500 error resilience. |
| **Employee Management** | `app/admin/employees/page.tsx`<br>`app/api/admin/employees/route.ts` | Profile visibility switch & Firestore schema sync. |
| **Incidences & Time-Off** | `lib/incidences.ts`<br>`app/dashboard/page.tsx`<br>`app/admin/incidences/page.tsx` | Vacaciones, Incapacidades, period grouping (admin & employee dashboard) & batch approval. |
| **Holidays** | `lib/holidays.ts`<br>`app/admin/incidences/page.tsx` | Official holiday CRUD & Firestore subscription. |
| **Reporting & Absences** | `lib/reports.ts`<br>`app/admin/reports/page.tsx`<br>`lib/export.ts` | Sunday exclusion, absent day population, "Salida no confirmada" badge. |
| **History View** | `app/history/page.tsx` | Unconfirmed exit detection and orange badge rendering. |
| **Theme & Assets** | `app/globals.css`<br>`components/ui/ThemeToggle.tsx`<br>`public/icon.png` | Dark/light mode variables, Spanish labels, custom branding. |

---

## 🔒 Deployment & Verification Protocol

- **Local Verification:** All changes have been compiled and verified with `npm run build` (20/20 static pages generated with 0 errors).
- **Production Deployment Status:** In accordance with explicit user instructions, **no changes have been automatically deployed to Firebase Production or pushed to GitHub `main`**.
- **Deployment Procedure:**
  1. `npm run build`
  2. `git push origin main`
  3. `npx firebase-tools deploy --only hosting`

---

### 14. Infinite Loading Fix on Auth Restoration (`/dashboard`)
* **Date & Timestamp:** Thursday, September 24, 2026 — 14:30:00 (`2026-09-24T14:30:00-06:00`)
* **User Issue / Request:** Navigating to or refreshing `https://testchecker-4caeb.firebaseapp.com/dashboard` (or `http://localhost:3000/dashboard`) would hang indefinitely showing a loading spinner.
* **Root Cause:** In [`lib/auth-context.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/lib/auth-context.tsx), the `onAuthStateChanged` callback executed `await getDoc(doc(db, "users", firebaseUser.uid))` without exception handling (`try/catch`). If Firestore network requests delayed, stalled, or threw permission/offline errors, execution exited the callback before reaching `setLoading(false)`, leaving `loading = true` indefinitely.
* **Implementation Summary:** Wrapped user profile fetching in a `try/catch` block and added a 3-second safety timeout fallback (`safetyTimer`) within `AuthProvider`.
* **Key Adjustments Applied:**
  1. [`lib/auth-context.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/lib/auth-context.tsx): Wrapped `getDoc` call in `try / catch` so any network errors log gracefully without preventing `setLoading(false)`.
  2. [`lib/auth-context.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/lib/auth-context.tsx): Added a 3000ms safety timeout that guarantees `setLoading(false)` executes even under slow or interrupted network conditions.

---

### 15. Seamless Client Navigation & Full-Page Refresh Elimination (`/dashboard` <-> `/history` <-> `/profile`)
* **Date & Timestamp:** Thursday, September 24, 2026 — 14:49:00 (`2026-09-24T14:49:00-06:00`)
* **User Issue / Request:** Navigating between worker profile sections (e.g., from `/history` back to `/dashboard` or `/profile`) caused a full-page refresh/flicker and brief unmounting of the entire interface.
* **Root Cause:**
  1. In [`components/layout/AppShell.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/components/layout/AppShell.tsx), the navigation link for "Inicio" was configured as `href: "/"`. Clicking "Inicio" routed to `RootPage` ([`app/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/page.tsx)), which displayed a full-screen loading spinner and executed `router.replace("/dashboard")`, creating a jarring redirect loop.
  2. In [`app/dashboard/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/dashboard/page.tsx), [`app/history/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/history/page.tsx), and [`app/profile/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/profile/page.tsx), loading state checks returned standalone full-screen spinners outside of [`AppShell`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/components/layout/AppShell.tsx). This caused the sidebar and outer layout to unmount and remount on every route transition.
* **Implementation Summary:**
  1. Pointed the "Inicio" navigation link directly to `/dashboard` in `AppShell`.
  2. Wrapped loading indicator states inside `<AppShell>` across all worker pages so the persistent sidebar, header, and frame remain mounted during SPA route transitions.
* **Key Adjustments Applied:**
  1. [`components/layout/AppShell.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/components/layout/AppShell.tsx): Changed `navItems` link from `href: "/"` to `href: "/dashboard"` and updated active route matching logic for both Sidebar and BottomNav.
  2. [`app/dashboard/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/dashboard/page.tsx): Wrapped initial `loading` check inside `<AppShell>`.
  3. [`app/history/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/history/page.tsx): Wrapped initial `authLoading` check inside `<AppShell>`.
  4. [`app/profile/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/profile/page.tsx): Wrapped initial `loading` check inside `<AppShell>`.

---

### 16. Admin Route Direct Access Fix (`/admin/login` -> `/login` Fallback Resolution)
* **Date & Timestamp:** Thursday, September 24, 2026 — 15:07:00 (`2026-09-24T15:07:00-06:00`)
* **User Issue / Request:** Navigating directly via browser URL bar or refreshing `https://testchecker-4caeb.firebaseapp.com/admin/login` redirected users to `https://testchecker-4caeb.firebaseapp.com/login` instead of rendering the Admin Login console.
* **Root Cause:**
  1. [`firebase.json`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/firebase.json) was missing `"cleanUrls": true`. When accessing `/admin/login` directly without `.html`, Firebase Hosting failed to map the path to `out/admin/login.html` and triggered the fallback rewrite rule `{ "source": "**", "destination": "/index.html" }`.
  2. The fallback rendered `RootPage` ([`app/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/page.tsx)), which evaluated `!user` for worker authentication and redirected the browser to `/login`.
* **Implementation Summary:**
  1. Enabled `"cleanUrls": true` in `firebase.json` so Firebase Hosting maps clean URLs directly to static HTML export files.
  2. Updated `RootPage` ([`app/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/page.tsx)) to detect if the target URL path starts with `/admin` and avoid redirecting to employee `/login`.
* **Key Adjustments Applied:**
  1. [`firebase.json`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/firebase.json): Added `"cleanUrls": true` under `hosting` configuration.
  2. [`app/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/page.tsx): Added `window.location.pathname.startsWith("/admin")` check to preserve admin route targets upon static fallthrough.

---

### 17. Admin Login Password Verification Fix
* **Date & Timestamp:** Thursday, September 24, 2026 — 15:25:00 (`2026-09-24T15:25:00-06:00`)
* **User Issue / Request:** On `/admin/login/`, entering any arbitrary password for `nachoyal@gmail.com` (such as `1234567890`) was bypassing authentication and granting admin access instead of requiring the designated admin password (`_88122300_`).
* **Root Cause:** In [`app/admin/login/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/login/page.tsx), when client-side Firebase Auth authentication failed or was skipped in static hosting mode, the fallback `catch` block evaluated `email.trim().toLowerCase() === "nachoyal@gmail.com"` without validating `password === adminPassword`. This allowed any input string in the password field to set `authenticated = true`.
* **Implementation Summary:** Enforced strict dual-credential matching (`email` AND `password`) in the static hosting fallback block of `AdminLoginPage`.
* **Key Adjustments Applied:**
  1. [`app/admin/login/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/login/page.tsx): Defined `adminPassword` (`process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "_88122300_"`) and updated fallback logic to check `email.trim().toLowerCase() === adminEmail.toLowerCase() && password === adminPassword`.
  2. Any incorrect password attempt now cleanly triggers `"Credenciales de administrador inválidas."` and blocks authorization.

---

### 18. Incidences Filter Tab ("Vacaciones/Incapacidad"), Incidences Search Bar & Attendance Record Status Filters
* **Date & Timestamp:** Friday, September 25, 2026 — 10:03:00 (`2026-09-25T10:03:00-06:00`)
* **User Issue / Request:**
  1. Add a dedicated section/tab at `/admin/incidences/` to filter by **"Vacaciones/Incapacidad"**, displaying only records for employees on Vacation or Medical Leave.
  2. Add the same live search input functionality as featured in "Registros de Asistencia" and "Empleados".
  3. At `/admin/records/` ("Registros de Asistencia"), add new state status filters for **"Ausente"**, **"Vacaciones"**, and **"Incapacidad"**.
* **Implementation Summary:**
  1. Built `"Vacaciones / Incapacidad 🏖️"` tab in Admin Incidences and integrated real-time text search filtering across employee name, email, and notes.
  2. Integrated real-time approved incidence tracking into Admin Attendance Records (`/admin/records/`) and added `"Ausente"`, `"Vacaciones"`, and `"Incapacidad Médica"` filter options to the event/status dropdown menu.
* **Key Adjustments Applied:**
  1. [`app/admin/incidences/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/incidences/page.tsx):
     - Added `{ label: "Vacaciones / Incapacidad 🏖️", value: "vacation_medical" }` to `STATUS_TABS`.
     - Integrated `search` state and `Search` icon input bar filtering records by `userName`, `userEmail`, `notes`, or `type`.
     - Implemented `vacation_medical` tab filter returning grouped periods where `p.type === "vacation" || p.type === "medical_leave"`.
  2. [`app/admin/records/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/records/page.tsx):
     - Added `subscribeToAllIncidences` real-time listener to cross-reference active approved time-off requests.
     - Updated worker status evaluation to automatically detect `"vacation"` (`En Vacaciones 🏖️`), `"medical_leave"` (`Incapacidad Médica 🏥`), and `"absent"` (`Sin registro hoy (Ausente)`).
     - Added `<optgroup label="Estados e Incidencias">` to dropdown select with options for `absent` ("Ausente"), `vacation` ("Vacaciones"), and `medical_leave` ("Incapacidad Médica").

---

### 19. 2FA Setup Flow Redirection, Employee Soft-Delete / Re-Enable, Strict Admin Auth & 2FA Reset Option
* **Date & Timestamp:** Sunday, October 4, 2026 — 20:33:00 (`2026-10-04T20:33:00-06:00`)
* **User Issue / Request:**
  1. At `/setup-2fa/`: After finishing the 2FA setup process, the page loops back to `/setup-2fa` instead of redirecting to `/login`.
  2. Under `/admin/employees/`: Add an option to soft-delete/disable users while guaranteeing all database records (attendance events, incidences) persist. Also add an option to re-enable ("Habilitar") disabled employees.
  3. At `/admin/login`: `/admin` was accepting any password instead of strictly authenticating against the admin user's password (`_88122300_`).
  4. Inside `/verify-2fa/`: Add an option so users can re-enable or re-activate 2FA in case they changed their phone or deleted their authenticator account by mistake.
* **Root Cause & Rationale:**
  1. `setup-2fa` post-verification handler was previously routing to `/dashboard` directly without clearing session state or signing out, causing state loops when returning to `/setup-2fa`.
  2. Employee management lacked explicit status toggles and filtering for `disabled` state while preserving historical Firestore attendance and incidence collections.
  3. Client fallback in `/admin/login` was permitting valid Firebase Auth user log-ins to grant admin access without verifying that the entered password matched the designated root admin password (`_88122300_`).
  4. `verify-2fa` lacked a user-facing reset workflow to clear stale `totpSecret` / `totpEnabled` flags when authenticator apps were lost or replaced.
* **Implementation Summary:**
  1. Updated `app/setup-2fa/page.tsx` so completing TOTP setup sets `totpEnabled: true`, signs out current auth session, and redirects to `/login?setupSuccess=true`. Added `setupSuccess` banner in `app/login/page.tsx`.
  2. Updated `app/admin/employees/page.tsx` with employee `disabled` status flags, a "Deshabilitar" button (soft-delete preserving all database records), a "Habilitar" button (re-activating users), and status filter tabs ("Todos", "Activos", "Deshabilitados").
  3. Updated `app/admin/login/page.tsx` to strictly enforce admin password verification (`_88122300_` / `ADMIN_PASSWORD`), rejecting invalid attempts with `"Credenciales de administrador inválidas."`.
  4. Added a "Re-configurar 2FA" action on `/verify-2fa` (`app/verify-2fa/page.tsx`) allowing employees to reset their TOTP secret and safely re-scan a new QR code on `/setup-2fa`.
* **Key Adjustments Applied:**
  1. [`app/setup-2fa/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/setup-2fa/page.tsx):
     - Added immediate redirect to `/login` if `profile.totpEnabled` is already active.
     - Updated completion step to display success banner, sign out, and route to `/login?setupSuccess=true`.
  2. [`app/login/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/login/page.tsx):
     - Added `setupSuccess` query param detection and success alert banner.
  3. [`app/admin/employees/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/employees/page.tsx):
     - Added `disabled?: boolean` to `Employee` model.
     - Added `handleReEnable` handler and updated modal footer with "Habilitar" and "Deshabilitar" buttons.
     - Added status filter bar ("Todos", "Activos", "Deshabilitados") and "Deshabilitado" badges.
  4. [`app/admin/login/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/login/page.tsx):
     - Strictly enforced dual check on admin email (`nachoyal@gmail.com`) and admin password (`_88122300_`), blocking arbitrary password logins.
  5. [`app/verify-2fa/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/verify-2fa/page.tsx):
     - Added `handleReset2FA` method and UI confirmation block allowing employees to clear TOTP secret and navigate to `/setup-2fa`.

---

### 20. Fix Admin Login Static Export API Route False-Positive Bypassing Password Validation
* **Date & Timestamp:** Sunday, October 4, 2026 — 20:44:00 (`2026-10-04T20:44:00-06:00`)
* **User Issue / Request:** On `/admin/login/`, entering arbitrary email addresses (such as `nachoyal@hotmail.com`) with arbitrary passwords (such as `3172361872361873`) was still bypassing authentication and granting admin access instead of rejecting with an invalid credentials error.
* **Root Cause:**
  - On static hosting (Firebase Hosting static export), calling `fetch("/api/admin/verify")` triggers Firebase Hosting's SPA/cleanUrls fallback rule, which returns the static HTML page with HTTP Status `200 OK` (`Content-Type: text/html`).
  - In [`app/admin/login/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/login/page.tsx), `if (res.ok)` evaluated to `true` for HTTP status 200, setting `apiSuccess = true` regardless of response content type or body.
  - Because `apiSuccess` was set to `true`, the static fallback credentials check (`if (!apiSuccess)`) was bypassed entirely, setting `admin_logged_in = true` and granting admin access for ANY email and password combination.
* **Implementation Summary:**
  1. Updated `handleSubmit` in `AdminLoginPage` ([`app/admin/login/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/login/page.tsx)) to strictly check that `res.ok` is true AND `res.headers.get("content-type")` includes `application/json` AND `data.success === true` before setting `authenticated = true`.
  2. If the response is HTML (static hosting fallback), it safely falls through to strict credential validation: checking `cleanEmail === adminEmail` (`nachoyal@gmail.com`) AND `password === adminPassword` (`_88122300_`).
  3. Any login attempt with an unrecognized email (e.g. `nachoyal@hotmail.com`) or incorrect password now triggers `"Credenciales de administrador inválidas."` and blocks access.
* **Key Adjustments Applied:**
  1. [`app/admin/login/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/login/page.tsx):
     - Added `contentType.includes("application/json")` and `data?.success === true` condition to prevent static HTML `200 OK` responses from setting `authenticated = true`.
     - Enforced strict matching: `cleanEmail === adminEmail && password === adminPassword`.

---

### 21. Fix Employee Deshabilitar/Habilitar Firestore Persistence & Add Slide-to-Right Erase Feature
* **Date & Timestamp:** Sunday, October 4, 2026 — 21:15:00 (`2026-10-04T21:15:00-06:00`)
* **User Issue / Request:**
  1. Clicking "Deshabilitar" in `/admin/employees` was not persisting the disabled status or showing disabled users under the "Deshabilitados" filter tab.
  2. Need quick "Habilitar" option to re-enable disabled users directly from the employee list and edit modal.
  3. Add a new function allowing admins to erase/archive a user when their row is slided to the right ("Eliminar de Lista"), while strictly preserving all the user's historical attendance and incidence records in the database for reports.
* **Root Cause & Rationale:**
  - `handleDelete` in `app/admin/employees/page.tsx` was attempting a server `fetch("/api/admin/employees", { method: "DELETE" })`. On static hosting (Firebase Hosting), fetch returns HTTP Status 200 OK with `Content-Type: text/html`, so the `catch` block was bypassed and `setDoc` was never called to update Firestore `users` collection with `{ disabled: true }`.
  - Employee list lacked an interactive touch/drag gesture component to handle slide-to-right actions for erasing users from the menu while retaining database historical integrity.
* **Implementation Summary:**
  1. Updated `handleDelete` and `handleReEnable` in [`app/admin/employees/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/employees/page.tsx) to execute direct Firestore `setDoc(doc(db, "users", uid), { disabled: true/false }, { merge: true })` updates, ensuring status instantly persists across static hosting.
  2. Created `SwipeableEmployeeRow` component supporting touch gestures (`onTouchMove`) and mouse drag (`onMouseMove`) to slide rows to the right, revealing a red **"Eliminar de Lista"** action area.
  3. Added quick **"Habilitar"** action button to employee row cards for disabled users, allowing 1-click re-activation.
  4. Added status filter tabs: **"Todos"**, **"Activos"**, **"Deshabilitados"**, **"Eliminados"**. Erasing a user sets `{ erased: true, disabled: true }` in Firestore, removing them from active/disabled lists while preserving 100% of their records in `attendance` and `incidences` for `/admin/records` and `/admin/reports`.
* **Key Adjustments Applied:**
  1. [`app/admin/employees/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/employees/page.tsx):
     - Updated `Employee` model with `erased?: boolean` and `erasedAt?: string`.
     - Direct `setDoc` calls in `handleDelete` (`disabled: true`) and `handleReEnable` (`disabled: false`).
     - Added `SwipeableEmployeeRow` component with touch/mouse drag sliding to reveal Erase action.
     - Added `handleReEnableQuick` and `handleEraseQuick` row handlers.
     - Updated filter bar to include `"Todos"`, `"Activos"`, `"Deshabilitados"`, and `"Eliminados"`.


---

### 22. Fix JSON.parse Error on Employee Edit Save & Mobile Layout Improvements
* **Date & Timestamp:** Monday, October 5, 2026 — 10:45:00 (`2026-10-05T10:45:00-06:00`)
* **User Issue / Request:**
  1. When saving changes to an employee profile in `/admin/employees/`, the modal displayed: `"JSON.parse: unexpected end of data at line 1 column 1 of the JSON data"` and no changes were applied.
  2. On mobile view, the employee row card was visually broken — information was overlapping, the hidden "Eliminar de Lista" swipe-reveal text bled through the row, and the action buttons overflowed beyond the card width.
  3. The swipe-reveal area showed both a trash icon and the text "Eliminar de Lista" — user requested icon-only.
* **Root Cause:**
  - **JSON.parse error:** In `handleSave` of `app/admin/employees/page.tsx`, the code first called `fetch("/api/admin/employees", { method: "PATCH" })`. On static hosting, this returns HTML with a non-200 status code. When `!res.ok`, the code called `await res.json()` on an HTML response body — this caused the `JSON.parse: unexpected end of data` error. No Firestore write was executed, so changes were never saved.
  - **Mobile overflow:** The action bar (`flex items-center gap-2 flex-shrink-0`) contained a full-text Badge, "Habilitar" text button, and two icon buttons, which was too wide for small screens. Combined with `gap-4` on the row and `flex-wrap` on the info section, the layout collapsed/overlapped on mobile viewports.
  - **Swipe-reveal bleed:** The reveal area was `w-36` (144px), causing a portion of the red area to be visible at the edge of the card even before the user swiped.
* **Implementation Summary:**
  1. Refactored `handleSave` to **first write directly to Firestore** (`setDoc` with `merge: true`), making saves reliable in both static and server modes. The API call (`fetch PATCH`) is now a best-effort background call that is silently ignored if unavailable or if it returns non-JSON — `Content-Type: application/json` is checked before calling `res.json()` to prevent the JSON parse error.
  2. Fixed mobile layout in `SwipeableEmployeeRow`: reduced row gap to `gap-2 sm:gap-3`, padded with `px-3 sm:px-4 py-3`, reduced avatar to `w-9 h-9 sm:w-10 sm:h-10`, ensured info section has `min-w-0 overflow-hidden` for proper text truncation.
  3. Swipe-reveal area reduced from `w-36` to `w-16` (icon-only, no text). Swipe thresholds updated to 90/40/64 matching the new narrower area.
  4. On mobile: Badge status label replaced with a small coloured dot (`sm:hidden`), Badge text visible on `sm+`; "Habilitar" text hidden on mobile (icon only with `sm:inline`); status/disabled badge hidden on mobile (`hidden sm:inline`); workerType tag hidden on mobile (`hidden sm:inline`); grip handle hidden on mobile (`hidden sm:block`); action gap reduced to `gap-1`.
* **Key Adjustments Applied:**
  1. [`app/admin/employees/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/employees/page.tsx) — `handleSave`:
     - Removed `fetch` call as the primary save path. Now performs `setDoc` to Firestore first as the guaranteed write.
     - Added Content-Type guard (`ct.includes("application/json")`) before `res.json()` to prevent HTML parsing errors.
     - `fetch PATCH` call moved to a best-effort `try/catch` block that is silently ignored on static hosting.
  2. [`app/admin/employees/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/employees/page.tsx) — `SwipeableEmployeeRow`:
     - Swipe-reveal `div` reduced from `w-36` to `w-16`; removed "Eliminar de Lista" text, icon-only (Trash2 size 20).
     - Swipe thresholds updated: max drag `90px`, snap threshold `>40px`, snap target `64px`.
     - Grip handle hidden on mobile with `hidden sm:block`.
     - Row gap: `gap-2 sm:gap-3`; padding: `px-3 sm:px-4 py-3`.
     - Avatar: `w-9 h-9 sm:w-10 sm:h-10`.
     - Info section: `min-w-0 overflow-hidden` + name `truncate min-w-0`, status badges `hidden sm:inline`.
     - Action items: `gap-1`; Badge visible only on `sm+`, replaced by colour-coded `w-2 h-2` dot on mobile.
     - "Habilitar" text: `hidden sm:inline`, icon always visible.
     - Worker type tag: `hidden sm:inline`.


