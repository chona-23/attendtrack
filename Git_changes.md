# Git Commit Changes Log

## Latest Commit: `ec2c6064`
* **Date & Timestamp:** Sunday, October 4, 2026 — 20:46:17 (`2026-10-04T20:46:17-06:00`)
* **Branch:** `main` (synchronized with `origin/main`)
* **Commit Message:** `Fix static export API fetch false positive in AdminLoginPage`

---

### Summary of Actions Taken

1. **Staged and Committed Modified Files:**
   - [`app/admin/login/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/login/page.tsx): Fixed static export API fetch false positive (`Content-Type: text/html` fallback returning 200 OK) so non-JSON responses do NOT set `apiSuccess = true`. Enforced strict root admin credential validation (`nachoyal@gmail.com` and `_88122300_`), rejecting invalid attempts like `nachoyal@hotmail.com` or wrong passwords.
   - [`Changes_up_to_date.md`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/Changes_up_to_date.md): Appended Section 20 documenting implementation plan, root causes, summary, and key adjustments.

2. **Verification:**
   - Executed `npm run build` — compiled and statically exported 20/20 pages with **0 errors**.

3. **Pushed to GitHub & Deployed to Production:**
   - Created commit `ec2c6064`: *"Fix static export API fetch false positive in AdminLoginPage"*.
   - Pushed successfully to `origin/main`.
   - Deployed live to Firebase Hosting via `npx -y firebase-tools deploy --only hosting` (`testchecker-4caeb.web.app` / `testchecker-4caeb.firebaseapp.com`).

---

## Latest Commit: `79d56393`
* **Date & Timestamp:** Sunday, October 4, 2026 — 20:35:12 (`2026-10-04T20:35:12-06:00`)
* **Branch:** `main` (synchronized with `origin/main`)
* **Commit Message:** `Fix 2FA setup redirection, employee soft-delete/re-enable, admin auth password check & 2FA reset option`

---

### Summary of Actions Taken

1. **Staged and Committed Modified Files:**
   - [`app/setup-2fa/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/setup-2fa/page.tsx): Updated completion handler to clear TOTP session state, sign out, and redirect to `/login?setupSuccess=true`. Added automatic redirect to `/login` if `totpEnabled` is already true.
   - [`app/login/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/login/page.tsx): Added `setupSuccess` query param listener and green alert banner notifying employee that 2FA configuration completed.
   - [`app/admin/employees/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/employees/page.tsx): Added employee soft-delete button ("Deshabilitar") ensuring all database records persist, added re-enable button ("Habilitar"), added status badges ("Deshabilitado"), and status filter tabs ("Todos", "Activos", "Deshabilitados").
   - [`app/admin/login/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/login/page.tsx): Enforced strict root admin credential validation (`nachoyal@gmail.com` and `_88122300_`), rejecting any invalid password attempts.
   - [`app/verify-2fa/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/verify-2fa/page.tsx): Added "Re-configurar 2FA" action and confirmation box for employees who changed phones or lost authenticator account access.
   - [`Changes_up_to_date.md`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/Changes_up_to_date.md): Appended Section 19 documenting implementation plan, root causes, summary, and key adjustments.

2. **Verification:**
   - Executed `npm run build` — compiled and statically exported 20/20 pages with **0 errors**.

3. **Pushed to GitHub & Deployed to Production:**
   - Created commit `dd8abd52`: *"Fix 2FA setup redirection, employee soft-delete/re-enable, admin auth password check & 2FA reset option"*.
   - Pushed successfully to `origin/main`.
   - Deployed live to Firebase Hosting via `npx -y firebase-tools deploy --only hosting` (`testchecker-4caeb.web.app` / `testchecker-4caeb.firebaseapp.com`).

---

## Latest Commit: `bfd5622e`
* **Date & Timestamp:** Friday, September 25, 2026 — 10:30:44 (`2026-09-25T10:30:44-06:00`)
* **Branch:** `main` (synchronized with `origin/main`)
* **Commit Message:** `Add Vacaciones/Incapacidad tab, search bar, and records status filters`

---

### Summary of Actions Taken

1. **Staged and Committed Modified Files:**
   - [`app/admin/incidences/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/incidences/page.tsx): Added `"Vacaciones / Incapacidad 🏖️"` filter tab and integrated real-time search bar across employee name, email, notes, and type.
   - [`app/admin/records/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/records/page.tsx): Added `subscribeToAllIncidences` integration, real-time worker status computation for approved time-off requests, and added `"Ausente"`, `"Vacaciones"`, and `"Incapacidad Médica"` filter options to the dropdown menu.
   - [`Changes_up_to_date.md`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/Changes_up_to_date.md): Appended Section 18 recording the complete implementation plan, rationale, and file modifications.

2. **Verification:**
   - Ran `npm run build` — compiled and statically exported 20/20 pages with **0 errors**.

3. **Pushed to GitHub & Deployed to Production:**
   - Created commit `bfd5622e`: *"Add Vacaciones/Incapacidad tab, search bar, and records status filters"*.
   - Pushed successfully to `origin/main`.
   - Deployed live to Firebase Hosting via `npx firebase-tools deploy --only hosting` (`testchecker-4caeb.web.app`).

---

## Previous Commit: `1e465183`
* **Date & Timestamp:** Thursday, September 24, 2026 — 15:50:00 (`2026-09-24T15:50:00-06:00`)
* **Branch:** `main`
* **Commit Message:** `Update authentication, layout wrappers, static export settings, and project documentation`

---

### Summary of Actions Taken (Commit `1e465183`)

1. **Staged and Committed Modified Files:**
   - [`app/admin/login/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/admin/login/page.tsx): Enforced dual-credential matching (`email` AND `password`) for client fallback.
   - [`app/dashboard/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/dashboard/page.tsx), [`app/history/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/history/page.tsx), [`app/profile/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/profile/page.tsx): Wrapped page loading indicators within `AppShell`.
   - [`app/page.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/app/page.tsx): Preserved `/admin` routing without premature client router replacements.
   - [`components/layout/AppShell.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/components/layout/AppShell.tsx): Fixed active nav link highlighting for root/dashboard paths.
   - [`firebase.json`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/firebase.json) & [`next.config.ts`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/next.config.ts): Added `cleanUrls: true` and `trailingSlash: true` configuration.
   - [`lib/auth-context.tsx`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/lib/auth-context.tsx): Added safety timers to prevent perpetual auth loading states.
   - [`Changes_up_to_date.md`](file:///Users/imaganal/Documents/CSCOMSFT%20copy/drap_store/Anti/Changes_up_to_date.md): Updated project change logs.

2. **Verification:**
   - Ran `npm run build` — compiled and statically exported with **0 errors**.

3. **Pushed to GitHub:**
   - Created commit `1e465183`: *"Update authentication, layout wrappers, static export settings, and project documentation"*.
   - Pushed successfully to `origin/main`. Working tree is now completely clean.
