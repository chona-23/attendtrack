# Enterprise Attendance PWA — Task List

## Phase 1: Bootstrap
- [x] Scaffold Next.js 14 project (TypeScript, Tailwind, App Router)
- [x] Install all dependencies (firebase, otplib, qrcode.react, lucide-react, next-pwa, jspdf, jspdf-autotable, date-fns)

## Phase 2: Config & Firebase
- [x] .env.local.example
- [x] lib/firebase.ts
- [x] next.config.js (PWA)
- [x] public/manifest.json
- [x] app/globals.css (design tokens, Inter font)
- [x] tailwind.config.ts (color palette)

## Phase 3: Auth Context & Middleware
- [x] lib/auth-context.tsx
- [x] lib/admin-context.tsx
- [x] middleware.ts (admin route guard)

## Phase 4: Employee Auth Pages
- [x] app/(auth)/login/page.tsx
- [x] app/(auth)/setup-2fa/page.tsx
- [x] app/(auth)/verify-2fa/page.tsx
- [x] app/api/auth/verify-totp/route.ts

## Phase 5: Admin Auth
- [x] app/admin/login/page.tsx
- [x] app/api/admin/verify/route.ts

## Phase 6: Shared UI Components
- [x] components/ui/Button.tsx
- [x] components/ui/Card.tsx
- [x] components/ui/Badge.tsx
- [x] components/ui/Input.tsx
- [x] components/ui/Modal.tsx
- [x] components/ui/Table.tsx

## Phase 7: Layout Components
- [x] components/layout/AppShell.tsx
- [x] components/layout/Sidebar.tsx
- [x] components/layout/BottomNav.tsx (mobile)
- [x] components/layout/AdminShell.tsx
- [x] components/layout/AdminSidebar.tsx

## Phase 8: Employee Dashboard
- [x] hooks/useAttendanceStatus.ts
- [x] hooks/useOnlineStatus.ts
- [x] lib/attendance.ts
- [x] components/attendance/ActionPanel.tsx
- [x] components/attendance/StatusBadge.tsx
- [x] components/attendance/TimelineCard.tsx
- [x] app/(dashboard)/page.tsx
- [x] app/(dashboard)/history/page.tsx
- [x] app/(dashboard)/profile/page.tsx

## Phase 9: Admin Panel
- [x] lib/reports.ts
- [x] lib/export.ts
- [x] app/admin/page.tsx (KPI dashboard)
- [x] app/admin/employees/page.tsx
- [ ] app/admin/records/page.tsx
- [ ] app/admin/reports/page.tsx
- [ ] app/api/admin/export/route.ts
- [ ] components/admin/KPICard.tsx
- [ ] components/admin/EmployeeTable.tsx
- [ ] components/admin/AttendanceTable.tsx
- [ ] components/admin/ReportFilters.tsx

## Phase 10: App Root
- [ ] app/layout.tsx
- [ ] app/page.tsx (root redirect)

## Phase 11: Verification
- [ ] npm run build passes
- [ ] Dev server runs
