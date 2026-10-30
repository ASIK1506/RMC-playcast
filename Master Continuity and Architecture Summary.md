# Master Continuity and Architecture Summary: RMC PlayCast

> **Version:** 2.0 (SaaS Edition)  
> **Last Updated:** October 30, 2026  
> **Repository:** [https://github.com/ASIK1506/RMC-playcast.git](https://github.com/ASIK1506/RMC-playcast.git) (`main` branch)  
> **Local Workspace:** `C:\Users\GOD\Desktop\Bible OBS Pulling App`  
> **Live API Subdomain:** `https://api.sriinfyllc.com`  

---

## 1. Executive Summary & Purpose
**RMC PlayCast** is a modern church presentation platform, auditorium multi-screen projector system, and OBS Studio transparent lower-third pulling application built for multi-campus worship teams. It runs as a centrally managed SaaS application with individual operator credentials, role-based access control, a Super Administrator panel, configurable account licensing capacity, and shared cloud data.

---

## 2. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RMC PLAYCAST SAAS CLIENTS                       │
├───────────────────────┬───────────────────────┬────────────────────────┤
│   PlayCast Studio     │   OBS Studio Overlay  │  Auditorium / Stage    │
│    (Show/Edit/Stage)  │   (Transparent 1080p) │  (Projector / Remote)  │
│          /            │        /display       │   /projector & /stage  │
└───────────┬───────────┴───────────┬───────────┴────────────┬───────────┘
            │                       │                        │
            ▼                       ▼                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Vercel / Vite React 18 Frontend                      │
│       (RouteGuards, AuthContext, Bearer Tokens, Admin Dashboard)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS + Bearer JWT/Token
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     MilesWeb cPanel PHP 8.2 API                        │
│                   https://api.sriinfyllc.com/api                       │
│    (Session Engine, Role Validation, Capacity Enforcement, CORS)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ PDO Connection
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       MilesWeb MySQL 8.0 Cloud DB                      │
│                  Database: Velloreh1_Playcast                          │
│   (31,102 Verses, Shared Songs, Users, Sessions, Audit Trail)          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Production Environment & Live Endpoints

- **Live API Base URL:** `https://api.sriinfyllc.com`
- **Diagnostic Dashboard:** `https://api.sriinfyllc.com/test_db.php`  
  *(Live verified: PHP 8.2.35, PDO MySQL, all 11 tables green).*
- **Health Check Endpoint:** `https://api.sriinfyllc.com/api/health`
- **Worship Songs Library:** `https://api.sriinfyllc.com/api/songs`
- **Broadcast Live State Sync:** `https://api.sriinfyllc.com/api/live`
- **Database Engine:** MySQL 8.0 (`Velloreh1_Playcast` on `localhost:3306`) with transparent fallback to local SQLite if offline.

---

## 4. SaaS Authentication & Security Core

### Security Principles
1. **Server-Side Authorization Enforced:**  
   Authentication is verified on the PHP backend via `requireAuth($db)` and `requireSuperAdmin($db)`. React handles the UI, form interactions, and route protection via `RouteGuards.tsx`. Direct unauthorized API requests are rejected with HTTP 401/403.
2. **Session Engine:**  
   Session tokens are cryptographically generated (64 hex characters) and stored in `user_sessions` as SHA-256 hashes.
3. **Remote Revocation:**  
   Super Admin can remotely terminate all active sessions for any user or deactivate accounts in real time.
4. **Configurable Capacity Policy:**  
   Account capacity is **NOT hardcoded**. In the `/admin/settings` panel, capacity can be set to a fixed number (e.g. 5, 10, 25, 50) or set to **Unlimited Accounts Policy** (`0`).

### Master Super Administrator Credentials (Live & Seeded)
- **Username:** `admin`
- **Password:** `Admin@PlayCast2026!`
- **Role:** `SUPER_ADMIN`
- **Status:** `ACTIVE`
- *(Password can be modified inside `/admin/settings` or reset via `cli_bootstrap_admin.php`).*

---

## 5. MySQL Database Tables (11 Active Tables)

| Table | Purpose | Status / Verified Content |
|---|---|---|
| **`users`** | SaaS user accounts with bcrypt passwords, status flags, and expiry dates | Active (1 Super Admin initialized) |
| **`user_sessions`** | Active session tokens hashed with SHA-256, IP address, and expiry | Active & tested |
| **`audit_logs`** | Security audit trail (logins, logouts, password resets, user CRUD) | Active (Live events logged) |
| **`songs`** | Central worship songs repository with bilingual Tamil & English metadata | Active (Holds cloud worship songs) |
| **`bible_verses`** | Full Tamil Bible database indexed by book, chapter, and verse | Active (31,102 verses seeded) |
| **`services`** | Service schedules, gathering topics, and playlist section JSON | Active |
| **`live_state`** | Current broadcast slide, blanking state, and lower-third overlays | Active |
| **`backgrounds`** | Gradient presets and transparent chroma key for OBS camera feeds | Active (6 default backgrounds) |
| **`templates`** | Presentation layouts (Fullscreen, Lower-Third, Frosted Box, Trendy, Minimal) | Active (5 templates) |
| **`settings`** | System configuration, license tier, and account limits | Active (`system_license` configured) |
| **`media`** | Uploaded backgrounds, logos, and audio/video media assets | Active |

---

## 6. Frontend Routes & Output Views

- **`/login`** — Dark fuchsia/slate login page with ambient glow effects and session rehydration.
- **`/`** — Protected main PlayCast Studio:
  - **Show Mode:** Dual preview/program monitors, quick blanking, lower-third speaker overlay, live broadcast toggles.
  - **Edit Mode:** Slide matrix editor, slide splitting, lyric adjustments, typography styling.
  - **Stage Mode:** Stage workspace & confidence monitor configuration.
  - **TopBar:** Service playlist renamer, mode switcher, live status badge, Output feeds dropdown, and User Account menu with avatar, Admin Panel shortcut, and instant Logout.
- **`/admin`** — Super Admin Dashboard with real-time license usage progress bars, account stat counters, and live audit event log.
- **`/admin/users`** — User management table with create user modal, temporary password generation, profile edit, password reset, and session kill switch.
- **`/admin/settings`** — License capacity configuration (fixed cap or unlimited policy), license tier editor, Super Admin password change, and cloud database diagnostics.
- **`/display`** — OBS Studio 1080p Transparent Browser Source for live streaming with alpha channel.
- **`/projector`** — Fullscreen auditorium projector view for congregation worship lyrics and scriptures.
- **`/stage`** — Stage confidence monitor displaying current slide, next slide, and countdown clock for pastors/singers.
- **`/remote`** — Mobile / iPad web remote controller for sound booth or stage operators.

---

## 7. Key File Structure & Locations

### Frontend (`app/frontend/`)
- `src/App.tsx` — Routing configuration wrapped with `AuthProvider` and `RouteGuards`.
- `src/context/AuthContext.tsx` — React authentication state provider and session manager.
- `src/components/auth/RouteGuards.tsx` — `ProtectedRoute` and `AdminRoute` guards.
- `src/pages/Login.tsx` — Login interface.
- `src/pages/admin/` — Admin Panel pages (`AdminLayout.tsx`, `AdminDashboard.tsx`, `AdminUsers.tsx`, `AdminSettings.tsx`).
- `src/lib/api.ts` — API client with Bearer token header injection and all CRUD methods.
- `src/components/studio/TopBar.tsx` — Studio header with user menu & navigation.
- `.env` — `VITE_API_BASE_URL=https://api.sriinfyllc.com/api`

### Backend (`app/backend/` & `deploy/api.sriinfyllc.com/`)
- `config.php` — Database connection loader and automatic schema self-migration.
- `auth.php` — Authentication middleware, session token hashing, role verification, and capacity checks.
- `index.php` — REST API router and route controller.
- `cli_bootstrap_admin.php` — CLI utility for administrative provisioning.
- `schema.sql` — Complete MySQL DDL schema.
- `test_db.php` — Diagnostic verification script.
- `playcast-backend-milesweb.zip` — Ready-to-deploy zip bundle for MilesWeb cPanel.

### Root Configuration
- `vercel.json` — Configured for SPA single-page routing (`destination: "/index.html"`).
- `.gitignore` — Properly ignores `.env`, `playcast-backend-milesweb.zip`, `.db`, and temporary files.

---

## 8. Quick Start for New Sessions
When resuming work in a new session:
1. All changes are committed and pushed to `https://github.com/ASIK1506/RMC-playcast.git` on branch `main`.
2. To run the frontend locally:
   ```bash
   cd "app/frontend"
   npm run dev
   ```
3. To rebuild the frontend bundle:
   ```bash
   cd "app/frontend"
   npm run build
   ```
4. The frontend is pre-configured to communicate directly with the live cloud backend at `https://api.sriinfyllc.com/api`.
