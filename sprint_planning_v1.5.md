# Sprint Planning — NyatetDuwit V1.5

> 3 Sprint (Week 10–13) | Target: Insight & Trust
> Based on: Perancangan_Nyatet_Duwit.md — Section G (V1.5 Roadmap) + Feature Hierarchy Table (TIER 2–4)
> Stack: React + Vite + Dexie.js + Zustand + Tailwind + vite-plugin-pwa

---

## TABLE OF CONTENTS

1. [Sprint Overview](#1-sprint-overview)
2. [Definition of Done](#2-definition-of-done)
3. [Sprint 1: Weekly Summary & Monthly Review](#3-sprint-1-weekly-summary--monthly-review)
4. [Sprint 2: Export & Improved Insights](#4-sprint-2-export--improved-insights)
5. [Sprint 3: Onboarding, Polish & Launch](#5-sprint-3-onboarding-polish--launch)
6. [Risk Register](#6-risk-register)
7. [Dependency Map](#7-dependency-map)
8. [Performance Budget Tracker](#8-performance-budget-tracker)

---

## 1. SPRINT OVERVIEW

| Sprint | Week | Theme | Deliverable | Story Points |
|---|---|---|---|---|
| **Sprint 1** | 10–11 | Weekly Summary & Monthly Review | Weekly summary notification, monthly review screen, "You Saved" highlight | 32 |
| **Sprint 2** | 12 | Export & Improved Insights | Export CSV/PDF, pie chart view, better empty states | 28 |
| **Sprint 3** | 13 | Onboarding, Polish & Launch | Onboarding v2, improved settings, V1.5 QA & launch | 24 |
| **TOTAL** | | | **V1.5 Release** | **84** |

### Velocity Assumption

- 1 developer = ~25–30 story points per sprint (reduced from V1 karena scope lebih kecil)
- Story point scale: 1 (trivial), 2 (simple), 3 (medium), 5 (complex), 8 (very complex), 13 (epic)

---

## 2. DEFINITION OF DOOD

Mengacu ke DoD yang sama dengan `sprint_planning.md` Section 2. Tambahan khusus V1.5:

### DoD — V1.5 Additions

- [ ] All CSV/PDF exports tested with non-ASCII characters (Rp, Indonesian text)
- [ ] Pie chart renders correctly in light AND dark mode
- [ ] Weekly summary notification does not fire if user already recorded today
- [ ] Monthly review loads < 500ms with 12 months of data
- [ ] Onboarding v2 tested on first-time user AND returning user paths

---

## 3. SPRINT 1: WEEKLY SUMMARY & MONTHLY REVIEW

**Week:** 10–11
**Theme:** "User mulai lihat pattern keuangan mereka"
**Story Points:** 32

### Sprint Goal

User mendapat ringkasan mingguan otomatis dan bisa melihat review bulanan yang meaningful. "You Saved This Month" memberikan positive reinforcement.

---

### US-V15-1: Weekly Summary Notification

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Kirim notifikasi setiap akhir minggu (Minggu malam) berisi ringkasan pengeluaran minggu ini. Ini adalah retention feature paling tinggi ROI di V1.5.

**Berdasarkan Perancangan:** R4 (Weekly Summary) — *"Simple notification atau in-app card"*

**Notification Payload:**
```
"Ringkasan Mingguan 📊
Pengeluaran: Rp 450.000
Pemasukan: Rp 2.000.000
Kategori teratas: Makan & Minum (Rp 180.000)"
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V15-1.1 | Create weekly aggregation query (Mon–Sun) | 2 | Code |
| V15-1.2 | Generate weekly summary data (total expense, income, top categories) | 2 | Code |
| V15-1.3 | Format summary message (rich text, Indonesian) | 1 | Code |
| V15-1.4 | Schedule weekly notification (service worker, Sunday 19:00) | 3 | Code |
| V15-1.5 | Implement smart skip (skip if no transactions this week) | 1 | Code |
| V15-1.6 | Implement in-app weekly summary card (dashboard) | 2 | Code |
| V15-1.7 | Add toggle to enable/disable weekly summary in settings | 1 | Code |
| V15-1.8 | Write tests for weekly aggregation | 2 | Testing |
| V15-1.9 | Test notification fires on correct day/time | 1 | Verification |

**Acceptance Criteria:**
- [ ] Weekly summary notification fires every Sunday at 19:00
- [ ] Notification shows total expense, income, top 3 categories
- [ ] Notification is skippable (no notification if 0 transactions this week)
- [ ] In-app card shows same data on dashboard (last 7 days)
- [ ] Toggle in settings works
- [ ] Tapping notification opens dashboard
- [ ] Format: Indonesian Rupiah, Indonesian category names

**Dependencies:** US-2.2 (transaction repository), US-7.3 (notification system)
**Risks:** Notification timing accuracy in service worker. Mitigation: use registration.showNotification with tag to prevent duplicates.

---

### US-V15-2: Monthly Review Screen

**Priority:** P0
**Story Points:** 10
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Halaman review bulanan yang lebih kaya dari monthly overview V1. Menampilkan perbandingan dengan bulan sebelumnya, highlight, dan insight otomatis.

**Berdasarkan Perancangan:** R5 (Monthly Review) — *"1 screen summary, trend arrow"*

**Layout:**
```
┌────────────────────────────────────┐
│ ← Review Bulanan                   │
│                                    │
│  [◀ Mei 2026 ▶]                    │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Total Pengeluaran            │  │
│  │  Rp 5.550.000                 │  │
│  │  ▼ 15% dari bulan lalu        │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Total Pemasukan              │  │
│  │  Rp 8.000.000                 │  │
│  │  ▲ 5% dari bulan lalu         │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  💰 Sisa: Rp 2.450.000       │  │
│  │  🎯 Kamu hemat Rp 200.000    │  │
│  │     dari bulan lalu!          │  │
│  └──────────────────────────────┘  │
│                                    │
│  Rata-rata harian: Rp 185.000      │
│  Hari termahal: 15 Mei (Rp 350K)  │
│  Total transaksi: 45               │
│  Streak: 🔥 15 hari                │
│                                    │
│  Perbandingan Kategori             │
│  ├── Makan  Rp 1.2M   ▲ 10%       │
│  ├── Belanja Rp 800K  ▼ 5%        │
│  └── Transport Rp 500K = 0%       │
│                                    │
│  [Bagikan Ringkasan]               │
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V15-2.1 | Create MonthlyReview page | 2 | Code |
| V15-2.2 | Implement month selector (prev/next) | 1 | Code |
| V15-2.3 | Calculate month-over-month comparison (expense, income, net) | 2 | Code |
| V15-2.4 | Implement "You Saved This Month" calculation | 2 | Code |
| V15-2.5 | Calculate daily average, highest day, transaction count | 2 | Code |
| V15-2.6 | Implement category comparison (this month vs last month) | 2 | Code |
| V15-2.7 | Calculate streak display for the month | 1 | Code |
| V15-2.8 | Implement share summary (export as text/image) | 2 | Code |
| V15-2.9 | Write tests for all calculations | 3 | Testing |
| V15-2.10 | Test with 12+ months of data (performance) | 1 | Verification |

**Acceptance Criteria:**
- [ ] Month selector works, with current month highlighted
- [ ] Total expense and income displayed with month-over-month % change
- [ ] "You Saved" shows positive difference: "Kamu hemat Rp X dari bulan lalu!"
- [ ] If spending increased: "Pengeluaran naik Rp X dari bulan lalu"
- [ ] Daily average spending calculated correctly
- [ ] Highest spending day identified with date and amount
- [ ] Category comparison shows trend (▲/▼/=) per category
- [ ] Streak for the month displayed
- [ ] Share button generates readable summary text
- [ ] Empty state if no data for selected month
- [ ] Loads in < 500ms with 12 months of data

**Dependencies:** US-2.2, US-3.1, US-6.1
**Risks:** Performance with large datasets. Mitigation: aggregate queries at IndexedDB level.

---

### US-V15-3: "You Saved This Month" Highlight

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Positive reinforcement: hitung selisih income - expense, bandingkan dengan bulan lalu, tampilkan dengan visual yang delightful.

**Berdasarkan Perancangan:** R8 ("You Saved This Month") — *"Positive reinforcement"*

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V15-3.1 | Calculate "saved" = income - expense for current month | 1 | Code |
| V15-3.2 | Compare with previous month | 1 | Code |
| V15-3.3 | Create highlight card component (green for saving, red for overspend) | 2 | Code |
| V15-3.4 | Display on dashboard + monthly review | 1 | Code |
| V15-3.5 | Add subtle animation (coin/confetti effect on positive) | 2 | Code |
| V15-3.6 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] "Saved" calculated as income - expense for current month
- [ ] Month-over-month comparison displayed
- [ ] Green card with ▲ icon if saving more than last month
- [ ] Red card with ▼ icon if saving less
- [ ] Displayed on dashboard (below balance) and monthly review
- [ ] Subtle celebration animation on positive (non-intrusive)
- [ ] Empty state if only 1 month of data

**Dependencies:** US-V15-2, US-3.1
**Risks:** Celebration animation might feel gimmicky. Mitigation: subtle, opt-in via settings.

---

### US-V15-4: Weekly Summary In-App Card

**Priority:** P1
**Story Points:** 4
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Card di dashboard yang menampilkan ringkasan minggu ini (bisa dilihat kapan saja, tidak hanya via notifikasi).

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V15-4.1 | Create WeeklySummaryCard component | 1 | Code |
| V15-4.2 | Calculate current week totals (Mon–Sun) | 1 | Code |
| V15-4.3 | Show expense trend vs last week | 1 | Code |
| V15-4.4 | Add tap to open full monthly review | 0.5 | Code |
| V15-4.5 | Write tests | 0.5 | Testing |

**Acceptance Criteria:**
- [ ] Card visible on dashboard below recent transactions
- [ ] Shows total expense this week
- [ ] Shows comparison with last week (▲/▼)
- [ ] Shows top category this week
- [ ] Tap opens monthly review page
- [ ] Auto-updates when new transaction added

**Dependencies:** US-V15-1, US-3.1
**Risks:** None significant.

---

### Sprint 1 Deliverables Checklist

- [ ] Weekly summary notification (US-V15-1)
- [ ] Monthly review screen with comparisons (US-V15-2)
- [ ] "You Saved This Month" highlight (US-V15-3)
- [ ] Weekly summary in-app card (US-V15-4)
- [ ] All tests pass
- [ ] Notification fires correctly on Sunday 19:00
- [ ] Monthly review loads < 500ms
- [ ] All calculations accurate

---

## 4. SPRINT 2: EXPORT & IMPROVED INSIGHTS

**Week:** 12
**Theme:** "User bisa export data dan lihat insight lebih visual"
**Story Points:** 28

### Sprint Goal

User bisa export data ke CSV/PDF. Category breakdown punya opsi pie chart. Empty states lebih informatif.

---

### US-V15-5: Export CSV/PDF

**Priority:** P0
**Story Points:** 10
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
User bisa export transaksi ke file CSV (spreadsheet) atau PDF untuk keperluan rekapitulasi.

**Berdasarkan Perancangan:** P4 (Export CSV/PDF) — *"1 tap export, date range selector"*

**UX Flow:**
```
More → Export Data
  → Select format: [CSV] [PDF]
  → Select date range: [Bulan Ini] [3 Bulan] [Custom]
  → Select accounts (optional, default all)
  → [Export]
  → File downloaded
```

**CSV Format:**
```csv
Tanggal,Tipe,Kategori,Akun,Jumlah,Catatan
19/05/2026,Pengeluaran,Makan & Minum,Cash,-25000,Makan siang
19/05/2026,Pemasukan,Gaji,BCA,8000000,Gaji bulan Mei
```

**PDF Format:**
```
┌─────────────────────────────────┐
│  Laporan Keuangan               │
│  Mei 2026                       │
│                                 │
│  Ringkasan:                     │
│  Pemasukan:   Rp 8.000.000      │
│  Pengeluaran: Rp 5.550.000      │
│  Sisa:        Rp 2.450.000      │
│                                 │
│  Transaksi (45):                │
│  19/05  Makan Siang     -25.000 │
│  19/05  Gaji         +8.000.000 │
│  ...                             │
└─────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V15-5.1 | Create ExportPage with format selector | 1 | Code |
| V15-5.2 | Implement date range selector (presets + custom) | 1 | Code |
| V15-5.3 | Implement CSV generation (header + rows, Indonesian locale) | 3 | Code |
| V15-5.4 | Implement PDF generation (simple layout, no heavy lib) | 3 | Code |
| V15-5.5 | Implement file download (Blob + anchor) | 1 | Code |
| V15-5.6 | Add summary section (totals, counts) in both formats | 1 | Code |
| V15-5.7 | Handle large datasets (pagination in export) | 2 | Code |
| V15-5.8 | Write tests for CSV/PDF generation | 2 | Testing |
| V15-5.9 | Test with non-ASCII characters (Rp, é, Indonesian text) | 1 | Verification |

**Acceptance Criteria:**
- [ ] CSV exports with correct columns and formatting
- [ ] PDF exports with readable layout
- [ ] Date range filter works (only exports transactions in range)
- [ ] Account filter works
- [ ] CSV opens correctly in Google Sheets and Excel
- [ ] PDF opens correctly in any PDF viewer
- [ ] Indonesian characters display correctly (Rp, bulan, etc.)
- [ ] Large dataset (1000+ transactions) exports < 5 seconds
- [ ] File named: "NyatetDuwit_Laporan_Mei2026.csv"
- [ ] Summary included in both formats

**Dependencies:** US-2.2
**Risks:** PDF generation library can bloat bundle. Mitigation: use simple HTML-to-PDF or custom canvas render, not heavy libs like jsPDF with extra fonts.

---

### US-V15-6: Category Breakdown — Pie Chart Option

**Priority:** P1
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Tambahkan opsi pie chart untuk category breakdown. User bisa toggle antara bar chart dan pie chart.

**Berdasarkan Perancangan:** "Improved category breakdown (pie chart option)" — Section G V1.5

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V15-6.1 | Create PieChart component (custom SVG) | 3 | Code |
| V15-6.2 | Implement arc segments with category colors | 2 | Code |
| V15-6.3 | Implement percentage labels on segments | 1 | Code |
| V15-6.4 | Implement legend (category name + amount + %) | 1 | Code |
| V15-6.5 | Add toggle button (bar/pie chart switch) | 1 | Code |
| V15-6.6 | Animate chart transition (bar → pie, smooth) | 1 | Code |
| V15-6.7 | Implement "Other" grouping (categories < 5% grouped) | 1 | Code |
| V15-6.8 | Test on 320px width | 1 | Verification |

**Acceptance Criteria:**
- [ ] Pie chart renders correctly with category segments
- [ ] Segment colors match category colors
- [ ] Percentage labels visible on segments
- [ ] Legend below chart with category name, amount, percentage
- [ ] Toggle switches between bar and pie chart smoothly
- [ ] "Other" group for small categories (< 5%)
- [ ] Works in dark mode
- [ ] Works on 320px width (responsive)
- [ ] No external chart library (custom SVG)
- [ ] Render time < 200ms with 20 categories

**Dependencies:** US-6.2 (existing bar chart)
**Risks:** SVG pie chart performance with many segments. Mitigation: group small categories into "Other".

---

### US-V15-7: Better Empty States

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Tingkatkan empty states berdasarkan data usage. Empty states yang lebih kontekstual dan actionable.

**Berdasarkan Perancangan:** "Better empty states" — Section G V1.5

**Empty State Improvements:**

| Page | V1 Empty State | V1.5 Improvement |
|---|---|---|
| Dashboard | "Belum ada transaksi" | "Mulai catat pengeluaran pertama kamu" + quick tutorial overlay |
| Transactions | "Belum ada transaksi" | "Tap + untuk mencatat" + animated GIF/screenshot |
| Insights | "Belum ada data" | "Butuh minimal 7 hari data untuk insight" + streak reminder |
| Budget | "Belum ada budget" | "Atur budget untuk kontrol pengeluaran" + example |
| Search | "Tidak ditemukan" | Suggestions based on partial match |

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V15-7.1 | Redesign EmptyState component to support contextual messages | 1 | Code |
| V15-7.2 | Add contextual empty states for each page | 2 | Code |
| V15-7.3 | Add quick tutorial overlay (first-time user, 3 steps) | 2 | Code |
| V15-7.4 | Add streak reminder in empty insights | 1 | Code |
| V15-7.5 | Update illustrations (SVG, lightweight) | 1 | Design |
| V15-7.6 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] Each page has contextual empty state (not generic)
- [ ] Empty state includes CTA button (tambah transaksi, atur budget, etc.)
- [ ] First-time user sees 3-step tutorial overlay on first visit
- [ ] Tutorial is skippable
- [ ] Empty insights shows "Data terkumpul: X hari — butuh 7 hari untuk insight"
- [ ] Illustrations are lightweight SVG (< 5KB each)
- [ ] Works in dark mode

**Dependencies:** US-3.5 (V1 empty states)
**Risks:** Tutorial overlay might annoy returning users. Mitigation: only show on first visit.

---

### US-V15-8: Insight Sharing

**Priority:** P2
**Story Points:** 3
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
User bisa membagikan ringkasan bulanan sebagai gambar atau teks ke WhatsApp.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V15-8.1 | Generate shareable text summary | 1 | Code |
| V15-8.2 | Implement share via Web Share API | 1 | Code |
| V15-8.3 | Add fallback (copy to clipboard) | 0.5 | Code |
| V15-8.4 | Write tests | 0.5 | Testing |

**Acceptance Criteria:**
- [ ] Share button generates readable text summary
- [ ] Web Share API works on Android Chrome
- [ ] Fallback copies to clipboard with toast confirmation
- [ ] Summary includes: month, total expense, income, top category, streak

**Dependencies:** US-V15-2
**Risks:** Web Share API not supported on all browsers. Mitigation: clipboard fallback.

---

### Sprint 2 Deliverables Checklist

- [ ] Export CSV/PDF with date range filter (US-V15-5)
- [ ] Pie chart option for category breakdown (US-V15-6)
- [ ] Better contextual empty states (US-V15-7)
- [ ] Insight sharing (US-V15-8)
- [ ] All tests pass
- [ ] CSV opens correctly in Excel/Google Sheets
- [ ] Pie chart renders correctly in light + dark mode
- [ ] Empty states feel helpful, not generic

---

## 5. SPRINT 3: ONBOARDING, POLISH & LAUNCH

**Week:** 13
**Theme:** "First-time user experience yang mulus, polish, launch"
**Story Points:** 24

### Sprint Goal

Onboarding v2 yang lebih baik berdasarkan data V1. Setting improvements. QA dan launch V1.5.

---

### US-V15-9: Onboarding v2

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Perbaiki onboarding berdasarkan data V1. Tambahkan setup wizard yang lebih interaktif.

**Berdasarkan Perancangan:** "Onboarding improvements based on data" — Section G V1.5

**Onboarding Flow v2:**
```
Screen 1: "Catat keuangan dalam 3 detik"
         → Show app screenshot with FAB highlighted
         → "Tap + → ketik jumlah → pilih kategori → selesai"

Screen 2: "Data tetap di HP kamu"
         → "Tidak perlu login. Tidak ada yang lihat data kamu."
         → Privacy illustration

Screen 3: "Bisa dipakai offline"
         → "Di angkot, di basement, di gunung — tetep bisa nyatet"

Screen 4: Setup Cepat (NEW in V1.5)
         → Pilih akun awal (default: Cash)
         → Pilih kategori yang relevan (toggle defaults)
         → Set reminder time
         → [Mulai Mencatat]
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V15-9.1 | Redesign onboarding screens (4 screens + setup) | 2 | Design |
| V15-9.2 | Create OnboardingPage component with swipe | 2 | Code |
| V15-9.3 | Implement quick setup wizard (account, categories, reminder) | 2 | Code |
| V15-9.4 | Implement skip option (minimal onboarding, 1 screen) | 1 | Code |
| V15-9.5 | Track onboarding completion in settings | 1 | Code |
| V15-9.6 | A/B test readiness: track which onboarding path users take | 1 | Code |
| V15-9.7 | Write tests for onboarding flow | 1 | Testing |

**Acceptance Criteria:**
- [ ] 4 onboarding screens with swipe navigation
- [ ] Setup wizard lets user configure: default account, categories, reminder
- [ ] Skip button available on first screen
- [ ] Onboarding only shows once (tracked in settings)
- [ ] Setup wizard data pre-populates database
- [ ] All screens work on 320px width
- [ ] Accessible (screen reader, keyboard nav)
- [ ] Onboarding complete in < 30 seconds (measured)

**Dependencies:** US-1.4, US-1.3
**Risks:** Onboarding might feel too long. Mitigation: skip option always visible.

---

### US-V15-10: Settings Improvements

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Tambahkan pengaturan baru yang diminta user: preferred language, number format, notification preferences detail.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V15-10.1 | Add language selector (Indonesia/English) | 2 | Code |
| V15-10.2 | Add number format setting (IDR with/without decimals) | 1 | Code |
| V15-10.3 | Add notification preferences (weekly summary on/off) | 1 | Code |
| V15-10.4 | Add app info section (version, licenses, credits) | 1 | Code |
| V15-10.5 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] Language setting switches between Indonesia/English
- [ ] Number format setting works (Rp 15.000 vs Rp 15.000,00)
- [ ] Weekly summary toggle in notifications section
- [ ] App version shown
- [ ] Open source licenses listed
- [ ] Settings persist across sessions

**Dependencies:** US-8.3 (V1 settings page)
**Risks:** i18n infrastructure needed for language switch. Mitigation: start with simple key-value translation object, not heavy i18n library.

---

### US-V15-11: V1.5 QA & Bug Fixes

**Priority:** P0
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Quality assurance untuk semua fitur V1.5.

**Test Plan:**

| Feature | Test Method | Pass Criteria |
|---|---|---|
| Weekly summary notification | Manual | Fires Sunday 19:00, correct data |
| Monthly review | Manual | All calculations correct |
| Export CSV | Manual | Opens in Excel, correct data |
| Export PDF | Manual | Opens in PDF viewer |
| Pie chart | Manual | Renders, toggle works |
| Empty states | Manual | Contextual per page |
| Onboarding v2 | Manual | Shows once, setup works |
| Settings v2 | Manual | All toggles work |
| Regression: all V1 features | Automated + Manual | No breaking changes |

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V15-11.1 | Run full regression test on V1 features | 2 | Testing |
| V15-11.2 | Fix all P0 bugs | 1 | Code |
| V15-11.3 | Fix all P1 bugs | 1 | Code |
| V15-11.4 | Lighthouse audit (Performance, Accessibility, PWA) | 1 | Verification |
| V15-11.5 | Bundle size check | 1 | Verification |

**Acceptance Criteria:**
- [ ] All V1 features still work (no regression)
- [ ] Zero P0 bugs
- [ ] Zero P1 bugs
- [ ] Lighthouse: Performance ≥ 90, PWA ≥ 90
- [ ] Bundle size < 250KB gzipped (V1 was < 200KB, V1.5 additions may add ~50KB)

**Dependencies:** All V1.5 features, all V1 features
**Risks:** Regression on V1 features. Mitigation: automated test suite before release.

---

### US-V15-12: V1.5 Release & Documentation

**Priority:** P1
**Story Points:** 4
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Release V1.5. Update documentation, changelog, dan APK.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| V15-12.1 | Update CHANGELOG.md with V1.5 entries | 1 | Documentation |
| V15-12.2 | Update landing page (new features highlight) | 1 | Code |
| V15-12.3 | Build new APK (TWA) | 1 | Build |
| V15-12.4 | Upload APK to GitHub Releases | 0.5 | Setup |
| V15-12.5 | Update version.json (for in-app update checker) | 0.5 | Config |

**Acceptance Criteria:**
- [ ] CHANGELOG updated
- [ ] Landing page updated with V1.5 features
- [ ] New APK built and signed
- [ ] APK uploaded to GitHub Releases
- [ ] version.json updated
- [ ] In-app update checker detects V1.5 from V1

**Dependencies:** US-V15-11
**Risks:** None significant.

---

### Sprint 3 Deliverables Checklist

- [ ] Onboarding v2 with setup wizard (US-V15-9)
- [ ] Settings improvements (US-V15-10)
- [ ] QA & bug fixes (US-V15-11)
- [ ] Release & documentation (US-V15-12)
- [ ] All tests pass
- [ ] Zero P0/P1 bugs
- [ ] Lighthouse scores ≥ 90
- [ ] Bundle size < 250KB gzipped
- [ ] APK built and released
- [ ] CHANGELOG updated

---

## 6. RISK REGISTER

| # | Risk | Impact | Probability | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | PDF generation increases bundle size significantly | High | Medium | Use lightweight approach (HTML table print or simple canvas) | Dev |
| R2 | Weekly summary notification not firing on some devices | Medium | Medium | Test on multiple devices, provide in-app card as fallback | Dev |
| R3 | Onboarding v2 feels too long, users skip entirely | Medium | Medium | A/B test onboarding length, always show skip button | PM |
| R4 | Pie chart performance with many categories | Low | Low | Group small categories into "Other" | Dev |
| R5 | Regression on V1 features from new code | High | Medium | Comprehensive automated regression tests | Dev |
| R6 | CSV encoding issues with Indonesian characters | Medium | Low | Test with specific characters, use UTF-8 BOM | Dev |

---

## 7. DEPENDENCY MAP

```
Sprint 1 (V1.5): Weekly Summary & Monthly Review
├── US-V15-1 Weekly Summary Notification
│   ├── depends on: US-2.2, US-7.3
│   └── US-V15-4 Weekly Summary Card
├── US-V15-2 Monthly Review Screen
│   ├── depends on: US-2.2, US-3.1, US-6.1
│   └── US-V15-3 "You Saved" Highlight
├── US-V15-3 "You Saved This Month"
│   └── depends on: US-V15-2, US-3.1
└── US-V15-4 Weekly Summary Card
    └── depends on: US-V15-1, US-3.1

Sprint 2 (V1.5): Export & Improved Insights
├── US-V15-5 Export CSV/PDF
│   └── depends on: US-2.2
├── US-V15-6 Pie Chart Option
│   └── depends on: US-6.2
├── US-V15-7 Better Empty States
│   └── depends on: US-3.5
└── US-V15-8 Insight Sharing
    └── depends on: US-V15-2

Sprint 3 (V1.5): Onboarding, Polish & Launch
├── US-V15-9 Onboarding v2
│   ├── depends on: US-1.4, US-1.3
├── US-V15-10 Settings Improvements
│   └── depends on: US-8.3
├── US-V15-11 QA & Bug Fixes
│   └── depends on: ALL V1.5 features
└── US-V15-12 Release & Documentation
    └── depends on: US-V15-11
```

---

## 8. PERFORMANCE BUDGET TRACKER

| Metric | Target | Sprint 1 | Sprint 2 | Sprint 3 |
|---|---|---|---|---|
| Bundle (gzipped) | < 250KB | < 210KB | < 230KB | < 250KB |
| APK size | < 12MB | < 10MB | < 10MB | < 12MB |
| Monthly review render | < 500ms | < 500ms | < 500ms | < 500ms |
| Pie chart render | < 200ms | — | < 200ms | < 200ms |
| CSV export (1000 tx) | < 5s | — | < 5s | < 5s |
| Onboarding load | < 1s | — | — | < 1s |
| Lighthouse Performance | ≥ 90 | ≥ 90 | ≥ 90 | ≥ 90 |
| Lighthouse PWA | ≥ 90 | ≥ 90 | ≥ 90 | ≥ 90 |
| Memory usage | < 120MB | < 100MB | < 110MB | < 120MB |

---

*Document Version: 1.0*
*Created: May 2026*
*Based on: Perancangan_Nyatet_Duwit.md — Section G (V1.5 Roadmap)*
*Status: Draft*
