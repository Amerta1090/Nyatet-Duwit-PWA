# Sprint Planning — NyatetDuwit V3

> 12 Sprint (Week 26–51) | Target: Sync & Premium
> Based on: Perancangan_Nyatet_Duwit.md — Section G (V3 Roadmap) + Feature Hierarchy Table (TIER 4)
> Stack: React + Vite + Dexie.js + Zustand + Tailwind + vite-plugin-pwa + Cloud Backend (TBD)

---

## TABLE OF CONTENTS

1. [Sprint Overview](#1-sprint-overview)
2. [Definition of Done](#2-definition-of-done)
3. [Sprint 1–2: Backend Setup — Auth & API](#3-sprint-1-2-backend-setup--auth--api)
4. [Sprint 3–4: Cloud Sync Engine](#4-sprint-3-4-cloud-sync-engine)
5. [Sprint 5–6: Multi-Device & Conflict Resolution](#5-sprint-5-6-multi-device--conflict-resolution)
6. [Sprint 7: Web Dashboard](#6-sprint-7-web-dashboard)
7. [Sprint 8: Anomaly Detection & Advanced Insights](#7-sprint-8-anomaly-detection--advanced-insights)
8. [Sprint 9: Predictive Insight](#8-sprint-9-predictive-insight)
9. [Sprint 10: Bill Reminder & Subscription Manager](#9-sprint-10-bill-reminder--subscription-manager)
10. [Sprint 11: Play Store & Auto-Update](#10-sprint-11-play-store--auto-update)
11. [Sprint 12: Premium Tier, Polish & Launch](#11-sprint-12-premium-tier-polish--launch)
12. [Risk Register](#12-risk-register)
13. [Dependency Map](#13-dependency-map)
14. [Performance Budget Tracker](#14-performance-budget-tracker)

---

## 1. SPRINT OVERVIEW

| Sprint | Week | Theme | Deliverable | Story Points |
|---|---|---|---|---|
| **Sprint 1** | 26–27 | Backend Setup | Server infra, auth system, REST API design | 34 |
| **Sprint 2** | 28–29 | Backend — Data API | CRUD API endpoints, data validation, rate limiting | 30 |
| **Sprint 3** | 30–31 | Cloud Sync Engine | Sync core: outbox/inbox pattern, push/pull | 40 |
| **Sprint 4** | 32–33 | Sync Integration | Full sync integration, conflict resolution, encryption | 34 |
| **Sprint 5** | 34–35 | Multi-Device Support | Sync for multiple devices, device management | 30 |
| **Sprint 6** | 36–37 | Conflict Resolution | Vector clock merge, field-level merge, UI for conflicts | 28 |
| **Sprint 7** | 38–39 | Web Dashboard | Desktop dashboard, web-only features | 34 |
| **Sprint 8** | 40–41 | Anomaly Detection | Spending anomaly alerts, baseline calculation | 30 |
| **Sprint 9** | 42–43 | Predictive Insight | Month-end projection, spending forecast | 26 |
| **Sprint 10** | 44–45 | Bill Reminder | Bill manager, recurring bill tracker, smart reminder | 28 |
| **Sprint 11** | 46–47 | Play Store & Auto-Update | Play Store submission, auto-update APK, app signing | 34 |
| **Sprint 12** | 48–51 | Premium Tier, Polish & Launch | Premium features, V3 QA, launch | 40 |
| **TOTAL** | | | **V3 Release** | **388** |

### Velocity Assumption

- 1 developer = ~30–35 story points per sprint
- Story point scale: 1 (trivial), 2 (simple), 3 (medium), 5 (complex), 8 (very complex), 13 (epic)
- Sprint 1–6 (backend + sync) estimated higher due to backend complexity

---

## 2. DEFINITION OF DONE

Mengacu ke DoD yang sama dengan `sprint_planning.md` Section 2. Tambahan khusus V3:

### DoD — V3 Additions

- [ ] Cloud sync tested: create offline → go online → sync → data matches on another device
- [ ] Conflict resolution tested: edit same transaction on 2 devices → merge handled gracefully
- [ ] Backend API tested: authentication, rate limiting, data validation, error handling
- [ ] Web dashboard tested on Chrome, Firefox, Safari (desktop)
- [ ] Anomaly detection: no false positives in test dataset (accuracy ≥ 90%)
- [ ] Predictive insight: projection within ±15% of actual for test dataset
- [ ] Play Store listing active with screenshots, description, privacy policy
- [ ] Auto-update APK tested end-to-end (app detects → downloads → installs)
- [ ] Premium tier: payment flow works, premium features locked/unlocked correctly
- [ ] No user data leaves device without explicit opt-in (sync is opt-in)

---

## 3. SPRINT 1-2: BACKEND SETUP — AUTH & API

**Weeks:** 26–29
**Theme:** "Server infrastructure dan API untuk cloud sync"
**Story Points:** 64

### Sprint Goal

Backend siap dengan auth system, REST API, dan database. Frontend bisa register, login, dan test API connectivity.

---

### US-V3-1: Backend Infrastructure

**Priority:** P0 (BLOCKER — semua fitur cloud sync tergantung ini)
**Story Points:** 13
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Setup server infrastructure. Pilih tech stack, setup database, CI/CD, monitoring.

**Tech Stack Decision (dari Perancangan Section E — Sync Strategy):**

| Component | Option A | Option B | Decision |
|---|---|---|---|
| Backend Framework | Hono (lightweight, Edge) | Fastify / Express | **Hono** — ringan, TypeScript native, Edge-ready |
| Database | SQLite (Turso) | PostgreSQL | **PostgreSQL** — mature, battle-tested, good for sync |
| ORM | Drizzle ORM | Prisma | **Drizzle** — smaller bundle, SQL-like, better perf |
| Auth | Supabase Auth | Custom JWT | **Supabase Auth** — production-ready, cheap at small scale |
| Hosting | Cloudflare Workers | Railway / Fly.io | **Cloudflare Workers** — Edge, free tier generous |
| File Storage | Cloudflare R2 | AWS S3 | **Cloudflare R2** — no egress fees, cheap |
| Monitoring | Sentry | Datadog | **Sentry** — already used in V1 |

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-1.1 | Setup Hono project with TypeScript | 2 | Setup |
| V3-1.2 | Setup PostgreSQL database (schema for users, sync) | 2 | Setup |
| V3-1.3 | Setup Drizzle ORM with migrations | 2 | Setup |
| V3-1.4 | Setup Supabase Auth (or implement JWT auth) | 3 | Setup |
| V3-1.5 | Setup CI/CD (GitHub Actions → Cloudflare Workers) | 2 | CI/CD |
| V3-1.6 | Setup Sentry error tracking on backend | 1 | Setup |
| V3-1.7 | Setup staging + production environments | 1 | Setup |
| V3-1.8 | Setup custom domain + HTTPS | 1 | Setup |
| V3-1.9 | Write API documentation (OpenAPI/Swagger) | 3 | Documentation |

**Acceptance Criteria:**
- [ ] Hono server running on Cloudflare Workers
- [ ] PostgreSQL database accessible with migrations
- [ ] Drizzle schema matches app data model
- [ ] Supabase Auth working (register, login, session)
- [ ] CI/CD: push to main → auto-deploy to staging
- [ ] Sentry catching backend errors
- [ ] API docs accessible at /docs

**Dependencies:** None (new backend project)
**Risks:** Cloudflare Workers limitations (cold starts, 10ms CPU per request). Mitigation: optimize cold start, use D1 for simple queries.

---

### US-V3-2: Authentication System

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Auth system untuk user. Register, login, logout, session management, password reset.

**Berdasarkan Perancangan:** Section E (Sync Strategy) — cloud sync membutuhkan user account

**UX Flow (in-app):**
```
Settings → Cloud Sync
  → [Aktifkan Sinkronisasi]
  → Login / Register screen (in-app, not browser)
  → Email + password
  → OR Google Sign-In
  → Terms accepted
  → Sync enabled → initial upload
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-2.1 | Create RegisterPage (email, password, terms) | 2 | Code |
| V3-2.2 | Create LoginPage (email, password, forgot password) | 2 | Code |
| V3-2.3 | Implement session management (JWT refresh) | 2 | Code |
| V3-2.4 | Implement Google Sign-In (optional) | 3 | Code |
| V3-2.5 | Implement "Forgot Password" flow | 1 | Code |
| V3-2.6 | Implement logout + data clear option | 1 | Code |
| V3-2.7 | Store auth token securely (sessionStorage or encrypted) | 1 | Code |
| V3-2.8 | Write tests for auth flow | 2 | Testing |

**Acceptance Criteria:**
- [ ] Register with email + password works
- [ ] Login with email + password works
- [ ] Google Sign-In works (optional)
- [ ] Session persists across app restarts
- [ ] Token refresh works (no re-login needed)
- [ ] Forgot password sends reset email
- [ ] Logout clears session
- [ ] "Hapus data cloud" option on logout
- [ ] Auth UI matches app design (not browser popup)
- [ ] Accessibility: screen reader, keyboard nav

**Dependencies:** US-V3-1
**Risks:** Google Sign-In in TWA can be tricky. Mitigation: support email/password as primary, Google as enhancement.

---

### US-V3-3: REST API — Data Endpoints

**Priority:** P0
**Story Points:** 13
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
REST API endpoints untuk CRUD semua entities. Digunakan oleh sync engine.

**API Endpoints:**

```
POST   /api/v1/sync/push     — Push local changes
POST   /api/v1/sync/pull     — Pull remote changes
POST   /api/v1/sync/status   — Get sync status (last sync, pending)

GET    /api/v1/transactions  — List transactions (with filters)
POST   /api/v1/transactions  — Create transaction
PUT    /api/v1/transactions/:id — Update transaction
DELETE /api/v1/transactions/:id — Delete transaction

GET    /api/v1/accounts      — List accounts
POST   /api/v1/accounts      — Create account
PUT    /api/v1/accounts/:id  — Update account
DELETE /api/v1/accounts/:id  — Delete account

GET    /api/v1/categories    — List categories
POST   /api/v1/categories    — Create category
PUT    /api/v1/categories/:id — Update category
DELETE /api/v1/categories/:id — Delete category

... (recurring, goals, debts, tags, settings)
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-3.1 | Implement transactions API endpoints | 3 | Code |
| V3-3.2 | Implement accounts API endpoints | 1 | Code |
| V3-3.3 | Implement categories API endpoints | 1 | Code |
| V3-3.4 | Implement recurring, goals, debts, tags API endpoints | 3 | Code |
| V3-3.5 | Implement sync-specific endpoints (push, pull, status) | 3 | Code |
| V3-3.6 | Implement request validation (Zod schema) | 2 | Code |
| V3-3.7 | Implement rate limiting | 1 | Code |
| V3-3.8 | Implement API key/auth middleware | 1 | Code |
| V3-3.9 | Write integration tests for all endpoints | 3 | Testing |

**Acceptance Criteria:**
- [ ] All CRUD endpoints return correct data
- [ ] Auth middleware protects all endpoints
- [ ] Validation rejects invalid data with clear error messages
- [ ] Rate limiting: 100 req/min per user
- [ ] Sync endpoints accept batch operations (up to 100 items)
- [ ] All endpoints paginated (default 50 per page)
- [ ] Integration tests pass for all endpoints
- [ ] OpenAPI docs updated

**Dependencies:** US-V3-1, US-V3-2
**Risks:** API design changes during development. Mitigation: use OpenAPI spec as source of truth.

---

### US-V3-4: Database Schema — Server Side

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Server-side database schema yang mirror client schema, plus sync-specific tables.

**Server Tables:**
```sql
-- Users (managed by Supabase Auth, plus profile data)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync tracking
CREATE TABLE sync_clock (
  user_id UUID REFERENCES users(id),
  entity_type TEXT NOT NULL, -- 'transaction', 'account', etc.
  vector_clock BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, entity_type)
);

-- Outbox (server receives changes here)
CREATE TABLE sync_outbox (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  operation TEXT NOT NULL, -- 'create', 'update', 'delete'
  data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE
);

-- Device registry
CREATE TABLE devices (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entity tables mirror client schema
CREATE TABLE transactions ( ... ); -- same as client
CREATE TABLE accounts ( ... );      -- same as client
CREATE TABLE categories ( ... );    -- same as client
-- etc.
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-4.1 | Create Drizzle schema for all entity tables | 2 | Code |
| V3-4.2 | Create sync_tracker table | 1 | Code |
| V3-4.3 | Create sync_outbox table | 1 | Code |
| V3-4.4 | Create devices table | 1 | Code |
| V3-4.5 | Create migration scripts | 1 | Code |
| V3-4.6 | Write DB tests (schema validation, constraints) | 2 | Testing |

**Acceptance Criteria:**
- [ ] All entity tables match client schema
- [ ] Sync tracker tracks vector clock per entity type
- [ ] Outbox table records all incoming changes
- [ ] Devices table tracks connected devices
- [ ] Migrations run cleanly up and down
- [ ] Foreign keys and constraints enforced

**Dependencies:** US-V3-1
**Risks:** Schema drift between client and server. Mitigation: shared schema types package.

---

### Sprint 1-2 Deliverables Checklist

- [ ] Backend infrastructure running (US-V3-1)
- [ ] Authentication system (US-V3-2)
- [ ] REST API endpoints (US-V3-3)
- [ ] Server-side database schema (US-V3-4)
- [ ] API docs live
- [ ] CI/CD pipeline active
- [ ] Integration tests pass
- [ ] User can register, login, test API

---

## 4. SPRINT 3-4: CLOUD SYNC ENGINE

**Weeks:** 30–33
**Theme:** "Sync core: local → cloud → local"
**Story Points:** 74

### Sprint Goal

Sync engine bekerja end-to-end. Local changes push ke cloud, remote changes pull ke local. Atomic, idempotent, resilient.

---

### US-V3-5: Sync Engine — Core Architecture

**Priority:** P0 (CRITICAL)
**Story Points:** 21
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Sync engine di sisi client. Menggunakan outbox pattern dengan event sourcing.

**Berdasarkan Perancangan:** Section E (Sync Strategy) — *"Local-First with Event Sourcing"*

**Architecture:**
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Local DB   │────▶│  Outbox      │────▶│   Server     │
│  (IndexedDB) │     │  (Queue)     │     │   Backend    │
└──────────────┘     └──────────────┘     └──────────────┘
       ▲                    │                     │
       │                    ▼                     ▼
       │             ┌──────────────┐     ┌──────────────┐
       └─────────────│  Inbox       │◀────│  Sync        │
                      │  (Pull)      │     │  Engine      │
                      └──────────────┘     └──────────────┘
```

**Sync Flow:**
```
1. User makes change locally → save to IndexedDB
2. Change added to "sync_outbox" table (local)
3. Background sync triggers (when online + idle)
4. Outbox items sent to server (POST /sync/push)
5. Server responds with latest changes (POST /sync/pull)
6. Local DB merges server state (inbox)
7. Outbox items marked as synced
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-5.1 | Create local sync_outbox table in IndexedDB | 2 | Code |
| V3-5.2 | Create sync engine class (SyncEngine) | 3 | Code |
| V3-5.3 | Implement push logic (batch outbox items → API) | 3 | Code |
| V3-5.4 | Implement pull logic (API → merge to local) | 3 | Code |
| V3-5.5 | Implement background sync trigger (online + idle) | 2 | Code |
| V3-5.6 | Implement sync status tracking (last sync, pending count) | 2 | Code |
| V3-5.7 | Implement retry logic (exponential backoff, max 5 retries) | 2 | Code |
| V3-5.8 | Implement sync indicator UI (status icon, pending badge) | 2 | Code |
| V3-5.9 | Write unit tests for sync engine | 4 | Testing |
| V3-5.10 | Write integration tests (sync round-trip) | 4 | Testing |

**Acceptance Criteria:**
- [ ] Local outbox captures all creates, updates, deletes
- [ ] Push sends batch of pending changes to server
- [ ] Pull fetches changes since last sync
- [ ] Background sync triggers within 30 seconds of going online
- [ ] Retry: exponential backoff, max 5 attempts, then alert user
- [ ] Sync indicator shows: synced / syncing / pending (X) / error
- [ ] No data loss on sync failure
- [ ] Sync is idempotent (re-running doesn't create duplicates)
- [ ] Sync works with 100+ pending changes
- [ ] Integration test: add offline → go online → verify on server

**Dependencies:** US-V3-3, US-V3-4
**Risks:** 
- Sync conflicts are inevitable. Mitigation: robust conflict resolution (next sprint).
- Background sync on mobile browser is limited. Mitigation: use service worker sync, or trigger on app focus.

---

### US-V3-6: Sync Encryption

**Priority:** P1
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Data dienkripsi sebelum dikirim ke server. End-to-end encryption option.

**Berdasarkan Perancangan:** Section E — privacy-first: "data user tetap di device mereka" (sync is encrypted)

**Approach:**
- Client-side encryption before push
- Server stores encrypted data (server never sees plaintext)
- Decrypt on pull
- Key derived from user password (zero-knowledge)

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-6.1 | Implement client-side encryption for sync payload | 3 | Code |
| V3-6.2 | Implement key derivation from password (PBKDF2) | 2 | Code |
| V3-6.3 | Implement server-side encrypted storage (opaque to server) | 1 | Code |
| V3-6.4 | Implement key recovery (if password forgotten) | 2 | Code |
| V3-6.5 | Write tests for E2E encryption | 2 | Testing |

**Acceptance Criteria:**
- [ ] Data encrypted before leaving device
- [ ] Server stores encrypted blobs (cannot read plaintext)
- [ ] Decrypt on pull with derived key
- [ ] Key derivation: PBKDF2 with 100,000 iterations
- [ ] Key recovery: recovery codes generated on setup
- [ ] Performance: encrypt/decrypt < 100ms for 50 items
- [ ] Toggle: user can disable E2E (server-side encryption only)

**Dependencies:** US-V3-5
**Risks:** Key loss = permanent data loss. Mitigation: recovery codes, clear documentation.

---

### US-V3-7: Sync Status UI

**Priority:** P1
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
UI untuk monitoring status sync. User bisa lihat kapan terakhir sync, berapa pending, force sync.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-7.1 | Create sync status indicator (icon in header) | 1 | Code |
| V3-7.2 | Create SyncStatusPage (details: last sync, pending, devices) | 2 | Code |
| V3-7.3 | Implement "Sync Now" button (force sync) | 1 | Code |
| V3-7.4 | Implement "Last sync" display (relative time) | 1 | Code |
| V3-7.5 | Implement sync error notifications | 1 | Code |
| V3-7.6 | Add sync settings (auto-sync toggle, sync only on WiFi) | 2 | Code |
| V3-7.7 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] Sync status icon visible in header (when sync enabled)
- [ ] Icon states: synced (green), pending (yellow), error (red)
- [ ] Sync status page shows: last sync, pending items, connected devices
- [ ] "Sync Now" button forces immediate sync
- [ ] Sync error shows toast with retry option
- [ ] Settings: auto-sync toggle, WiFi-only toggle
- [ ] Works offline (shows "offline" status)

**Dependencies:** US-V3-5
**Risks:** None significant.

---

### Sprint 3-4 Deliverables Checklist

- [ ] Sync engine core (US-V3-5)
- [ ] Sync encryption (US-V3-6)
- [ ] Sync status UI (US-V3-7)
- [ ] All tests pass
- [ ] Sync round-trip works: offline add → online → verify on server
- [ ] Encrypted data stored on server
- [ ] Sync status visible and accurate

---

## 5. SPRINT 5-6: MULTI-DEVICE & CONFLICT RESOLUTION

**Weeks:** 34–37
**Theme:** "Sync di banyak device, conflict handling yang mulus"
**Story Points:** 58

### Sprint Goal

User bisa sync di multiple device. Conflict resolution handle edit di 2 device sekaligus.

---

### US-V3-8: Multi-Device Support

**Priority:** P0
**Story Points:** 13
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
User bisa connect multiple device ke akun yang sama. Data sync di semua device.

**Berdasarkan Perancangan:** Section G V3 — "Multi-device support"

**Device Management:**
```
Settings → Cloud Sync → Perangkat
  ├── Samsung Galaxy A52 (device ini)
  │   Terakhir sync: 2 menit lalu
  │
  ├── Xiaomi Redmi Note 12
  │   Terakhir sync: 1 jam lalu
  │
  └── [Putuskan] [Ganti Nama]
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-8.1 | Implement device registration on first sync | 2 | Code |
| V3-8.2 | Create DeviceList page | 1 | Code |
| V3-8.3 | Implement device rename | 1 | Code |
| V3-8.4 | Implement device disconnect (remove from sync) | 2 | Code |
| V3-8.5 | Implement device name auto-detection (model name) | 1 | Code |
| V3-8.6 | Track last sync per device | 1 | Code |
| V3-8.7 | Notify on new device connected (security) | 2 | Code |
| V3-8.8 | Write tests | 2 | Testing |

**Acceptance Criteria:**
- [ ] First sync registers device
- [ ] Device list shows all connected devices
- [ ] Device shows: name, last sync time, current device indicator
- [ ] Rename device works
- [ ] Disconnect removes device (data stays on server)
- [ ] New device notification: "Perangkat baru terhubung: Xiaomi Redmi"
- [ ] Max 5 devices per account (prevent abuse)

**Dependencies:** US-V3-5
**Risks:** Device identification across platforms. Mitigation: generate unique device ID on first install.

---

### US-V3-9: Conflict Resolution Engine

**Priority:** P0 (CRITICAL)
**Story Points:** 21
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Conflict resolution saat 2 device edit data yang sama. Strategi: Last-Write-Wins with Vector Clocks.

**Berdasarkan Perancangan:** Section E (Conflict Resolution) — *"Last-Write-Wins with Vector Clocks"*

**Conflict Scenarios:**
```
Scenario 1: Same field, different values
  Device A edits amount to 25000 at T1
  Device B edits amount to 30000 at T2 (offline)
  → Last write wins (T2 > T1 → 30000)

Scenario 2: Different fields
  Device A edits notes at T1
  Device B edits category at T2
  → Field-level merge (notes from A, category from B)

Scenario 3: Delete vs Update
  Device A deletes transaction at T1
  Device B edits same transaction at T2
  → Delete wins (but keep in trash for 30 days)

Scenario 4: Create with same ID (offline)
  Device A and B create transaction with same ID
  → Device ID tiebreaker (higher device ID wins)
  → Other transaction gets new ID, user notified
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-9.1 | Implement vector clock tracking per entity | 3 | Code |
| V3-9.2 | Implement field-level merge logic | 3 | Code |
| V3-9.3 | Implement delete vs update conflict handling | 2 | Code |
| V3-9.4 | Implement create conflict handling (duplicate ID) | 2 | Code |
| V3-9.5 | Implement conflict notification UI | 2 | Code |
| V3-9.6 | Implement conflict history log | 2 | Code |
| V3-9.7 | Implement "soft delete" (trash) for conflict safety | 2 | Code |
| V3-9.8 | Write comprehensive conflict tests (all scenarios) | 5 | Testing |

**Acceptance Criteria:**
- [ ] Vector clock increments on each change
- [ ] Field-level merge: different fields merged, not overwritten
- [ ] Last-write-wins: same field → latest timestamp wins
- [ ] Delete beats update (but kept in trash 30 days)
- [ ] Duplicate create IDs: handled with tiebreaker
- [ ] Conflict notification: "X konflik terdeteksi — resolved otomatis"
- [ ] Conflict history log shows what happened
- [ ] Silent resolution (no user prompt) for automatic cases
- [ ] User prompt for ambiguous cases (very rare)
- [ ] All test scenarios pass

**Dependencies:** US-V3-5
**Risks:** Vector clock complexity. Mitigation: use simplified version (per-entity updatedAt + device priority).

---

### US-V3-10: Trash / Recently Deleted

**Priority:** P1
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
"Recently deleted" — soft delete untuk mencegah data loss dari conflict atau accidental delete.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-10.1 | Create trash table in IndexedDB | 1 | Code |
| V3-10.2 | Implement soft delete (move to trash instead of hard delete) | 2 | Code |
| V3-10.3 | Implement auto-purge (delete from trash after 30 days) | 1 | Code |
| V3-10.4 | Create TrashPage (list deleted items, restore option) | 2 | Code |
| V3-10.5 | Implement restore from trash | 1 | Code |
| V3-10.6 | Implement sync-aware trash (deleted on one device → trash on all) | 1 | Code |
| V3-10.7 | Write tests | 2 | Testing |

**Acceptance Criteria:**
- [ ] Delete moves item to trash (not permanently deleted)
- [ ] Trash shows deleted items with delete date
- [ ] Restore brings item back to original state
- [ ] Auto-purge after 30 days
- [ ] Sync: delete on device A → trash on device B (not hard delete)
- [ ] Empty trash option with confirmation

**Dependencies:** US-V3-9
**Risks:** Storage bloat from trashed items. Mitigation: 30-day auto-purge.

---

### Sprint 5-6 Deliverables Checklist

- [ ] Multi-device support (US-V3-8)
- [ ] Conflict resolution engine (US-V3-9)
- [ ] Trash / recently deleted (US-V3-10)
- [ ] All tests pass
- [ ] Sync works across 2 devices correctly
- [ ] Conflicts resolved without data loss
- [ ] Trash prevents accidental permanent delete

---

## 6. SPRINT 7: WEB DASHBOARD

**Weeks:** 38–39
**Theme:** "Desktop dashboard untuk lihat data dari laptop"
**Story Points:** 34

### Sprint Goal

Web dashboard yang bisa diakses dari desktop browser. Read-only untuk V3 (edit via mobile).

---

### US-V3-11: Web Dashboard — Desktop View

**Priority:** P0
**Story Points:** 21
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Desktop web dashboard untuk user yang sync. Bisa lihat data dari laptop. Responsive untuk layar besar.

**Berdasarkan Perancangan:** Section G V3 — "Web dashboard (desktop view)"

**Layout (Desktop):**
```
┌──────────────────────────────────────────────────────┐
│  [Logo]  Dashboard  Transaksi  Insight  Pengaturan   │
├──────────────────┬───────────────────────────────────┤
│                   │                                   │
│  Total Balance    │  Chart: Monthly Income vs Expense │
│  Rp 2.450.000     │  ████████████████░░░░░░░░░░░░    │
│  ▲ 10% bulan ini  │                                   │
│                   │                                   │
│  ┌──────┬──────┐  │  Recent Transactions              │
│  │Income│Expense│  │  ├── Makan Siang    -Rp 25.000   │
│  │ 8.0J │ 5.5J  │  │  ├── Gaji         +Rp 8.000.000 │
│  └──────┴──────┘  │  └── Grab           -Rp 15.000   │
│                   │                                   │
│  Quick Stats      │  Category Breakdown               │
│  ├── Transactions │  ┌─────────────────────────┐      │
│  ├── Streak: 15   │  │ 🍽️ Makan     ████ 40%   │      │
│  └── Budget: 65%  │  │ 🚗 Transport  ██ 20%    │      │
│                   │  └─────────────────────────┘      │
└──────────────────┴───────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-11.1 | Create web app entry point (separate route or subdomain) | 2 | Code |
| V3-11.2 | Create desktop layout (horizontal nav, side panels) | 3 | Code |
| V3-11.3 | Implement desktop Dashboard page | 3 | Code |
| V3-11.4 | Implement desktop Transactions page (table view) | 3 | Code |
| V3-11.5 | Implement desktop Insights page (full charts) | 3 | Code |
| V3-11.6 | Implement desktop Settings page | 1 | Code |
| V3-11.7 | Implement responsive design (tablet, desktop) | 3 | Code |
| V3-11.8 | Implement keyboard shortcuts | 2 | Code |
| V3-11.9 | Write tests | 3 | Testing |

**Acceptance Criteria:**
- [ ] Web dashboard accessible from desktop browser
- [ ] Login with same credentials shows synced data
- [ ] Dashboard shows: balance, charts, recent transactions
- [ ] Transactions page: table view with sort, filter, search
- [ ] Insights page: charts optimized for desktop screen
- [ ] Responsive: works on 768px–1920px width
- [ ] Keyboard shortcuts: n = new transaction, / = search
- [ ] Read-only for V3 (no edit from desktop)
- [ ] Dark mode on desktop
- [ ] Loads in < 2s on desktop

**Dependencies:** US-V3-5 (sync must work), US-V3-2 (auth)
**Risks:** Building separate desktop UI is significant effort. Mitigation: reuse mobile components with responsive wrappers, not separate codebase.

---

### US-V3-12: Desktop Table View

**Priority:** P1
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Table view untuk transaksi di desktop. Bisa sort by any column, bulk select, export.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-12.1 | Create Table component (sortable, resizable columns) | 3 | Code |
| V3-12.2 | Implement column sort (date, amount, category, account) | 1 | Code |
| V3-12.3 | Implement bulk select (checkbox) | 1 | Code |
| V3-12.4 | Implement bulk export selected | 1 | Code |
| V3-12.5 | Implement column visibility toggle | 1 | Code |
| V3-12.6 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] Table renders with columns: date, type, category, account, amount, notes
- [ ] Click column header to sort asc/desc
- [ ] Bulk select with checkbox (select all, range select)
- [ ] Export selected as CSV
- [ ] Column visibility: toggle columns on/off
- [ ] Responsive: table scrolls horizontally on smaller screens

**Dependencies:** US-V3-11
**Risks:** None significant.

---

### Sprint 7 Deliverables Checklist

- [ ] Web dashboard desktop view (US-V3-11)
- [ ] Desktop table view (US-V3-12)
- [ ] All tests pass
- [ ] Web dashboard loads synced data
- [ ] Desktop layout works on all screen sizes

---

## 7. SPRINT 8: ANOMALY DETECTION & ADVANCED INSIGHTS

**Weeks:** 40–41
**Theme:** "Smart alerts untuk spending anomaly"
**Story Points:** 30

### Sprint Goal

Deteksi anomaly spending secara otomatis. Kirim notifikasi kalau spending tidak normal.

---

### US-V3-13: Spending Anomaly Detection

**Priority:** P0
**Story Points:** 13
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Deteksi anomaly spending harian. Bandingkan dengan baseline (rata-rata 30 hari). Kirim notifikasi kalau > 2x normal.

**Berdasarkan Perancangan:** R6 (Spending Anomaly Alert) — *"Statistical baseline"* + Section G V3

**Algorithm:**
```typescript
// Daily anomaly check (runs after each transaction)
// 1. Calculate average daily spending (last 30 days, excluding today)
// 2. Calculate standard deviation
// 3. If today's total > (average + 2 * stddev) → anomaly
// 4. Check per-category anomaly too
// 5. Fire notification: "Pengeluaran hari ini 2x lebih tinggi dari biasanya"
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-13.1 | Implement daily spending baseline (30-day rolling avg) | 2 | Code |
| V3-13.2 | Implement standard deviation calculation | 2 | Code |
| V3-13.3 | Implement anomaly detection ( > avg + 2*stddev ) | 2 | Code |
| V3-13.4 | Implement per-category anomaly detection | 2 | Code |
| V3-13.5 | Implement anomaly notification | 2 | Code |
| V3-13.6 | Implement in-app anomaly card (dashboard) | 2 | Code |
| V3-13.7 | Implement throttle (max 1 notification per day) | 1 | Code |
| V3-13.8 | Write tests for anomaly detection | 3 | Testing |
| V3-13.9 | Test with real data patterns (no false positives) | 1 | Verification |

**Acceptance Criteria:**
- [ ] Baseline calculated from 30-day rolling average
- [ ] Anomaly detected when daily spending > avg + 2*stddev
- [ ] Per-category anomaly detected (e.g., "Makan hari ini 3x lipat!")
- [ ] Notification: "Pengeluaran hari ini Rp 500.000 — 2x lebih tinggi dari biasanya"
- [ ] In-app card on dashboard shows anomaly
- [ ] Throttled: max 1 notification per day
- [ ] No notification in first 7 days (insufficient data)
- [ ] Accuracy: < 5% false positive rate on test dataset
- [ ] Anomaly threshold configurable (2x, 3x, or custom)

**Dependencies:** US-2.2, US-7.3
**Risks:** False positives can annoy users. Mitigation: conservative threshold (2*stddev), configurable sensitivity.

---

### US-V3-14: Insight Dashboard (Advanced)

**Priority:** P1
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Halaman insight yang lebih advanced dengan multiple charts dan filter interaktif.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-14.1 | Create unified InsightsDashboard page | 2 | Code |
| V3-14.2 | Add interactive date range selector (7d, 30d, 90d, custom) | 1 | Code |
| V3-14.3 | Add comparison mode (this period vs previous) | 2 | Code |
| V3-14.4 | Add export insight as image | 1 | Code |
| V3-14.5 | Add insight summary text (auto-generated narrative) | 2 | Code |
| V3-14.6 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] All charts in one unified page
- [ ] Date range selector changes all charts
- [ ] Comparison mode: overlay previous period
- [ ] Export insight as PNG/image
- [ ] Auto-generated narrative: "Bulan ini kamu hemat 15% dibanding bulan lalu"
- [ ] Works on mobile and desktop

**Dependencies:** US-V2-10, US-V2-11
**Risks:** Page load time with many charts. Mitigation: lazy load charts, virtual viewport.

---

### Sprint 8 Deliverables Checklist

- [ ] Spending anomaly detection (US-V3-13)
- [ ] Advanced insight dashboard (US-V3-14)
- [ ] All tests pass
- [ ] Anomaly detection < 5% false positive
- [ ] Export insight as image works

---

## 8. SPRINT 9: PREDICTIVE INSIGHT

**Weeks:** 42–43
**Theme:** "Prediksi saldo akhir bulan"
**Story Points:** 26

### Sprint Goal

Prediksi saldo akhir bulan berdasarkan spending pattern. Projection yang akurat.

---

### US-V3-15: Month-End Balance Prediction

**Priority:** P0
**Story Points:** 13
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Prediksi saldo akhir bulan berdasarkan rata-rata spending harian dan sisa hari.

**Berdasarkan Perancangan:** P9 (Predictive Insight) — *"Simple projection based on avg"*

**Algorithm:**
```typescript
// 1. Get current month's income total
// 2. Get current month's expense total so far
// 3. Calculate average daily expense this month
// 4. Days remaining in month
// 5. Predicted expense = current + (avg daily * days remaining)
// 6. Predicted balance = total income - predicted expense + current balance
```

**UI:**
```
┌────────────────────────────────────┐
│  🔮 Prediksi Akhir Bulan           │
│                                    │
│  Estimasi saldo: Rp 1.800.000      │
│  │░░░░░░░░░░░░░░░░░░░░░░░░│        │
│  ████████████░░░░  Risiko: Sedang  │
│                                    │
│  Kalau kamu hemat Rp 10.000/hari   │
│  → Saldo: Rp 2.100.000 ▲           │
│                                    │
│  Sisa hari: 12 hari                │
│  Anggaran harian: Rp 50.000/hari   │
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-15.1 | Implement month-end balance prediction algorithm | 3 | Code |
| V3-15.2 | Implement "what-if" scenario (if you save X/day) | 2 | Code |
| V3-15.3 | Implement daily budget recommendation | 2 | Code |
| V3-15.4 | Implement risk level indicator (safe/moderate/risky) | 2 | Code |
| V3-15.5 | Create prediction card widget (dashboard + insights) | 2 | Code |
| V3-15.6 | Update prediction daily (or on each transaction) | 1 | Code |
| V3-15.7 | Write tests for prediction accuracy | 3 | Testing |
| V3-15.8 | Backtest prediction with historical data | 2 | Verification |

**Acceptance Criteria:**
- [ ] Prediction accuracy within ±15% of actual (backtested)
- [ ] "What-if" scenario: "Jika hemat Rp 10.000/hari → saldo Rp X"
- [ ] Daily budget recommendation: "Sisa Rp 50.000/hari untuk 12 hari"
- [ ] Risk level: green (> 30% buffer), yellow (10-30%), red (< 10%)
- [ ] Prediction updates on each transaction
- [ ] Card on dashboard + insights page
- [ ] Only shown if at least 7 days of data this month
- [ ] Disclaimers: "Estimasi — hasil aktual mungkin berbeda"

**Dependencies:** US-2.2
**Risks:** Prediction is inherently inaccurate. Mitigation: clear disclaimers, conservative estimates, focus on "what-if" scenarios.

---

### US-V3-16: Spending Forecast (30/60/90 Day)

**Priority:** P1
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Forecast spending untuk 30, 60, 90 hari ke depan berdasarkan historical pattern.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-16.1 | Implement spending forecast algorithm (based on 90-day avg) | 3 | Code |
| V3-16.2 | Create forecast chart (projected line on trend chart) | 2 | Code |
| V3-16.3 | Add forecast to insights page | 1 | Code |
| V3-16.4 | Write tests | 2 | Testing |

**Acceptance Criteria:**
- [ ] Forecast shows projected spending for next 30/60/90 days
- [ ] Shown as dashed line on trend chart
- [ ] Range indicator (optimistic, expected, pessimistic)
- [ ] Only shown if 30+ days of data available
- [ ] Disclaimers present

**Dependencies:** US-V3-15, US-V2-10
**Risks:** Same as prediction — accuracy depends on data quality.

---

### Sprint 9 Deliverables Checklist

- [ ] Month-end balance prediction (US-V3-15)
- [ ] Spending forecast (US-V3-16)
- [ ] All tests pass
- [ ] Prediction accuracy within ±15%
- [ ] Forecast chart renders correctly

---

## 9. SPRINT 10: BILL REMINDER & SUBSCRIPTION MANAGER

**Weeks:** 44–45
**Theme:** "Track tagihan rutin dan subscription"
**Story Points:** 28

### Sprint Goal

Bill reminder untuk tagihan rutin (listrik, internet, dll). Subscription manager untuk langganan.

---

### US-V3-17: Bill Reminder

**Priority:** P0
**Story Points:** 13
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Track tagihan bulanan. Reminder H-3 sebelum jatuh tempo. Mark as paid.

**Berdasarkan Perancangan:** Section G V3 — "Bill reminder"

**Database Schema:**
```typescript
interface Bill {
  id: string;
  name: string;           // "Listrik", "Internet", "Kost"
  amount: number;
  dueDate: number;        // day of month (1-31)
  categoryId: string;     // link to category (e.g., "Tagihan")
  accountId: string;      // default payment account
  isPaid: boolean;
  paidDate?: number;
  reminderDays: number;   // remind X days before (default: 3)
  isActive: boolean;
  createdAt: number;
}
```

**UX Flow:**
```
More → Tagihan → [Tambah Tagihan]
  → Nama tagihan (e.g., "Listrik PLN")
  → Jumlah (e.g., Rp 200.000)
  → Tanggal jatuh tempo (tanggal setiap bulan)
  → Kategori (default: Tagihan)
  → Akun pembayaran (default)
  → Reminder: H-3 (configurable)
  → Save

List view:
┌────────────────────────────────────┐
│ ← Tagihan                    [+]  │
│                                    │
│  🔴 Listrik PLN          Rp 200.000│
│     Jatuh tempo: 3 hari lagi       │
│                                    │
│  🟡 Internet BP         Rp 350.000 │
│     Jatuh tempo: 10 hari lagi      │
│                                    │
│  🟢 Kost                 Rp 1.500.000│
│     Lunas (20 Mei)                 │
│                                    │
│  Total tagihan bulan ini: Rp 2.050.000│
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-17.1 | Add Bill interface to database schema | 1 | Code |
| V3-17.2 | Create billRepository (CRUD) | 1 | Code |
| V3-17.3 | Create BillList page (grouped by status) | 2 | Code |
| V3-17.4 | Create BillForm (name, amount, due date, category, account) | 2 | Code |
| V3-17.5 | Implement due date notification (H-3, H-1, due today) | 3 | Code |
| V3-17.6 | Implement "Mark as Paid" flow (auto-create transaction) | 2 | Code |
| V3-17.7 | Implement auto-create recurring transaction from bill | 2 | Code |
| V3-17.8 | Implement edit/delete bill | 1 | Code |
| V3-17.9 | Implement bill dashboard widget | 1 | Code |
| V3-17.10 | Write tests | 3 | Testing |

**Acceptance Criteria:**
- [ ] Bill can be created with name, amount, due date, category, account
- [ ] Bills listed with status: unpaid (red), upcoming (yellow), paid (green)
- [ ] Due date notification fires at H-3 (configurable per bill)
- [ ] "Mark as Paid": creates transaction, updates bill status
- [ ] Auto-create recurring transaction option (for fixed bills)
- [ ] Dashboard shows upcoming bills (next 7 days)
- [ ] Total monthly bill amount shown
- [ ] Edit/delete works
- [ ] Notification: "Tagihan Listrik PLN jatuh tempo 3 hari lagi"

**Dependencies:** US-2.1, US-7.3, US-5.3
**Risks:** Due date on 29-31 can cause issues for months with fewer days. Mitigation: handle edge case (clamp to month end).

---

### US-V3-18: Subscription Manager

**Priority:** P1
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Track semua subscription (Netflix, Spotify, iCloud, dll). Total pengeluaran subscription per bulan.

**Berdasarkan Perancangan:** Section G V3 — "Subscription management (recurring + tracking)"

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-18.1 | Create subscription list page (reuse recurring with filter) | 2 | Code |
| V3-18.2 | Calculate total monthly subscription cost | 1 | Code |
| V3-18.3 | Show subscription category in monthly breakdown | 1 | Code |
| V3-18.4 | Add "subscription" badge/flag to recurring transactions | 1 | Code |
| V3-18.5 | Show subscription spending trend | 1 | Code |
| V3-18.6 | Write tests | 2 | Testing |

**Acceptance Criteria:**
- [ ] Recurring transactions can be flagged as "subscription"
- [ ] Subscription list shows all subscriptions with next billing date
- [ ] Total monthly subscription cost displayed
- [ ] Subscription spending shown in monthly breakdown
- [ ] Subscription spending trend (12-month view)
- [ ] "Unused subscription" detection (no transactions from that vendor in 60 days)

**Dependencies:** US-5.3, US-2.2
**Risks:** Low user adoption (subscription tracking is niche). Mitigation: make it a filter on recurring, not separate feature.

---

### Sprint 10 Deliverables Checklist

- [ ] Bill reminder system (US-V3-17)
- [ ] Subscription manager (US-V3-18)
- [ ] All tests pass
- [ ] Bill notification fires on time
- [ ] "Mark as Paid" creates transaction
- [ ] Subscription cost accurate

---

## 10. SPRINT 11: PLAY STORE & AUTO-UPDATE

**Weeks:** 46–47
**Theme:** "App resmi di Play Store, update otomatis"
**Story Points:** 34

### Sprint Goal

Submit TWA ke Play Store. Auto-update APK working. App signing, listing, review process.

---

### US-V3-19: Play Store Submission

**Priority:** P0 (CRITICAL — discoverability)
**Story Points:** 21
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Submit TWA APK ke Google Play Store. Setup listing, screenshots, testing.

**Berdasarkan Perancangan:** Section G V3 — "Play Store listing" + Section E (TWA → Play Store)

**Steps:**
```
1. Create Google Play Developer account ($25 one-time)
2. Prepare TWA APK for Play Store:
   - Use Android App Bundle (AAB) instead of APK
   - Sign with Play App Signing
   - Target API level 33+
   - Privacy policy URL
3. Create store listing:
   - Title, description (Indonesian + English)
   - Screenshots (phone + tablet)
   - Feature graphic
   - Privacy policy
   - App category: Finance
4. Internal testing → Closed testing → Open testing → Production
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-19.1 | Create Play Developer account | 0.5 | Admin |
| V3-19.2 | Update TWA config for Play Store (AAB format, API level) | 3 | Config |
| V3-19.3 | Create privacy policy page (required by Play Store) | 1 | Documentation |
| V3-19.4 | Create store listing assets (screenshots, icon, feature graphic) | 3 | Design |
| V3-19.5 | Write store description (ID + EN) | 1 | Copywriting |
| V3-19.6 | Submit to internal testing track | 2 | Setup |
| V3-19.7 | Fix any policy violations (if any) | 3 | Code |
| V3-19.8 | Submit to closed testing (20 testers) | 1 | Setup |
| V3-19.9 | Address tester feedback | 3 | Code |
| V3-19.10 | Submit to open testing | 1 | Setup |
| V3-19.11 | Submit to production | 1 | Setup |
| V3-19.12 | Monitor review process | 1 | Verification |

**Acceptance Criteria:**
- [ ] Play Developer account created
- [ ] TWA AAB build ready for Play Store
- [ ] Privacy policy page live
- [ ] Screenshots + feature graphic designed
- [ ] Store description written (ID + EN)
- [ ] App in internal testing track
- [ ] App in closed testing (20+ testers)
- [ ] App in open testing
- [ ] App in production track
- [ ] App discoverable in Play Store search

**Dependencies:** US-7.7 (TWA APK)
**Risks:** 
- Play Store policy violations (common for TWA). Mitigation: follow Google's PWA/TWA guidelines strictly.
- Review can take 1-7 days. Mitigation: submit early, plan buffer time.
- TWA limitations (no in-app purchases via Play). Mitigation: use external payment for premium.

---

### US-V3-20: Auto-Update APK (In-App)

**Priority:** P1
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Auto-update APK langsung dari dalam app (untuk user yang install dari website, bukan Play Store).

**Berdasarkan Perancangan:** Section G V3 — "Auto-update APK via in-app notification"

**Flow:**
```
1. App checks version.json on start (once/day)
2. If newer version available:
   → Show notification: "Update tersedia v1.2.0"
   → [Download & Install] [Nanti]
3. User taps download:
   → Download APK in background (with progress)
   → Show progress: "Mengunduh update... 45%"
   → After download: "Update siap. Install sekarang?"
   → Open APK file → Android installer opens
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-20.1 | Implement background APK download (with progress) | 3 | Code |
| V3-20.2 | Show download progress notification | 2 | Code |
| V3-20.3 | Implement APK file open (trigger Android installer) | 1 | Code |
| V3-20.4 | Implement version check with force update option | 1 | Code |
| V3-20.5 | Update version.json format (include download URL, size, changelog) | 1 | Code |
| V3-20.6 | Write tests | 1 | Testing |
| V3-20.7 | Test on real Android device | 1 | Verification |

**Acceptance Criteria:**
- [ ] App checks for update on start (once/day)
- [ ] Notification shows when update available
- [ ] Download shows progress (in-app + notification)
- [ ] After download, Android installer opens
- [ ] Force update: app blocks until update installed
- [ ] Changelog shown before download
- [ ] Works in both PWA and TWA

**Dependencies:** US-7.8, US-7.1
**Risks:** Downloading APK directly can be flagged by Play Protect. Mitigation: sign APK properly, use Play Store as primary update channel.

---

### Sprint 11 Deliverables Checklist

- [ ] Play Store submission (US-V3-19)
- [ ] Auto-update APK (US-V3-20)
- [ ] App live on Play Store (at least internal testing)
- [ ] Auto-update works on real device
- [ ] Privacy policy live

---

## 11. SPRINT 12: PREMIUM TIER, POLISH & LAUNCH

**Weeks:** 48–51
**Theme:** "V3 rilis dengan premium tier opsional"
**Story Points:** 40

### Sprint Goal

Premium tier implementation (opsional, jika monetisasi diinginkan). Full regression test. V3 launch.

---

### US-V3-21: Premium Tier Implementation

**Priority:** P1 (opsional — tergantung keputusan monetisasi)
**Story Points:** 13
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Premium tier dengan fitur eksklusif. Payment integration (opsional, bisa pake donation model dulu).

**Berdasarkan Perancangan:** Section G V3 — "Premium tier (if monetization desired)"

**Premium Features Proposal:**
```
Free Tier (existing V1-V2):
- All core finance features
- Backup/restore
- Daily reminder
- 1 device sync

Premium Tier (new):
- Multi-device sync (up to 5 devices)
- Advanced insights (anomaly, prediction)
- Export CSV/PDF
- Web dashboard
- Priority support
- Early access to new features

Pricing Options (TBD):
1. Donation-based (user pays what they want)
2. One-time: Rp 50.000 (~$3)
3. Yearly: Rp 25.000/year (~$1.5/year)
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-21.1 | Implement premium feature gating system | 2 | Code |
| V3-21.2 | Implement license key / receipt validation | 3 | Code |
| V3-21.3 | Create PremiumPage (feature comparison, pricing) | 2 | Code |
| V3-21.4 | Implement payment flow (optional — donation or fixed price) | 3 | Code |
| V3-21.5 | Implement "Restore Purchase" flow | 1 | Code |
| V3-21.6 | Add premium badge to UI | 1 | Code |
| V3-21.7 | Free tier limits: max 1 device sync, basic insights only | 2 | Code |
| V3-21.8 | Write tests for gating system | 2 | Testing |

**Acceptance Criteria:**
- [ ] Premium features locked behind gating system
- [ ] Free tier: 1 device sync, basic insights (V1.5 level)
- [ ] Premium tier: multi-device, advanced insights, web dashboard
- [ ] Purchase flow works (donation or fixed price)
- [ ] License key/receipt validation works
- [ ] "Restore Purchase" restores premium on new device
- [ ] Premium badge visible in settings
- [ ] Pricing page clear and transparent
- [ ] No paywall for core features (only advanced sync + insights)

**Dependencies:** All V3 features
**Risks:** Monetization may reduce adoption. Mitigation: generous free tier, donation model as primary, keep core free forever.

---

### US-V3-22: V3 Performance Optimization

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Optimasi performa untuk semua fitur V3. Bundle size, API latency, sync speed.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-22.1 | Optimize bundle size (lazy load web dashboard, premium pages) | 2 | Code |
| V3-22.2 | Optimize API response times (caching, pagination) | 2 | Code |
| V3-22.3 | Optimize sync payload size (compression, delta sync) | 2 | Code |
| V3-22.4 | Optimize IndexedDB queries with new indexes | 1 | Code |
| V3-22.5 | Lighthouse audit (PWA, Performance, Accessibility) | 1 | Verification |

**Acceptance Criteria:**
- [ ] Bundle size < 500KB gzipped (V3 adds backend client, charts, premium)
- [ ] API response < 200ms (p95)
- [ ] Sync < 5 seconds for 50 pending changes
- [ ] Lighthouse Performance ≥ 80 (acceptable for full-featured V3)
- [ ] Lighthouse PWA ≥ 90

**Dependencies:** All V3 features
**Risks:** Bundle size significant with backend client. Mitigation: tree-shake, code split aggressively.

---

### US-V3-23: Full Regression Testing

**Priority:** P0
**Story Points:** 10
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Complete regression test: V1, V1.5, V2, V3. Automated + manual.

**Test Plan:**

| Phase | Scope | Method | Duration |
|---|---|---|---|
| 1 | V1 Core (CRUD, Dashboard, PWA) | Automated | 1 day |
| 2 | V1.5 (Export, Summary, Onboarding) | Automated + Manual | 1 day |
| 3 | V2 (Goals, Debt, Tags, Charts, Import, Lock) | Automated + Manual | 2 days |
| 4 | V3 (Sync, Web, Anomaly, Prediction, Bills, Premium) | Manual | 3 days |
| 5 | Cross-feature integration | Manual | 2 days |
| 6 | Low-end device test | Manual | 1 day |
| 7 | Play Store test (install from store, update) | Manual | 1 day |

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-23.1 | Run full automated test suite | 2 | Testing |
| V3-23.2 | Manual test V3 features | 3 | Testing |
| V3-23.3 | Cross-feature integration tests | 2 | Testing |
| V3-23.4 | Low-end device test (RAM 2GB) | 1 | Testing |
| V3-23.5 | Play Store install + update test | 1 | Testing |
| V3-23.6 | Fix all P0 and P1 bugs | 5 | Code |

**Acceptance Criteria:**
- [ ] All V1 features no regression
- [ ] All V1.5 features no regression
- [ ] All V2 features no regression
- [ ] All V3 features pass acceptance criteria
- [ ] Zero P0 bugs
- [ ] Zero P1 bugs
- [ ] Works on Play Store (install, update)
- [ ] Works on low-end device

**Dependencies:** All V3 features
**Risks:** Regression scope is very large. Mitigation: prioritize automated tests, focus manual tests on critical paths.

---

### US-V3-24: V3 Release & Launch

**Priority:** P0
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
V3 launch. Documentation, changelog, marketing.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V3-24.1 | Update CHANGELOG.md (all V3 entries) | 1 | Documentation |
| V3-24.2 | Update README (V3 features, Play Store badge) | 1 | Documentation |
| V3-24.3 | Update landing page for V3 (Play Store badge + Web Dashboard) | 1 | Code |
| V3-24.4 | Release Play Store production (if approved) | 0.5 | Setup |
| V3-24.5 | Post-launch monitoring (Sentry, analytics) | 1 | Setup |

**Acceptance Criteria:**
- [ ] CHANGELOG updated
- [ ] README updated
- [ ] Landing page updated with Play Store badge
- [ ] Play Store production release live (or open testing)
- [ ] Post-launch monitoring active

**Dependencies:** US-V3-23
**Risks:** None significant.

---

### Sprint 12 Deliverables Checklist

- [ ] Premium tier implementation (US-V3-21)
- [ ] Performance optimization V3 (US-V3-22)
- [ ] Full regression testing (US-V3-23)
- [ ] V3 release & documentation (US-V3-24)
- [ ] All tests pass
- [ ] Zero P0/P1 bugs
- [ ] Bundle size < 500KB gzipped
- [ ] Play Store listing active
- [ ] Premium tier working (or donation model)

---

## 12. RISK REGISTER

| # | Risk | Impact | Probability | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | Cloud sync complexity underestimated | High | High | Start with simple push/pull, iterate | Dev |
| R2 | Conflict resolution bugs cause data loss | Critical | Medium | Comprehensive test scenarios, trash system | Dev |
| R3 | Play Store rejects TWA app | High | Medium | Follow Google TWA guidelines strictly, prepare appeal | Dev |
| R4 | Backend costs exceed budget | Medium | Medium | Start with free tier (Cloudflare Workers + Supabase free) | PM |
| R5 | Web dashboard duplication of effort | Medium | Medium | Reuse mobile components, responsive wrappers | Dev |
| R6 | Users don't want cloud sync (privacy concern) | Medium | High | Sync is opt-in, data encrypted, clear privacy messaging | PM |
| R7 | Premium tier reduces adoption | Medium | Medium | Keep core free, premium is optional, donation model first | PM |
| R8 | Browser background sync limitations | High | Medium | Trigger sync on app focus, not pure background | Dev |
| R9 | Prediction accuracy too low, users lose trust | Medium | Medium | Conservative predictions, clear disclaimers, focus on ranges | Dev |
| R10 | Play Store in-app purchase requirements | Medium | Low | Use external payment (donation), not Play billing | Dev |

---

## 13. DEPENDENCY MAP

```
Sprint 1-2: Backend Setup
├── US-V3-1 Backend Infrastructure
│   ├── US-V3-2 Auth System
│   ├── US-V3-3 REST API
│   └── US-V3-4 Server DB Schema
├── US-V3-2 Auth System
│   └── depends on: US-V3-1
├── US-V3-3 REST API
│   └── depends on: US-V3-1, US-V3-2
└── US-V3-4 Server DB Schema
    └── depends on: US-V3-1

Sprint 3-4: Sync Engine
├── US-V3-5 Sync Engine Core
│   ├── depends on: US-V3-3, US-V3-4
│   ├── US-V3-6 Sync Encryption
│   └── US-V3-7 Sync Status UI
├── US-V3-6 Sync Encryption
│   └── depends on: US-V3-5
├── US-V3-7 Sync Status UI
│   └── depends on: US-V3-5

Sprint 5-6: Multi-Device & Conflicts
├── US-V3-8 Multi-Device Support
│   └── depends on: US-V3-5
├── US-V3-9 Conflict Resolution
│   └── depends on: US-V3-5
└── US-V3-10 Trash / Recently Deleted
    └── depends on: US-V3-9

Sprint 7: Web Dashboard
├── US-V3-11 Desktop Dashboard
│   └── depends on: US-V3-5, US-V3-2
└── US-V3-12 Desktop Table View
    └── depends on: US-V3-11

Sprint 8: Anomaly Detection
├── US-V3-13 Spending Anomaly
│   └── depends on: US-2.2, US-7.3
└── US-V3-14 Advanced Insights
    └── depends on: US-V2-10, US-V2-11

Sprint 9: Predictive
├── US-V3-15 Month-End Prediction
│   └── depends on: US-2.2
└── US-V3-16 Spending Forecast
    └── depends on: US-V3-15, US-V2-10

Sprint 10: Bills & Subscriptions
├── US-V3-17 Bill Reminder
│   └── depends on: US-2.1, US-7.3, US-5.3
└── US-V3-18 Subscription Manager
    └── depends on: US-5.3, US-2.2

Sprint 11: Play Store
├── US-V3-19 Play Store Submission
│   └── depends on: US-7.7
└── US-V3-20 Auto-Update APK
    └── depends on: US-7.8, US-7.1

Sprint 12: Premium & Launch
├── US-V3-21 Premium Tier
│   └── depends on: ALL V3 features
├── US-V3-22 Performance V3
│   └── depends on: ALL V3 features
├── US-V3-23 Regression Testing
│   └── depends on: ALL V3 features
└── US-V3-24 Release & Launch
    └── depends on: US-V3-23
```

---

## 14. PERFORMANCE BUDGET TRACKER

| Metric | Target | Sprint 4 | Sprint 8 | Sprint 12 |
|---|---|---|---|---|
| Bundle (gzipped) | < 500KB | < 380KB | < 450KB | < 500KB |
| APK size | < 20MB | < 15MB | < 18MB | < 20MB |
| API response (p95) | < 200ms | < 200ms | < 200ms | < 200ms |
| Sync (50 pending) | < 5s | < 5s | < 5s | < 5s |
| Web dashboard load | < 2s | — | — | < 2s |
| Anomaly detection | < 5% FP | — | < 5% | < 5% |
| Prediction accuracy | ±15% | — | — | ±15% |
| Lighthouse Performance | ≥ 80 | — | — | ≥ 80 |
| Lighthouse PWA | ≥ 90 | ≥ 90 | ≥ 90 | ≥ 90 |
| Uptime (backend) | 99.9% | — | — | 99.9% |

---

*Document Version: 1.0*
*Created: May 2026*
*Based on: Perancangan_Nyatet_Duwit.md — Section G (V3 Roadmap) + Feature Hierarchy Table (TIER 2–4)*
*Status: Draft*
