# ⚔️ Adversarial Security Review – AttendTrack Enterprise

## 1️⃣ Threat Model Overview
| Asset | Potential Attackers | Impact |
|-------|--------------------|--------|
| **Firebase Auth / Firestore** | Malicious client, compromised admin credentials, insider | Unauthorized data read/write, data loss, privacy breach |
| **Export (CSV/PDF) functionality** | Malicious user, XSS payload injection | Arbitrary file injection, script execution on client |
| **Admin UI (React/Next.js)** | Cross‑site scripting (XSS), CSRF, UI‑spoofing | Session hijacking, privilege escalation |
| **Environment variables** | Build‑time leakage, client‑side exposure | API keys leaked, credential theft |
| **Browser‑side state (IndexedDB, localStorage)** | XSS, side‑channel data exfiltration | Persistent credential exposure |

---

## 2️⃣ Code‑Level Findings
| File / Area | Issue | Severity | Why It Matters |
|-------------|-------|----------|----------------|
| `lib/firebase.ts` | Firebase config values are exposed via `NEXT_PUBLIC_*` | **High** | API keys and project IDs become visible in the bundled client code. |
| `lib/firebase.ts` | No explicit Firestore security rules enforced in code | **High** | Mis‑configured rules could allow any client to write arbitrary attendance records. |
| `lib/export.ts` – CSV | Naïve string interpolation – no escaping of commas/quotes/newlines | **Medium** | Malicious payloads could be injected into CSV files (Excel formula injection, script execution). |
| `lib/export.ts` – PDF | `jsPDF` loads user data directly without sanitisation | **Medium** | Malicious strings could embed JavaScript or malformed SVG into PDFs. |
| `components/ui/Button.tsx` | Tailwind variant overrides caused invisible button text (fixed) | **Low** | UI confusion can hide dangerous actions, facilitating social‑engineering. |
| `app/admin/reports/page.tsx` | Export actions performed entirely client‑side with no server validation | **Medium** | A compromised client can tamper with date ranges or request data it shouldn’t see. |
| `app/admin/reports/page.tsx` | No anti‑CSRF measures for future POST‑style actions | **Medium** | Potential CSRF if POST endpoints are added later. |
| Overall React/Next.js | No Content‑Security‑Policy (CSP) headers in dev server | **Medium** | Allows injection of malicious scripts via XSS. |
| General | No rate‑limiting on export buttons | **Low** | Could lead to DoS or resource abuse. |

---

## 3️⃣ Recommended Hardening Steps
### 3.1 Harden Firebase / Firestore
1. **Restrict client‑side config** – keep only `NEXT_PUBLIC_FIREBASE_PROJECT_ID` client‑exposed. Move secret keys to server‑only env vars (`FIREBASE_API_KEY`, …). 
2. **Enforce Firestore security rules** (example):
```js
match /attendance/{docId} {
  allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
  // admin bypass
  allow read, write: if request.auth.token.admin == true;
}
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId || request.auth.token.admin == true;
}
```
Deploy with `firebase deploy --only firestore:rules`.
3. **Add a custom claim `admin`** to the admin user via the Firebase Admin SDK and verify it on every admin page (middleware). 

### 3.2 Secure Export Functions
- **CSV escaping** – wrap each cell in double quotes and escape interior quotes:
```ts
const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
```
- **PDF sanitisation** – strip `<` and `>` before feeding strings to `jsPDF`:
```ts
const safe = (s: string) => s.replace(/[<>]/g, '');
```
- **Validate date ranges** on the client (ensure they are within the user’s allowed scope). 

### 3.3 UI & Accessibility
- Keep the `!bg‑… !text‑…` overrides on export buttons **and** add `aria-disabled={exporting !== null}` for screen readers.
- Show a toast/notification confirming that a download has started. 

### 3.4 CSP & Security Headers (Production)
Add to `next.config.js`:
```js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none';" },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }];
}
``` 

### 3.5 Rate Limiting & Anti‑Abuse
- Disable the Export buttons for 2 seconds after a click (simple debounce). 
- In the future move PDF generation to a serverless function with per‑user quotas. 

### 3.6 Logging & Auditing
- Write an `exportLogs` collection in Firestore containing `userId`, `reportType`, `dateRange`, and a timestamp. 
- Enable Firestore rule‑logging for denied attempts. 

### 3.7 Testing & CI
- Add unit tests for `generateDailyCSV` / `generateSummaryCSV` covering commas, quotes, and newlines. 
- Add an e2e test (Playwright/Cypress) that clicks the Export buttons, verifies a download, and parses the file content for sanitisation. 

---

## 4️⃣ Quick‑Fix Patch Checklist
| # | Action | File(s) | Approx. Effort |
|---|--------|---------|----------------|
| 1 | Escape CSV cells (`escapeCSV`) | `lib/export.ts` | 10 min |
| 2 | Sanitize PDF strings (`safeText`) | `lib/export.ts` | 10 min |
| 3 | Add admin‑claim middleware for `/admin/**` | `app/admin/**` | 20 min |
| 4 | Keep `!bg‑… !text‑…` overrides on export buttons (already applied) | `app/admin/reports/page.tsx` | – |
| 5 | Add CSP headers in `next.config.ts` | `next.config.ts` | 5 min |
| 6 | Create `firestore.rules` with admin claim logic | – | 15 min |
| 7 | Log export events to Firestore | `app/admin/reports/page.tsx` | 10 min |
| 8 | Add basic unit tests for CSV generation | `__tests__/export.test.ts` | 30 min |
| 9 | Debounce Export buttons (2 s) | `app/admin/reports/page.tsx` | 10 min |

**Total estimated effort:** ~2 hours (excluding test‑framework setup). 

---

## 5️⃣ Next Steps
1. Apply the quick‑fix checklist (feel free to cherry‑pick). 
2. Deploy updated Firestore rules and verify that only admins (custom claim) can access the admin UI. 
3. Run the new unit/e2e tests in CI to catch regressions. 
4. Once stable, consider moving PDF generation to a server‑side endpoint for better control and throttling. 

---

*Prepared by Antigravity – your AI coding assistant.*
