# Sprint Planning — NyatetDuwit V2

> 8 Sprint (Week 14–25) | Target: Control & Growth
> Based on: Perancangan_Nyatet_Duwit.md — Section G (V2 Roadmap) + Feature Hierarchy Table (TIER 2–4)
> Stack: React + Vite + Dexie.js + Zustand + Tailwind + vite-plugin-pwa

---

## TABLE OF CONTENTS

1. [Sprint Overview](#1-sprint-overview)
2. [Definition of Done](#2-definition-of-done)
3. [Sprint 1: Savings Goal System](#3-sprint-1-savings-goal-system)
4. [Sprint 2: Emergency Fund & Debt Tracker](#4-sprint-2-emergency-fund--debt-tracker)
5. [Sprint 3: Tag System](#5-sprint-3-tag-system)
6. [Sprint 4: Spending Trend & Cashflow Charts](#6-sprint-4-spending-trend--cashflow-charts)
7. [Sprint 5: Import CSV & App Lock](#7-sprint-5-import-csv--app-lock)
8. [Sprint 6: Encryption & Smart Notifications](#8-sprint-6-encryption--smart-notifications)
9. [Sprint 7: Transfer History & PWA Shortcuts](#9-sprint-7-transfer-history--pwa-shortcuts)
10. [Sprint 8: Polish, QA & Launch](#10-sprint-8-polish-qa--launch)
11. [Risk Register](#11-risk-register)
12. [Dependency Map](#12-dependency-map)
13. [Performance Budget Tracker](#13-performance-budget-tracker)

---

## 1. SPRINT OVERVIEW

| Sprint | Week | Theme | Deliverable | Story Points |
|---|---|---|---|---|
| **Sprint 1** | 14–15 | Savings Goal System | Goal CRUD, progress tracking, dashboard widget | 34 |
| **Sprint 2** | 16–17 | Emergency Fund & Debt Tracker | Emergency fund calculator, debt/piutang ledger | 36 |
| **Sprint 3** | 18 | Tag System | Tag CRUD, filter by tag, tag suggestions | 24 |
| **Sprint 4** | 19–20 | Charts: Trend & Cashflow | 90-day spending trend line chart, cashflow dual bar | 30 |
| **Sprint 5** | 21–22 | Import CSV & App Lock | CSV import with mapping, PIN/biometric lock | 34 |
| **Sprint 6** | 23 | Encryption & Smart Notifications | Local encryption toggle, smart notification timing | 26 |
| **Sprint 7** | 24 | Transfer History & Shortcuts | Transfer history view, PWA shortcuts improvements | 20 |
| **Sprint 8** | 25 | Polish, QA & Launch | Regression testing, performance, V2 release | 28 |
| **TOTAL** | | | **V2 Release** | **232** |

### Velocity Assumption

- 1 developer = ~28–32 story points per sprint
- Story point scale: 1 (trivial), 2 (simple), 3 (medium), 5 (complex), 8 (very complex), 13 (epic)

---

## 2. DEFINITION OF DONE

Mengacu ke DoD yang sama dengan `sprint_planning.md` Section 2. Tambahan khusus V2:

### DoD — V2 Additions

- [ ] App Lock tested on Android Chrome + TWA (PIN and biometric)
- [ ] Local encryption toggle works — data encrypted at rest in IndexedDB
- [ ] Import CSV handles: Indonesian locale, various date formats, duplicate detection
- [ ] Trend chart renders smoothly with 90 data points on low-end device
- [ ] All new DB schemas (goals, debts, tags) have migration path from V1.5
- [ ] Biometric auth falls back gracefully to PIN if unavailable

---

## 3. SPRINT 1: SAVINGS GOAL SYSTEM

**Week:** 14–15
**Theme:** "User bisa track tujuan finansial"
**Story Points:** 34

### Sprint Goal

User bisa membuat goals (liburan, gadget, darurat), track progress, dan lihat estimasi selesai. Goals muncul di dashboard.

---

### US-V2-1: Savings Goal CRUD

**Priority:** P0
**Story Points:** 13
**Assignee:** Developer
**Status:** Done

**Deskripsi:**
Sistem goal tracking. User bisa bikin goal dengan target nominal, deadline optional, dan icon.

**Berdasarkan Perancangan:** P2 (Savings Goal) — *"Track progress per goal"* + Section G V2

**Database Schema:**
```typescript
interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  deadline?: number;
  createdAt: number;
  updatedAt: number;
}
```

**UX Flow:**
```
More → Goals → [Tambah Goal]
  → Nama goal (e.g., "Liburan Bali")
  → Target nominal (e.g., Rp 5.000.000)
  → Deadline (optional)
  → Icon + color picker
  → Save

List view:
┌────────────────────────────────────┐
│ ← Goals                      [+]  │
│                                    │
│  🏝️ Liburan Bali                  │
│  ━━━━━━━━━━━━░░░░░░ 50%           │
│  Rp 2.500.000 / Rp 5.000.000      │
│  Selesai: Des 2026                 │
│                                    │
│  💻 Laptop Baru                    │
│  ━━━━░░░░░░░░░░░░ 15%             │
│  Rp 1.500.000 / Rp 10.000.000     │
│  Selesai: — (no deadline)          │
│                                    │
│  Total Progress: 32%               │
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-1.1 | Add Goal interface to database schema | 1 | Code |
| V2-1.2 | Create goalRepository (CRUD + aggregate) | 2 | Code |
| V2-1.3 | Create GoalList page | 1 | Code |
| V2-1.4 | Create GoalForm (BottomSheet: name, target, deadline, icon, color) | 2 | Code |
| V2-1.5 | Implement progress bar (color-coded) | 1 | Code |
| V2-1.6 | Implement deadline calculation (estimated completion date) | 2 | Code |
| V2-1.7 | Implement edit goal (adjust target, add to current amount) | 2 | Code |
| V2-1.8 | Implement delete goal (with confirmation) | 1 | Code |
| V2-1.9 | Implement "Add to Goal" from transaction form (optional field) | 3 | Code |
| V2-1.10 | Create GoalCard component (reusable) | 1 | Code |
| V2-1.11 | Write tests for goal repository + calculations | 3 | Testing |

**Acceptance Criteria:**
- [ ] Goal can be created with name, target, deadline, icon, color
- [ ] Progress bar shows currentAmount / targetAmount
- [ ] Green < 50%, Yellow 50–80%, Red > 80% (almost there!)
- [ ] Estimated completion date calculated from current savings rate
- [ ] User can manually add to goal current amount
- [ ] User can link transaction to goal (optional)
- [ ] Goal list shows total progress across all goals
- [ ] Default goal icons: 10+ relevant icons (vacation, gadget, house, etc.)
- [ ] Edit adjusts target and/or current amount
- [ ] Delete has confirmation dialog

**Dependencies:** US-1.4 (DB schema), US-1.2 (UI components)
**Risks:** Goal-target linking from transactions adds complexity. Mitigation: start with manual goal funding, link to transactions in V2.5.

---

### US-V2-2: Goal Dashboard Widget

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** Done

**Deskripsi:**
Tampilkan progress goals di dashboard. Ringkasan cepat tanpa perlu buka halaman Goals.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-2.1 | Create GoalSummaryWidget component | 1 | Code |
| V2-2.2 | Show top 3 goals by progress on dashboard | 1 | Code |
| V2-2.3 | Show nearest deadline goal | 1 | Code |
| V2-2.4 | Show total goal progress | 1 | Code |
| V2-2.5 | Tap widget → open Goals page | 0.5 | Code |
| V2-2.6 | Write tests | 0.5 | Testing |

**Acceptance Criteria:**
- [ ] Widget shows on dashboard (below budget section)
- [ ] Shows top 3 goals by progress percentage
- [ ] Shows goal with nearest deadline highlighted
- [ ] Shows total progress across all goals
- [ ] Tap opens Goals page
- [ ] Updates in real-time when goal progress changes

**Dependencies:** US-V2-1, US-3.1
**Risks:** None significant.

---

### US-V2-3: Goal Milestone Celebration

**Priority:** P2
**Story Points:** 5
**Assignee:** Developer
**Status:** Done

**Deskripsi:**
Saat goal mencapai milestone (25%, 50%, 75%, 100%), tampilkan celebration toast.

**Berdasarkan Perancangan:** R7 (Milestone Celebration) — *"100 transaksi tercatat!"*

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-3.1 | Implement milestone detection (25/50/75/100%) | 1 | Code |
| V2-3.2 | Create celebration toast component | 2 | Code |
| V2-3.3 | Add haptic feedback on milestone | 1 | Code |
| V2-3.4 | Track milestone history (prevent repeat celebrations) | 1 | Code |
| V2-3.5 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] Toast fires at 25%, 50%, 75%, 100% progress
- [ ] Toast message: "🎉 Goal X 50% tercapai!"
- [ ] At 100%: "🎉 Selamat! Goal X tercapai!"
- [ ] Haptic vibration on celebration
- [ ] Each milestone only fires once (tracked in settings)
- [ ] Celebration is subtle, not annoying

**Dependencies:** US-V2-1
**Risks:** Celebration fatigue. Mitigation: only celebrate major milestones (50%, 100%).

---

### Sprint 1 Deliverables Checklist

- [x] Savings Goal CRUD (US-V2-1)
- [x] Goal dashboard widget (US-V2-2)
- [x] Goal milestone celebration (US-V2-3)
- [x] All tests pass
- [x] Goal progress accurate
- [x] Dashboard widget updates correctly

---

## 4. SPRINT 2: EMERGENCY FUND & DEBT TRACKER

**Week:** 16–17
**Theme:** "User bisa track dana darurat dan utang/piutang"
**Story Points:** 36

### Sprint Goal

Emergency fund tracker dengan rekomendasi (3x pengeluaran). Debt/piutang tracker dengan reminder.

---

### US-V2-4: Emergency Fund Tracker

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Track dana darurat. Hitung recommended amount (3x monthly expenses), tampilkan progress.

**Berdasarkan Perancangan:** P1 (Emergency Fund Tracker) — *"Set target (3x expense), track progress"*

**Layout:**
```
┌────────────────────────────────────┐
│ ← Dana Darurat                     │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  🛡️ Progress Dana Darurat    │  │
│  │                              │  │
│  │  ━━━━━━━━━━░░░░░░░ 60%       │  │
│  │                              │  │
│  │  Terkumpul: Rp 9.000.000     │  │
│  │  Target:    Rp 15.000.000    │  │
│  │                              │  │
│  │  Rekomendasi: 3x pengeluaran │  │
│  │  bulanan (Rp 5.000.000)      │  │
│  └──────────────────────────────┘  │
│                                    │
│  Tips:                              │
│  "Idealnya dana darurat 3-6 bulan  │
│   pengeluaran. Kamu sudah 60%!"    │
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-4.1 | Create EmergencyFund page | 1 | Code |
| V2-4.2 | Calculate recommended amount (3x avg monthly expense last 3 months) | 2 | Code |
| V2-4.3 | Implement manual target setting (or auto based on expense) | 2 | Code |
| V2-4.4 | Track current emergency fund (link to account or manual) | 2 | Code |
| V2-4.5 | Implement progress visualization | 1 | Code |
| V2-4.6 | Add educational tips (based on progress level) | 1 | Code |
| V2-4.7 | Write tests | 2 | Testing |

**Acceptance Criteria:**
- [ ] Recommended target calculated as 3x average monthly expense
- [ ] User can set custom target amount
- [ ] Progress bar shows current vs target
- [ ] User can select which account(s) count as emergency fund
- [ ] Tips shown based on progress level (< 25%, 50%, 75%, 100%)
- [ ] Dashboard shows emergency fund status (subtle)
- [ ] All calculations accurate

**Dependencies:** US-2.2, US-V2-1 (reuse goal-like progress UI)
**Risks:** Linking to specific accounts adds complexity. Mitigation: allow manual amount entry as simpler alternative.

---

### US-V2-5: Debt/Piutang Tracker

**Priority:** P0
**Story Points:** 13
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Track utang (uang yang dipinjam) dan piutang (uang yang dipinjamkan). Reminder untuk due date.

**Berdasarkan Perancangan:** P3 (Debt/Piutang Tracker) — *"Track utang & piutang"* + Section G V2

**Database Schema:**
```typescript
interface Debt {
  id: string;
  type: 'owed' | 'owing';  // piutang / utang
  personName: string;
  amount: number;
  paidAmount: number;
  dueDate?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
```

**UX Flow:**
```
More → Debt → [Tambah]
  → Type: [Piutang (dipinjamkan)] [Utang (dipinjam)]
  → Nama orang
  → Jumlah
  → Due date (optional)
  → Notes (optional)
  → Save

List view:
┌────────────────────────────────────┐
│ ← Utang & Piutang           [+]   │
│                                    │
│  Piutang (Rp 2.500.000)            │
│  ├── Andi              Rp 1.000.000│
│  │    Jatuh tempo: 1 Jun 2026   ⚠️ │
│  └── Budi              Rp 1.500.000│
│                                    │
│  Utang (Rp 500.000)                │
│  └── Citra              Rp 500.000 │
│       Jatuh tempo: 15 Jul 2026     │
│                                    │
│  Total piutang: Rp 2.500.000       │
│  Total utang:   Rp 500.000         │
│  Net:           Rp 2.000.000       │
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-5.1 | Add Debt interface to database schema | 1 | Code |
| V2-5.2 | Create debtRepository (CRUD + aggregate) | 2 | Code |
| V2-5.3 | Create DebtList page (grouped by type) | 2 | Code |
| V2-5.4 | Create DebtForm (BottomSheet: type, person, amount, due date, notes) | 2 | Code |
| V2-5.5 | Implement partial payment tracking (paidAmount) | 2 | Code |
| V2-5.6 | Implement due date reminder notification | 3 | Code |
| V2-5.7 | Implement edit/delete debt | 1 | Code |
| V2-5.8 | Show net balance (total piutang - total utang) | 1 | Code |
| V2-5.9 | Write tests for debt repository + calculations | 3 | Testing |

**Acceptance Criteria:**
- [ ] Debt can be created as 'owed' (piutang) or 'owing' (utang)
- [ ] Person name stored (not linked to contacts — privacy)
- [ ] Partial payment tracked (paidAmount < amount = still owed)
- [ ] Due date notification fires 3 days before (configurable)
- [ ] List grouped by type (Piutang / Utang)
- [ ] Overdue items shown with ⚠️ warning
- [ ] Net balance shown (piutang - utang)
- [ ] Edit/delete works with confirmation
- [ ] Dashboard shows total debt net (subtle, expandable)

**Dependencies:** US-1.4, US-7.3 (notification)
**Risks:** Privacy — user might not want debt data exposed. Mitigation: hide net balance by default, expandable card.

---

### US-V2-6: Debt Dashboard Widget

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Widget ringkasan utang/piutang di dashboard.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-6.1 | Create DebtSummaryWidget component | 1 | Code |
| V2-6.2 | Show net debt balance | 1 | Code |
| V2-6.3 | Show count of overdue items | 1 | Code |
| V2-6.4 | Expandable card with details | 1 | Code |
| V2-6.5 | Tap to open Debt page | 0.5 | Code |
| V2-6.6 | Write tests | 0.5 | Testing |

**Acceptance Criteria:**
- [ ] Widget shows on dashboard (collapsed by default)
- [ ] Shows net balance (piutang - utang)
- [ ] Shows count of overdue items with warning
- [ ] Expand to show quick list (top 3)
- [ ] Tap opens full Debt page
- [ ] Updates in real-time

**Dependencies:** US-V2-5, US-3.1
**Risks:** None significant.

---

### Sprint 2 Deliverables Checklist

- [ ] Emergency fund tracker (US-V2-4)
- [ ] Debt/piutang tracker with reminder (US-V2-5)
- [ ] Debt dashboard widget (US-V2-6)
- [ ] All tests pass
- [ ] Emergency fund calculation accurate
- [ ] Debt reminder fires correctly
- [ ] Net balance calculation correct

---

## 5. SPRINT 3: TAG SYSTEM

**Week:** 18
**Theme:** "User bisa tag transaksi untuk grouping custom"
**Story Points:** 24

### Sprint Goal

Tag system yang ringan. User bisa bikin tag, assign ke transaksi, filter by tag.

---

### US-V2-7: Tag CRUD

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Sistem tagging untuk transaksi. Tag bersifat many-to-many dengan transaksi.

**Berdasarkan Perancangan:** C9 (Tag System) — *"Add tags, filter by tag"* + Section G V2

**Database Schema:**
```typescript
interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

// Transaction.tags → string[] (array of tag IDs)
// Stored directly on Transaction entity (denormalized for performance)
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-7.1 | Add Tag interface to database schema | 1 | Code |
| V2-7.2 | Create tagRepository (CRUD) | 1 | Code |
| V2-7.3 | Create TagList page | 1 | Code |
| V2-7.4 | Create TagForm (name, color picker) | 1 | Code |
| V2-7.5 | Implement tag assignment in transaction form (multi-select chips) | 2 | Code |
| V2-7.6 | Display tags on transaction detail | 1 | Code |
| V2-7.7 | Implement filter by tag in transaction list | 2 | Code |
| V2-7.8 | Implement edit/delete tag (remove from transactions on delete) | 1 | Code |
| V2-7.9 | Write tests | 2 | Testing |

**Acceptance Criteria:**
- [ ] Tag can be created with name and color
- [ ] Tags assigned to transaction via multi-select chips
- [ ] Existing tags shown as suggestions in form
- [ ] Tags displayed as colored chips on transaction detail
- [ ] Filter by tag works in transaction list
- [ ] Multiple tags can be combined in filter (AND logic)
- [ ] Delete tag removes from all transactions (or keeps orphaned)
- [ ] Color picker for tags (12 preset colors)

**Dependencies:** US-1.4, US-2.1
**Risks:** Many-to-many complexity. Mitigation: store tags as array of IDs on Transaction (denormalized, simpler queries).

---

### US-V2-8: Tag Analytics

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Analytics per tag — lihat total spending per tag, bandingkan antar tag.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-8.1 | Calculate total spending per tag (current month) | 2 | Code |
| V2-8.2 | Display tag breakdown in Insights | 1 | Code |
| V2-8.3 | Add tag filter to monthly overview | 1 | Code |
| V2-8.4 | Show tag spending trend (vs last month) | 1 | Code |
| V2-8.5 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] Insights shows spending breakdown by tag
- [ ] Month selector works for tag analytics
- [ ] Month-over-month comparison per tag
- [ ] Tag filter in monthly overview refines all data
- [ ] "Other" group for transactions without tags

**Dependencies:** US-V2-7, US-6.1
**Risks:** Performance with many tags. Mitigation: index tags array, limit to 10 tags per transaction.

---

### US-V2-9: Tag Suggestions & Auto-Tag

**Priority:** P2
**Story Points:** 3
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Saran tag berdasarkan notes transaksi. Simple keyword matching (bukan AI).

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-9.1 | Implement keyword-to-tag mapping config | 1 | Code |
| V2-9.2 | Auto-suggest tags based on notes content | 1 | Code |
| V2-9.3 | One-tap to accept suggested tag | 0.5 | Code |
| V2-9.4 | Write tests | 0.5 | Testing |

**Acceptance Criteria:**
- [ ] User can configure keyword → tag mappings
- [ ] When typing notes, relevant tags suggested
- [ ] One tap accepts suggestion
- [ ] Mapping stored in settings
- [ ] No machine learning involved (simple string matching)

**Dependencies:** US-V2-7
**Risks:** False positives from keyword matching. Mitigation: suggest, don't auto-assign.

---

### Sprint 3 Deliverables Checklist

- [ ] Tag CRUD with assignment (US-V2-7)
- [ ] Tag analytics in Insights (US-V2-8)
- [ ] Tag suggestions & auto-tag (US-V2-9)
- [ ] All tests pass
- [ ] Tag filter works correctly
- [ ] Tag breakdown in Insights accurate

---

## 6. SPRINT 4: SPENDING TREND & CASHFLOW CHARTS

**Week:** 19–20
**Theme:** "Visualisasi keuangan yang lebih kaya"
**Story Points:** 30

### Sprint Goal

User bisa lihat trend pengeluaran 90 hari dalam line chart. Cashflow view dengan dual bar chart.

---

### US-V2-10: 90-Day Spending Trend Chart

**Priority:** P0
**Story Points:** 10
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Line chart yang menunjukkan trend pengeluaran harian selama 90 hari. Bisa zoom dan compare period.

**Berdasarkan Perancangan:** P7 (Spending Trend Chart) — *"Line chart spending 30/90 hari"* + Section G V2

**Chart Features:**
- Line chart, sumbu X = tanggal, sumbu Y = jumlah
- Smooth curve (optional, can toggle)
- 7-day moving average overlay
- Tap data point → show detail (date, amount, top categories)
- Zoom: pinch to zoom, pan to scroll
- Compare: overlay previous period

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-10.1 | Create TrendChart component (custom SVG/Canvas) | 3 | Code |
| V2-10.2 | Aggregate daily spending for 90 days | 2 | Code |
| V2-10.3 | Implement 7-day moving average calculation | 1 | Code |
| V2-10.4 | Implement tap-to-show-detail on data points | 2 | Code |
| V2-10.5 | Implement zoom (pinch) and pan (scroll) | 2 | Code |
| V2-10.6 | Implement period comparison (overlay previous 90 days) | 2 | Code |
| V2-10.7 | Write tests for aggregation + moving average | 2 | Testing |
| V2-10.8 | Test on low-end device (90 data points, smooth) | 1 | Verification |

**Acceptance Criteria:**
- [ ] Line chart renders 90 days of spending data
- [ ] X-axis: dates, Y-axis: amounts
- [ ] 7-day moving average line (dashed, different color)
- [ ] Tap data point shows tooltip: date, amount, top category
- [ ] Pinch to zoom works (granularity: 90d → 30d → 7d)
- [ ] Pan to scroll through time
- [ ] Compare toggle overlays previous 90 days (different color)
- [ ] Chart renders in < 500ms
- [ ] Works on 320px width
- [ ] Works in dark mode

**Dependencies:** US-2.2
**Risks:** Canvas/SVG performance on low-end with zoom/pan. Mitigation: use lightweight canvas lib or optimized SVG with viewport clipping.

---

### US-V2-11: Cashflow View

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Dual bar chart: income vs expense per bulan. Lihat cashflow trend.

**Berdasarkan Perancangan:** P8 (Cashflow View) — *"Income vs expense over time"* + Section G V2

**Layout:**
```
┌────────────────────────────────────┐
│ ← Arus Kas                         │
│                                    │
│  ┌─────────────────────────────┐   │
│  │ [6 Bulan] [12 Bulan] [24B]  │   │
│  └─────────────────────────────┘   │
│                                    │
│  ████ Pemasukan                    │
│  ████ Pengeluaran                  │
│                                    │
│  Jan  ████████░░░░░░ 8J vs 5.5J   │
│  Feb  ██████░░░░░░░░ 7J vs 4.2J   │
│  Mar  ██████████░░░░ 9J vs 6.1J   │
│  ...                               │
│                                    │
│  Rata-rata pemasukan: Rp 7.5J      │
│  Rata-rata pengeluaran: Rp 5.2J    │
│  Net rata-rata: Rp 2.3J            │
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-11.1 | Create CashflowChart component (dual bar, custom SVG) | 3 | Code |
| V2-11.2 | Aggregate monthly income + expense for selected range | 2 | Code |
| V2-11.3 | Implement period selector (6/12/24 months) | 1 | Code |
| V2-11.4 | Implement bar labels (amount per bar) | 1 | Code |
| V2-11.5 | Show averages (monthly income, expense, net) | 1 | Code |
| V2-11.6 | Write tests | 2 | Testing |

**Acceptance Criteria:**
- [ ] Dual bar chart: green = income, red = expense
- [ ] Each month shows two bars side by side
- [ ] Period selector works (6, 12, 24 months)
- [ ] Bar labels show formatted amounts
- [ ] Averages displayed below chart
- [ ] Chart renders in < 300ms with 24 months data
- [ ] Works on 320px width (horizontal scroll if needed)
- [ ] Works in dark mode

**Dependencies:** US-2.2
**Risks:** Horizontal scroll on small screens. Mitigation: make chart horizontally scrollable if 24 months don't fit.

---

### US-V2-12: Chart Performance Optimization

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Optimasi performa semua chart. Pastikan smooth di low-end device.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-12.1 | Implement chart data virtual viewport (only render visible data points) | 2 | Code |
| V2-12.2 | Add requestAnimationFrame for animations | 1 | Code |
| V2-12.3 | Lazy load chart components | 1 | Code |
| V2-12.4 | Test on low-end device profile (RAM 2GB, CPU throttle 4x) | 1 | Verification |

**Acceptance Criteria:**
- [ ] Charts render in < 500ms on low-end device
- [ ] Scroll/zoom at 30fps minimum on low-end
- [ ] Chart components lazy-loaded (not in initial bundle)
- [ ] No layout shift when chart loads

**Dependencies:** US-V2-10, US-V2-11
**Risks:** None significant.

---

### Sprint 4 Deliverables Checklist

- [ ] 90-day spending trend chart (US-V2-10)
- [ ] Cashflow dual bar chart (US-V2-11)
- [ ] Chart performance optimization (US-V2-12)
- [ ] All tests pass
- [ ] Charts render smoothly on low-end device
- [ ] Chart data accurate

---

## 7. SPRINT 5: IMPORT CSV & APP LOCK

**Week:** 21–22
**Theme:** "User bisa migrasi data dari app lain dan kunci app"
**Story Points:** 34

### Sprint Goal

Import CSV dari app finance lain. App lock dengan PIN atau biometric.

---

### US-V2-13: Import CSV

**Priority:** P0
**Story Points:** 13
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
User bisa import transaksi dari CSV. Support format umum (Money Lover, Wallet, generic).

**Berdasarkan Perancangan:** P5 (Import CSV) — *"Template CSV, map columns"* + Section G V2

**UX Flow:**
```
More → Import Data
  → Select file (CSV)
  → Preview first 5 rows
  → Map columns:
       [Tanggal] → [Date field]
       [Jumlah]  → [Amount field]
       [Kategori] → [Category field]
       [Catatan]  → [Notes field]
       ...
  → Import → Validation → Results:
       ✅ 45 imported
       ⚠️ 3 skipped (duplicates)
       ❌ 2 failed (invalid data)
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-13.1 | Create ImportPage with file picker | 1 | Code |
| V2-13.2 | Implement CSV parser (handle various delimiters, encoding) | 3 | Code |
| V2-13.3 | Implement preview (first 5-10 rows) | 1 | Code |
| V2-13.4 | Implement column mapping UI (drag matching) | 3 | Code |
| V2-13.5 | Implement validation (date format, amount, required fields) | 2 | Code |
| V2-13.6 | Implement duplicate detection (by date + amount + category) | 2 | Code |
| V2-13.7 | Implement import execution (batch write to IndexedDB) | 2 | Code |
| V2-13.8 | Show import results (success, skipped, failed counts) | 1 | Code |
| V2-13.9 | Support Money Lover export format (preset mapping) | 2 | Code |
| V2-13.10 | Support generic format (user-defined mapping) | 2 | Code |
| V2-13.11 | Write tests for CSV parser + validator | 3 | Testing |

**Acceptance Criteria:**
- [ ] File picker accepts .csv files
- [ ] Preview shows first 5 rows after file selection
- [ ] Column mapping UI lets user match CSV columns to app fields
- [ ] Preset mappings for: Money Lover, Wallet by BudgetBakers, generic
- [ ] Auto-detect date format (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
- [ ] Validation catches: missing amount, invalid date, negative amount
- [ ] Duplicate detection prevents re-importing same transactions
- [ ] Import shows results: "X imported, Y skipped, Z failed"
- [ ] Failed items listed with reason
- [ ] Import is atomic (rollback on critical failure)
- [ ] 1000 rows import in < 10 seconds
- [ ] Indonesian locale handled (Rp symbol, comma as decimal)

**Dependencies:** US-2.2, US-1.4
**Risks:** CSV format variations are endless. Mitigation: support most common formats, provide clear template documentation.

---

### US-V2-14: App Lock (PIN & Biometric)

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Kunci app dengan PIN 6 digit atau biometric (fingerprint/face unlock). Privacy untuk data keuangan.

**Berdasarkan Perancangan:** Section G V2 — "App Lock (PIN/Biometric)"

**UX Flow:**
```
Settings → Keamanan
  → [Aktifkan Kunci App] toggle
  → Pilih metode: [PIN] [Biometric]
  → Set PIN (6 digit, konfirmasi)
  → Atur timeout: [Segera] [1 menit] [5 menit]

On app resume (after timeout):
  → Lock screen → Enter PIN / Scan fingerprint → Dashboard
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-14.1 | Create LockScreen component (PIN input) | 2 | Code |
| V2-14.2 | Implement PIN setup (set + confirm + change) | 2 | Code |
| V2-14.3 | Implement biometric auth via WebAuthn API | 3 | Code |
| V2-14.4 | Implement app lifecycle detection (visibility change, blur) | 2 | Code |
| V2-14.5 | Implement timeout logic (lock after X minutes in background) | 1 | Code |
| V2-14.6 | Implement security settings page | 1 | Code |
| V2-14.7 | Store PIN hashed (not plaintext) | 1 | Code |
| V2-14.8 | Write tests for PIN + biometric flows | 2 | Testing |

**Acceptance Criteria:**
- [ ] PIN setup: 6 digits, must confirm, validation on mismatch
- [ ] PIN change requires old PIN first
- [ ] Biometric auth uses WebAuthn (fingerprint/face)
- [ ] Fallback to PIN if biometric unavailable/fails
- [ ] Lock triggers on app resume after configurable timeout
- [ ] Lock screen shows only: logo, PIN input, biometric option
- [ ] No data visible in app switcher (screen capture blurred)
- [ ] PIN stored as hash (not plaintext)
- [ ] App reset: if PIN forgotten, user can reset (deletes data)
- [ ] Works in TWA (Trusted Web Activity)

**Dependencies:** US-8.3
**Risks:** WebAuthn support varies on Android browsers. Mitigation: PIN as primary, biometric as enhancement. WebAuthn may not work in all TWA contexts — test thoroughly.

---

### US-V2-15: Export Enhancement — CSV with Tags & Goals

**Priority:** P2
**Story Points:** 3
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Update export CSV untuk include data baru V2 (tags, goals, debts).

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-15.1 | Add tags column to CSV export | 1 | Code |
| V2-15.2 | Add goals export (separate sheet/section) | 1 | Code |
| V2-15.3 | Add debts export (separate sheet/section) | 1 | Code |

**Acceptance Criteria:**
- [ ] CSV export includes tags column
- [ ] Goals and debts exported as separate CSV files (or sections)
- [ ] Format consistent with V1.5 export

**Dependencies:** US-V15-5, US-V2-1, US-V2-5, US-V2-7
**Risks:** None significant.

---

### Sprint 5 Deliverables Checklist

- [ ] Import CSV with column mapping (US-V2-13)
- [ ] App lock PIN & biometric (US-V2-14)
- [ ] Export enhancement (US-V2-15)
- [ ] All tests pass
- [ ] Import handles 1000 rows < 10s
- [ ] App lock triggers correctly on background timeout
- [ ] Biometric fallback to PIN works

---

## 8. SPRINT 6: ENCRYPTION & SMART NOTIFICATIONS

**Week:** 23
**Theme:** "Data lebih aman, notifikasi lebih cerdas"
**Story Points:** 26

### Sprint Goal

Local encryption untuk data sensitif. Notifikasi dengan smart timing berdasarkan kebiasaan user.

---

### US-V2-16: Local Encryption Toggle

**Priority:** P1
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Enkripsi data di IndexedDB. Opsional (toggle) karena enkripsi mempengaruhi performa.

**Berdasarkan Perancangan:** Section G V2 — "Local Encryption (optional, toggle)"

**Implementation:**
- Encrypt sensitive fields (amount, notes, person names) at write
- Decrypt at read
- Key derived from user's PIN (if app lock enabled) or stored in session
- AES-GCM via Web Crypto API (native, no library needed)

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-16.1 | Implement encryption utility (Web Crypto API, AES-GCM) | 3 | Code |
| V2-16.2 | Implement key management (derive from PIN or random key) | 2 | Code |
| V2-16.3 | Implement encrypt-on-write hook in repositories | 2 | Code |
| V2-16.4 | Implement decrypt-on-read hook in repositories | 2 | Code |
| V2-16.5 | Add encryption toggle in settings | 1 | Code |
| V2-16.6 | Add encryption status indicator | 1 | Code |
| V2-16.7 | Write tests for encryption/decryption | 2 | Testing |
| V2-16.8 | Performance benchmark (encrypt vs unencrypted) | 1 | Verification |

**Acceptance Criteria:**
- [ ] Encryption toggle available in security settings
- [ ] When enabled: amount, notes, person names encrypted at rest
- [ ] When disabled: all data readable (no encryption overhead)
- [ ] Encryption uses Web Crypto API (AES-GCM, no extra library)
- [ ] Key derived from PIN or stored in sessionStorage (ephemeral)
- [ ] Data loss warning on toggle: "Enkripsi ulang semua data?"
- [ ] Performance impact < 50ms per read/write operation
- [ ] Backup/restore handles encrypted data correctly
- [ ] Works in TWA

**Dependencies:** US-V2-14, US-1.4
**Risks:** Performance impact of encrypting/decrypting on every read/write. Mitigation: only encrypt sensitive fields, not all data. Make it opt-in.

---

### US-V2-17: Smart Notification Timing

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Notifikasi reminder pinter: kirim notifikasi di waktu user biasanya nyatet, bukan di waktu fixed.

**Berdasarkan Perancangan:** Section G V2 — "Improved notification (smart timing)"

**Logic:**
```typescript
// Track recording times for last 7 days
// Find peak recording hour
// Send reminder 1 hour before peak time
// If no pattern → fallback to user-set time
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-17.1 | Track transaction recording timestamps (hour of day) | 1 | Code |
| V2-17.2 | Calculate peak recording time (last 7 days) | 1 | Code |
| V2-17.3 | Implement adaptive notification scheduling | 2 | Code |
| V2-17.4 | Add "smart" toggle in notification settings | 1 | Code |
| V2-17.5 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] System tracks what time user typically records transactions
- [ ] After 7 days of data, notification shifts to 1h before peak time
- [ ] Smart toggle enables/disables adaptive timing
- [ ] Fallback to user-set time if insufficient data
- [ ] Notification still respects "don't notify if already recorded"
- [ ] Timing calculation runs weekly

**Dependencies:** US-7.3, US-2.1
**Risks:** Privacy — tracking user behavior. Mitigation: all processing local, no data sent anywhere.

---

### US-V2-18: Weekly & Monthly In-App Review Enhancements

**Priority:** P2
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Tingkatkan in-app review dengan data baru V2: tag breakdown, goal progress, debt summary.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-18.1 | Add tag breakdown to monthly review | 1 | Code |
| V2-18.2 | Add goal progress summary to monthly review | 1 | Code |
| V2-18.3 | Add debt summary to monthly review | 1 | Code |
| V2-18.4 | Add emergency fund status to monthly review | 1 | Code |
| V2-18.5 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] Monthly review shows top tags by spending
- [ ] Monthly review shows goal progress (X goals active, X% complete)
- [ ] Monthly review shows debt net change
- [ ] Emergency fund status in monthly review
- [ ] All sections optional (collapse if no data)

**Dependencies:** US-V15-2, US-V2-1, US-V2-5, US-V2-7
**Risks:** Review page getting too long. Mitigation: collapsible sections.

---

### Sprint 6 Deliverables Checklist

- [ ] Local encryption toggle (US-V2-16)
- [ ] Smart notification timing (US-V2-17)
- [ ] In-app review enhancements (US-V2-18)
- [ ] All tests pass
- [ ] Encryption overhead < 50ms per operation
- [ ] Smart notification schedules correctly

---

## 9. SPRINT 7: TRANSFER HISTORY & PWA SHORTCUTS

**Week:** 24
**Theme:** "Transfer lebih transparan, PWA shortcuts lebih berguna"
**Story Points:** 20

### Sprint Goal

Transfer history view yang dedicated. PWA shortcuts improvements.

---

### US-V2-19: Transfer History View

**Priority:** P1
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Halaman khusus untuk lihat history transfer antar akun. Filter by account, date range.

**Berdasarkan Perancangan:** Section G V2 — "Multi-account transfer history"

**Layout:**
```
┌────────────────────────────────────┐
│ ← Riwayat Transfer                 │
│                                    │
│  Filter: [Semua Akun] [Bulan Ini] │
│                                    │
│  19 Mei 2026                       │
│  ┌──────────────────────────────┐  │
│  │ Cash → GoPay       Rp 200.000│  │
│  │ Catatan: Isi GoPay           │  │
│  └──────────────────────────────┘  │
│                                    │
│  18 Mei 2026                       │
│  ┌──────────────────────────────┐  │
│  │ BCA → Cash         Rp 500.000│  │
│  │ Catatan: Tarik tunai        │  │
│  └──────────────────────────────┘  │
│                                    │
│  Total transfer bulan ini:          │
│  Rp 3.500.000 (10 transfer)        │
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-19.1 | Create TransferHistory page | 1 | Code |
| V2-19.2 | Filter by account (from, to, or both) | 2 | Code |
| V2-19.3 | Filter by date range | 1 | Code |
| V2-19.4 | Show transfer summary (total amount, count) | 1 | Code |
| V2-19.5 | Group by date | 1 | Code |
| V2-19.6 | Write tests | 2 | Testing |

**Acceptance Criteria:**
- [ ] Dedicated page for transfer history (More → Transfer History)
- [ ] Filter by source account, destination account
- [ ] Filter by date range
- [ ] Grouped by date
- [ ] Shows total transfer amount and count
- [ ] Shows from → to with amounts
- [ ] Shows notes if exists

**Dependencies:** US-2.2, US-4.3
**Risks:** None significant.

---

### US-V2-20: PWA Shortcuts Enhancement

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Tambah PWA shortcuts baru: quick add with specific category, view dashboard, view insights.

**Berdasarkan Perancangan:** R3 (Quick Add Widget/PWA Shortcuts) — *"PWA shortcut / widget if supported"*

**Shortcuts:**
```
Long-press app icon:
├── 📝 Tambah Transaksi (existing)
├── 🍽️ Tambah Makanan (new — opens form with 'Makan & Minum' pre-selected)
├── 📊 Dashboard (new — opens dashboard)
└── 📈 Insight (new — opens insights page)
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-20.1 | Add dynamic shortcuts to manifest (via JavaScript) | 2 | Code |
| V2-20.2 | Implement URL param handling for pre-selected category | 1 | Code |
| V2-20.3 | Add shortcut icons | 1 | Design |
| V2-20.4 | Test on Android Chrome | 1 | Verification |

**Acceptance Criteria:**
- [ ] Long-press shows 4 shortcuts (not just 1)
- [ ] "Tambah Makanan" opens form with category pre-selected
- [ ] "Dashboard" shortcut opens dashboard (/?action=dashboard)
- [ ] "Insight" shortcut opens insights page
- [ ] Shortcuts are dynamic (could be customized in future)
- [ ] Works on installed PWA

**Dependencies:** US-7.6, US-2.1
**Risks:** Browser shortcut limit (Chrome allows ~3-5). Mitigation: prioritize most useful.

---

### US-V2-21: In-App Update Checker Enhancement

**Priority:** P2
**Story Points:** 3
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Tingkatkan in-app update checker: show changelog, force update option for critical fixes.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-21.1 | Fetch and display changelog from version.json | 1 | Code |
| V2-21.2 | Implement force update (block app until update) | 1 | Code |
| V2-21.3 | Add "What's New" modal on app update | 1 | Code |

**Acceptance Criteria:**
- [ ] Update notification shows changelog
- [ ] Critical updates can be forced (app blocked until update)
- [ ] "What's New" shows once after update
- [ ] Works in both PWA and TWA

**Dependencies:** US-7.8
**Risks:** None significant.

---

### Sprint 7 Deliverables Checklist

- [ ] Transfer history view (US-V2-19)
- [ ] PWA shortcuts enhancement (US-V2-20)
- [ ] In-app update checker enhancement (US-V2-21)
- [ ] All tests pass
- [ ] Transfer history filters work correctly
- [ ] PWA shortcuts functional on Android Chrome

---

## 10. SPRINT 8: POLISH, QA & LAUNCH

**Week:** 25
**Theme:** "V2 siap rilis"
**Story Points:** 28

### Sprint Goal

Full regression test, performance optimization, dokumentasi, dan rilis V2.

---

### US-V2-22: Performance Optimization V2

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Optimasi performa untuk semua fitur baru V2. Bundle size, render time, memory.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-22.1 | Analyze bundle size additions from V2 | 1 | Analysis |
| V2-22.2 | Lazy load new pages (Goals, Debt, Tags, Import, etc.) | 2 | Code |
| V2-22.3 | Optimize chart rendering (canvas instead of SVG if needed) | 2 | Code |
| V2-22.4 | Optimize encryption performance | 1 | Code |
| V2-22.5 | Test all V2 features on low-end device | 1 | Verification |
| V2-22.6 | Lighthouse audit | 1 | Verification |

**Acceptance Criteria:**
- [ ] Bundle size < 350KB gzipped (V1.5 was < 250KB, V2 adds ~100KB)
- [ ] All new pages lazy-loaded
- [ ] Charts render < 500ms
- [ ] Encryption adds < 50ms per operation
- [ ] Lighthouse Performance ≥ 85 (acceptable for V2 with more features)
- [ ] Works on RAM 2GB device

**Dependencies:** All V2 features
**Risks:** Bundle size creep. Mitigation: aggressive tree-shaking, lazy loading.

---

### US-V2-23: Regression Testing

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Regression test untuk semua fitur V1, V1.5, dan V2.

**Test Plan:**

| Area | Tests | Method |
|---|---|---|
| V1 Core (CRUD, Dashboard, etc.) | Full regression | Automated + Manual |
| V1.5 (Summary, Export, etc.) | Full regression | Automated + Manual |
| V2 New (Goals, Debt, Tags, Charts, Import, Lock, Encryption) | Full test | Manual |
| Cross-feature (Tags + Search, Goals + Dashboard, etc.) | Integration | Manual |

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-23.1 | Run full automated test suite | 2 | Testing |
| V2-23.2 | Manual regression: V1 core features | 2 | Testing |
| V2-23.3 | Manual regression: V1.5 features | 1 | Testing |
| V2-23.4 | Manual test: all V2 features | 2 | Testing |
| V2-23.5 | Cross-feature integration tests | 2 | Testing |
| V2-23.6 | Fix all P0 and P1 bugs | 3 | Code |

**Acceptance Criteria:**
- [ ] All V1 features no regression
- [ ] All V1.5 features no regression
- [ ] All V2 features pass acceptance criteria
- [ ] Zero P0 bugs
- [ ] Zero P1 bugs
- [ ] P2+ bugs documented

**Dependencies:** All V2 features
**Risks:** Scope of regression testing is large. Mitigation: prioritize automated tests for V1 core.

---

### US-V2-24: V2 Documentation & Release

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Update semua dokumentasi, build APK, dan rilis V2.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V2-24.1 | Update CHANGELOG.md | 1 | Documentation |
| V2-24.2 | Update README (new features, screenshots) | 1 | Documentation |
| V2-24.3 | Update landing page for V2 | 1 | Code |
| V2-24.4 | Build new APK (signed) | 1 | Build |
| V2-24.5 | Upload APK to GitHub Releases | 0.5 | Setup |
| V2-24.6 | Update version.json | 0.5 | Config |

**Acceptance Criteria:**
- [ ] CHANGELOG updated with all V2 entries
- [ ] README updated
- [ ] Landing page updated
- [ ] APK built, signed, uploaded
- [ ] version.json reflects V2 version
- [ ] In-app update detects V2 from V1.5

**Dependencies:** US-V2-23
**Risks:** None significant.

---

### Sprint 8 Deliverables Checklist

- [ ] Performance optimization V2 (US-V2-22)
- [ ] Regression testing (US-V2-23)
- [ ] Documentation & release (US-V2-24)
- [ ] All tests pass
- [ ] Zero P0/P1 bugs
- [ ] Bundle size < 350KB gzipped
- [ ] Lighthouse Performance ≥ 85
- [ ] APK built and released

---

## 11. RISK REGISTER

| # | Risk | Impact | Probability | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | Import CSV fails on edge case formats | High | Medium | Support most common formats, provide clear template | Dev |
| R2 | Biometric auth (WebAuthn) fails in TWA | High | Medium | PIN fallback always available, test TWA thoroughly | Dev |
| R3 | Encryption performance impact too high | Medium | Medium | Only encrypt sensitive fields, make it opt-in toggle | Dev |
| R4 | Charts jank on low-end devices | High | Medium | Canvas instead of SVG if needed, limit data points | Dev |
| R5 | Bundle size exceeds budget significantly | High | Medium | Aggressive code splitting, lazy load everything non-critical | Dev |
| R6 | V1 regression from V2 changes | High | Low | Comprehensive automated regression suite | Dev |
| R7 | PIN forgotten — user locked out | Medium | Medium | Provide secure reset (data wipe), document clearly | Dev |
| R8 | Tag system adoption low (users don't use tags) | Low | Medium | Make tags visible and useful in insights | PM |

---

## 12. DEPENDENCY MAP

```
Sprint 1: Savings Goals
├── US-V2-1 Goal CRUD
│   └── US-V2-2 Goal Widget
├── US-V2-2 Goal Widget
│   └── depends on: US-V2-1, US-3.1
├── US-V2-3 Milestone Celebration
│   └── depends on: US-V2-1

Sprint 2: Emergency Fund & Debt
├── US-V2-4 Emergency Fund
│   ├── depends on: US-2.2, US-V2-1
├── US-V2-5 Debt/Piutang Tracker
│   ├── depends on: US-1.4, US-7.3
│   └── US-V2-6 Debt Widget
├── US-V2-6 Debt Widget
│   └── depends on: US-V2-5, US-3.1

Sprint 3: Tag System
├── US-V2-7 Tag CRUD
│   ├── depends on: US-1.4, US-2.1
│   ├── US-V2-8 Tag Analytics
│   └── US-V2-9 Tag Suggestions
├── US-V2-8 Tag Analytics
│   └── depends on: US-V2-7, US-6.1
├── US-V2-9 Tag Suggestions
│   └── depends on: US-V2-7

Sprint 4: Charts
├── US-V2-10 Trend Chart
│   ├── depends on: US-2.2
│   └── US-V2-12 Chart Performance
├── US-V2-11 Cashflow Chart
│   ├── depends on: US-2.2
│   └── US-V2-12 Chart Performance
└── US-V2-12 Chart Performance
    └── depends on: US-V2-10, US-V2-11

Sprint 5: Import & App Lock
├── US-V2-13 Import CSV
│   ├── depends on: US-2.2, US-1.4
├── US-V2-14 App Lock
│   ├── depends on: US-8.3
│   └── US-V2-16 Encryption
├── US-V2-15 Export Enhancement
│   └── depends on: US-V15-5, US-V2-1, US-V2-5, US-V2-7

Sprint 6: Encryption & Smart Notifications
├── US-V2-16 Local Encryption
│   └── depends on: US-V2-14
├── US-V2-17 Smart Notification
│   └── depends on: US-7.3, US-2.1
├── US-V2-18 Review Enhancement
│   └── depends on: US-V15-2, US-V2-1, US-V2-5, US-V2-7

Sprint 7: Transfer History & Shortcuts
├── US-V2-19 Transfer History
│   └── depends on: US-2.2, US-4.3
├── US-V2-20 PWA Shortcuts
│   └── depends on: US-7.6, US-2.1
├── US-V2-21 Update Checker
│   └── depends on: US-7.8

Sprint 8: Polish, QA & Launch
├── US-V2-22 Performance
│   └── depends on: ALL V2 features
├── US-V2-23 Regression Testing
│   └── depends on: ALL V2 features
├── US-V2-24 Documentation & Release
│   └── depends on: US-V2-23
```

---

## 13. PERFORMANCE BUDGET TRACKER

| Metric | Target | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Sprint 5 | Sprint 6 | Sprint 7 | Sprint 8 |
|---|---|---|---|---|---|---|---|---|---|
| Bundle (gzipped) | < 350KB | < 260KB | < 280KB | < 290KB | < 310KB | < 330KB | < 340KB | < 345KB | < 350KB |
| APK size | < 15MB | < 12MB | < 12MB | < 12MB | < 13MB | < 13MB | < 14MB | < 14MB | < 15MB |
| Chart render | < 500ms | — | — | — | < 500ms | < 500ms | < 500ms | < 500ms | < 500ms |
| Import (1000 rows) | < 10s | — | — | — | — | < 10s | < 10s | < 10s | < 10s |
| Encryption overhead | < 50ms | — | — | — | — | — | < 50ms | < 50ms | < 50ms |
| App lock unlock | < 200ms | — | — | — | — | < 200ms | < 200ms | < 200ms | < 200ms |
| Lighthouse Performance | ≥ 85 | — | — | — | — | — | — | — | ≥ 85 |
| Lighthouse PWA | ≥ 90 | ≥ 90 | ≥ 90 | ≥ 90 | ≥ 90 | ≥ 90 | ≥ 90 | ≥ 90 | ≥ 90 |
| Memory usage | < 150MB | < 120MB | < 130MB | < 130MB | < 140MB | < 140MB | < 145MB | < 145MB | < 150MB |

---

*Document Version: 1.0*
*Created: May 2026*
*Based on: Perancangan_Nyatet_Duwit.md — Section G (V2 Roadmap) + Feature Hierarchy Table (TIER 2, 4)*
*Status: Draft*
