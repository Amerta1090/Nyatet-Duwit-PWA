# Perancangan NyatetDuwit

> Personal Finance PWA untuk User Indonesia
> "Tempat semua uang pribadi dicatat, dipahami, dan dikontrol dengan cepat."

---

## A. PRODUCT VISION

### The One-Liner

NyatetDuwit adalah aplikasi pencatatan keuangan personal yang **cepat, private, offline-first**, dan **dirasakan seperti native app** meskipun berjalan di browser. Target: Gen Z & pekerja muda Indonesia yang transaksinya campur aduk (cash, QRIS, e-wallet, transfer) dan butuh cara simpel buat ngerti kemana uang mereka pergi.

### What NyatetDuwit IS

- **Single-user personal finance tracker**
- **Local-first, offline-first PWA**
- **Mobile-first, touch-first, Android-optimized**
- **Privacy-first: data user tetap di device mereka**
- **Ultra-fast: add transaction < 3 detik**
- **Minimal friction: buka → catat → tutup**

### What NyatetDuwit is NOT

- Bukan aplikasi akuntansi
- Bukan aplikasi bisnis / UMKM
- Bukan shared finance / keluarga
- Bukan investment tracker
- Bukan ERP
- Bukan social finance
- Bukan AI-powered gimmick app

### North Star Metric

**Daily Active Recording (DAR)** — jumlah user yang mencatat minimal 1 transaksi per hari.

Kenapa bukan DAU? Karena DAU bisa tinggi tapi user cuma buka liat-liat tanpa nilai. Yang bikin app finance berguna adalah **konsistensi pencatatan**. Kalau user rajin nyatet, insight ngalir sendiri.

### Secondary Metrics

| Metric | Why It Matters |
|---|---|
| Time-to-record | Kalau > 5 detik, user males. Target: < 3 detik |
| 7-day recording streak | Habit formation indicator |
| % days with ≥ 1 transaction | Retention proxy |
| Transaction completeness (filled fields) | Data quality |
| Return rate Day-1 → Day-7 | Early retention signal |

### Competitive Positioning

| App | Strength | Weakness | NyatetDuwit Edge |
|---|---|---|---|
| Money Lover | Feature lengkap | Berat, banyak ads, UI crowded | Ringan, private, offline |
| Wallet by BudgetBakers | Bank sync (EU) | Mahal, bank sync useless di Indonesia | Local-first, no dependency |
| YNAB | Budgeting philosophy | Overwhelming, mahal, US-centric | Simpler, Indonesia context |
| Copilot Money | Beautiful UI, AI | iOS only, subscription mahal | Android PWA, free-first |
| Monarch Money | Good UX | Subscription only, US banks | Free core, local data |
| Spendee | Visual nice | Limited free tier | Generous free, offline |
| Google Sheets | Flexible, free | Manual, no structure, mobile UX buruk | Structured + mobile optimized |

**Positioning gap yang NyatetDuwit isi:**
Tidak ada app finance yang benar-benar **ringan, offline-first, private, dan Android-first** untuk market Indonesia. Semua app要么 berat, 要么 butuh internet, 要么 subscription, 要么 iOS-only.

---

## B. PRODUCT PHILOSOPHY

### 10 Prinsip Produk NyatetDuwit

#### 1. Speed is a Feature

Kalau app finance butuh > 3 detik buat nyatet kopi 15rb, user akan stop nyatet. Setiap millisecond delay = friction = drop-off.

**Tradeoff:** Lebih baik fitur kurang tapi cepat, daripada fitur lengkap tapi lambat.

#### 2. Offline is Default, Online is Bonus

Internet di Indonesia tidak stabil. User harus bisa nyatet di angkot, di basement, di daerah sinyal jelek. Data sync nanti kalau ada koneksi.

**Tradeoff:** Local-first berarti conflict resolution nanti kompleks. Tapi worth it untuk UX.

#### 3. Privacy is Not a Feature, It's a Foundation

Data keuangan adalah data paling sensitif. User tidak perlu trust server kita kalau datanya tidak pernah离开 device mereka.

**Tradeoff:** Tidak ada cloud = tidak ada cross-device sync di V1. Accept this.

#### 4. Less is More, But "Less" Must Be Perfect

Lebih baik 5 fitur yang bekerja sempurna daripada 50 fitur yang setengah-setengah.

**Tradeoff:** User akan request feature. 90% harus ditolak atau di-push ke future.

#### 5. Every Tap Costs Attention

Setiap tap, setiap screen transition, setiap form field adalah cognitive load. Minimalkan semua.

**Tradeoff:** Smart defaults > asking user every time.

#### 6. Friction Kills Habit

Habit terbentuk dari repetition. Repetition terbentuk dari low friction. High friction = habit never forms = app abandoned.

**Tradeoff:** Quick add dengan 1-2 field > full form dengan 10 field.

#### 7. Data Entry is the Hardest Part

Insight, chart, budget — semua gampang. Yang susah adalah membuat user **rajin input data**. Fokus 80% effort di sini.

#### 8. Make It Feel Native, Not Web

User tidak peduli ini PWA. Mereka peduli apakah rasanya seperti app. Bottom nav, gesture, instant response, smooth animation — semua wajib.

#### 9. Good Enough > Perfect

V1 tidak perlu sempurna. V1 perlu **usable enough that people actually use it daily**. Polish comes after adoption.

#### 10. Say No Aggressively

Setiap "ya" ke satu fitur = "tidak" ke 3 fitur lain. Scope creep adalah pembunuh #1 app indie.

---

### Why Finance Apps Fail (Post-Mortem Analysis)

| Penyebab | Contoh | Pelajaran |
|---|---|---|
| Terlalu banyak fitur di awal | Banyak app finance yang jadi accounting software | Start narrow, expand later |
| Friction input terlalu tinggi | Form 10+ field untuk 1 transaksi | Quick add is mandatory |
| Tidak ada habit loop | User buka sekali, tidak pernah balik | Streak, reminder, nudges |
| Internet dependency | App tidak bisa dipakai offline | Offline-first atau mati |
| Subscription too early | Paywall sebelum user merasakan value | Free core, premium later |
| UI terlalu kompleks | Chart di mana-mana, info overload | Simple first, progressive disclosure |
| Tidak ada "aha moment" | User tidak lihat value dalam 3 hari | Insight harus muncul cepat |
| Battery/resource hog | App berat di HP low-end | Performance is non-negotiable |

---

## C. FEATURE HIERARCHY TABLE

### TIER 1: FOUNDATION

> Fitur minimum supaya app layak dipakai. Tanpa ini, app tidak ada gunanya.

| # | Fitur | Masalah yang Diselesaikan | User Value | UX Expectation | Retention Impact | Daily Usage Impact | Trust Impact | Kompleksitas | PWA Complexity | Worth it V1? |
|---|---|---|---|---|---|---|---|---|---|---|
| F1 | **Quick Add Transaction** | User malas buka app lama-lama | Catat transaksi dalam < 3 detik | 1-2 tap → form minimal → done | CRITICAL | CRITICAL | HIGH | Medium | IndexedDB write, optimistic UI | **YES. Non-negotiable.** |
| F2 | **Transaction List** | User perlu lihat history | Lihat semua transaksi, scrollable | Virtualized list, smooth 60fps | HIGH | HIGH | MEDIUM | Low | Pagination/virtualization | **YES. Non-negotiable.** |
| F3 | **Category System** | Transaksi tanpa kategori tidak bisa dianalisis | Group transaksi, basic insight | 8-12 default categories, custom add | HIGH | MEDIUM | MEDIUM | Low | Local storage | **YES. Non-negotiable.** |
| F4 | **Account Management** | User punya banyak sumber uang (cash, BCA, GoPay) | Track balance per sumber | Add/edit account, realtime balance | HIGH | MEDIUM | HIGH | Medium | Multi-account balance calc | **YES. Non-negotiable.** |
| F5 | **Income & Expense Type** | Uang masuk vs keluar harus beda | Pahami cashflow | Toggle income/expense di form | HIGH | HIGH | MEDIUM | Low | Simple enum | **YES. Non-negotiable.** |
| F6 | **Date Picker (Smart)** | Transaksi tidak selalu dicatat real-time | Input transaksi kemarin/lusa | Default today, swipe to change date | MEDIUM | MEDIUM | MEDIUM | Low | Date library | **YES. Non-negotiable.** |
| F7 | **Dashboard / Home** | User buka app perlu lihat ringkasan | Saldo total, spending hari ini, quick action | 1 screen, < 200ms render | HIGH | HIGH | MEDIUM | Medium | Cached data display | **YES. Non-negotiable.** |
| F8 | **PWA Installability** | User perlu install di home screen | Buka seperti native app | Add to home screen prompt, splash, icon | HIGH | HIGH | HIGH | Medium | Service worker, manifest, icons | **YES. Non-negotiable.** |
| F9 | **Offline Storage** | Internet tidak stabil | App works tanpa internet | Transparent, user tidak perlu tahu | CRITICAL | CRITICAL | HIGH | High | IndexedDB, Dexie.js recommended | **YES. Non-negotiable.** |
| F10 | **Basic Search** | Transaksi banyak, susah cari | Cari by nama/kategori/amount | Search bar, instant filter | MEDIUM | MEDIUM | MEDIUM | Low-Medium | IndexedDB query | **YES. Simple implementation.** |

### TIER 2: CORE FINANCE

> Fitur inti yang membuat hidup finansial user lebih rapi. Ini yang membedakan dari catatan di notes app.

| # | Fitur | Masalah yang Diselesaikan | User Value | UX Expectation | Retention Impact | Daily Usage Impact | Trust Impact | Kompleksitas | PWA Complexity | Worth it V1? |
|---|---|---|---|---|---|---|---|---|---|---|
| C1 | **Transfer Antar Akun** | User pindah uang (BCA → GoPay) tapi bukan expense | Balance tetap akurat | Select from → to → amount | HIGH | MEDIUM | HIGH | Medium | Double-entry logic | **YES. Critical untuk accuracy.** |
| C2 | **Monthly Overview** | User perlu lihat big picture | Total income, expense, net bulan ini | Simple card, 1 screen | HIGH | LOW | HIGH | Low | Aggregate query | **YES. High leverage.** |
| C3 | **Category Breakdown** | User tidak tahu uang habis buat apa | Lihat spending per kategori | Bar chart / list, sorted by amount | HIGH | LOW | HIGH | Low-Medium | Chart lib (lightweight) | **YES. "Aha moment" feature.** |
| C4 | **Budget per Category** | User kebobolan di kategori tertentu | Set limit, dapat warning | Simple slider/number input, progress bar | HIGH | MEDIUM | HIGH | Medium | Budget tracking logic | **YES. Core differentiator.** |
| C5 | **Recurring Transaction** | User punya pengeluaran rutin (kost, langganan) | Tidak perlu input manual setiap bulan | Set pattern → auto-generated | MEDIUM | LOW | HIGH | Medium | Cron-like scheduler local | **YES for V1. Saves user time.** |
| C6 | **Notes per Transaction** | "Ini buat apa ya?" | Context untuk transaksi | Optional text field di form | LOW | LOW | MEDIUM | Low | Extra field | **YES. Low cost, useful.** |
| C7 | **Edit & Delete Transaction** | User salah input | Koreksi data | Swipe/edit, confirm delete | MEDIUM | MEDIUM | HIGH | Low | CRUD operations | **YES. Non-negotiable.** |
| C8 | **Multi-Currency (IDR Primary)** | User kadang transaksi foreign currency | Track USD/SGD dll | Optional currency field, fixed rate | LOW | LOW | MEDIUM | Medium | Currency table | **NO for V1. Niche.** |
| C9 | **Tag System** | Kategori tidak cukup granular | Cross-category grouping | Add tags, filter by tag | MEDIUM | LOW | LOW | Low-Medium | Many-to-many relation | **V2. Nice to have.** |

### TIER 3: RETENTION & HABIT

> Fitur yang membuat user tetap mencatat. Ini yang menentukan apakah app dipakai 1 bulan atau 1 tahun.

| # | Fitur | Masalah yang Diselesaikan | User Value | UX Expectation | Retention Impact | Daily Usage Impact | Trust Impact | Kompleksitas | PWA Complexity | Worth it V1? |
|---|---|---|---|---|---|---|---|---|---|---|
| R1 | **Daily Reminder Notification** | User lupa nyatet | Nudge untuk catat | Push notification, configurable time | CRITICAL | HIGH | MEDIUM | Low | Web Push API, service worker | **YES. Highest ROI retention feature.** |
| R2 | **Recording Streak** | User tidak merasa progress | Gamification ringan | Streak counter, fire icon, simple | HIGH | HIGH | LOW | Low | Local counter, date check | **YES. Proven habit builder.** |
| R3 | **Quick Add Widget (PWA)** | User malas buka app | Add dari home screen | PWA shortcut / widget if supported | HIGH | HIGH | LOW | Medium | PWA shortcuts API | **YES if platform supports.** |
| R4 | **Weekly Summary** | User tidak review spending | Lihat pattern mingguan | Simple notification atau in-app card | MEDIUM | LOW | HIGH | Low-Medium | Weekly aggregation | **V1.5. Good for retention.** |
| R5 | **Monthly Review** | User tidak reflect | Lihat bulan lalu, compare | 1 screen summary, trend arrow | MEDIUM | LOW | HIGH | Low | Month comparison | **V1.5. Insight driver.** |
| R6 | **Spending Anomaly Alert** | User tidak sadar overspend | "Spending kamu 2x biasa hari ini" | Passive notification, not intrusive | MEDIUM | LOW | HIGH | Medium | Statistical baseline | **V2. Complex but valuable.** |
| R7 | **Milestone Celebration** | User tidak merasa achievement | "100 transaksi tercatat!" | Subtle toast/badge, not annoying | LOW | LOW | LOW | Low | Counter + trigger | **V2. Low priority.** |
| R8 | **"You Saved This Month"** | User tidak tahu mereka hemat | Positive reinforcement | Highlight di monthly review | MEDIUM | LOW | HIGH | Low | Income - expense calc | **V1.5. High emotional value.** |

### TIER 4: PREMIUM / WORLD-CLASS

> Fitur yang membuat app terasa beda kelas. Bukan gimmick — benar-benar useful.

| # | Fitur | Masalah yang Diselesaikan | User Value | UX Expectation | Retention Impact | Daily Usage Impact | Trust Impact | Kompleksitas | PWA Complexity | Worth it V1? |
|---|---|---|---|---|---|---|---|---|---|---|
| P1 | **Emergency Fund Tracker** | User tidak tahu emergency fund cukup atau belum | Progress bar menuju target | Set target (3x expense), track progress | HIGH | LOW | HIGH | Low | Simple calculation | **V2. High value, low complexity.** |
| P2 | **Savings Goal** | User punya target (liburan, gadget) | Track progress per goal | Multiple goals, progress %, estimated date | HIGH | MEDIUM | HIGH | Medium | Goal tracking logic | **V2. Strong retention driver.** |
| P3 | **Debt/Piutang Tracker** | User lupa siapa utang berapa | Track utang & piutang | Simple list, reminder, partial payment | MEDIUM | LOW | HIGH | Medium | Debt ledger | **V2. Useful but not daily.** |
| P4 | **Export CSV/PDF** | User perlu data untuk keperluan lain | Backup, share, analisis di spreadsheet | 1 tap export, date range selector | LOW | LOW | HIGH | Low | Data serialization | **V1.5. Low effort, high trust.** |
| P5 | **Import CSV** | User pindah dari app lain / Google Sheets | Migrasi data | Template CSV, map columns | LOW | LOW | HIGH | Medium | Parsing, validation | **V2. Niche but important.** |
| P6 | **Backup & Restore** | User takut kehilangan data | Export/import full database | Local file download/upload | MEDIUM | LOW | CRITICAL | Medium | Full DB serialization | **V1.5. Trust builder.** |
| P7 | **Spending Trend (Chart)** | User ingin lihat pattern waktu | Line chart spending 30/90 hari | Smooth chart, zoom, compare period | MEDIUM | LOW | HIGH | Medium | Chart lib, data prep | **V2. Chart must be lightweight.** |
| P8 | **Cashflow View** | User tidak lihat money movement | Income vs expense over time | Simple dual bar chart | MEDIUM | LOW | HIGH | Low-Medium | Aggregation | **V2. Visual insight.** |
| P9 | **Predictive Insight** | User tidak tahu akhir bulan berapa | "Kira-kira akhir bulan sisa berapa" | Simple projection based on avg | LOW | LOW | MEDIUM | Medium | Statistical projection | **V3. Gimmick risk.** |
| P10 | **AI Insight** | User mau suggestion | "Kamu bisa hemat 200rb di makan" | Natural language summary | LOW | LOW | MEDIUM | HIGH | LLM integration (costly) | **NO. Not worth it for V1-V3.** |

### TIER 5: FUTURE

> Fitur bagus tapi JANGAN dibuat dulu. Fokus sekarang adalah core.

| # | Fitur | Kenapa Bukan Sekarang | Kapan Pertimbangan |
|---|---|---|---|
| F1 | Cloud Sync | Kompleks (conflict resolution), butuh backend, privacy concern | Setelah 10K MAU, ada revenue |
| F2 | Multi-device | Butuh cloud sync dulu | After cloud sync |
| F3 | Bank Integration (API) | Bank Indonesia API terbatas, maintenance berat, not reliable | Mungkin tidak pernah worth it |
| F4 | Shared Finance | Bukan target user (single-user personal) | Jika pivot ke couple/family |
| F5 | Investment Tracking | Bukan core finance tracking, kompleksitas tinggi | Jika expand scope |
| F6 | OCR / Scan Struk | Error rate tinggi, maintenance, battery drain | Jika AI vision mature & cheap |
| F7 | Auto-categorize (ML) | Butuh data banyak, privacy concern, kompleks | Jika punya dataset besar |
| F8 | Subscription Management | Niche, bisa pakai recurring + tag | Jika user demand tinggi |
| F9 | Bill Reminder | Bisa pakai recurring + notification | Simple version di V2 |
| F10 | Multi-currency Full | Niche untuk user Indonesia | Jika ada demand |
| F11 | Tax Calculation | Bukan target user (personal, bukan bisnis) | Mungkin tidak pernah |
| F12 | Social Features | Bukan social app, privacy concern | Tidak direkomendasikan |

---

## D. UX RECOMMENDATION

### The Core UX Problem: "Bagaimana Supaya User Tidak Malas Nyatet?"

Ini adalah pertanyaan paling penting. Semua fitur lain tidak ada artinya kalau user tidak input data.

#### Root Cause Analysis: Kenapa User Malas?

| Penyebab | Solusi |
|---|---|
| Terlalu banyak tap | Quick add: 2 tap max |
| Form terlalu panjang | Smart defaults, optional fields |
| Lupa | Push notification reminder |
| Tidak lihat value | Insight muncul dalam 3 hari |
| Internet lambat | Offline-first |
| App lambat | < 200ms startup, 60fps scroll |
| Tidak ada habit | Streak + daily nudge |
| Merasa sudah tahu | Weekly review yang mengejutkan |

#### The 3-Second Rule

**User harus bisa mencatat 1 transaksi dalam maksimal 3 detik setelah membuka app.**

Cara mencapai:

```
Open App → Dashboard (already visible)
         → Tap "+" (floating button, always visible)
         → Amount keyboard auto-focus
         → Type amount
         → Select category (horizontal scroll, 1 tap)
         → Done (auto-save)
```

Total: **2-3 tap + typing amount**. Itu saja.

Fields yang **WAJIB** di quick add:
- Amount (auto-focus, numeric keyboard)
- Category (horizontal chip scroll, default = last used)

Fields yang **OPTIONAL** (bisa diisi nanti):
- Notes
- Account (default = last used / primary)
- Date (default = today)
- Tags

#### Smart Defaults Strategy

| Field | Default | Logic |
|---|---|---|
| Date | Today | 95% transaksi dicatat hari ini |
| Account | Last used / Primary | User biasanya pakai 1-2 akun dominan |
| Category | Last used | Pattern-based, last-used is best predictor |
| Type | Expense | 80%+ transaksi adalah expense |
| Amount | Empty, auto-focus | Harus diisi manual |
| Notes | Empty | Optional |

#### Friction Reduction Tactics

1. **Amount First**: Keyboard numeric langsung muncul. User ketik angka dulu, baru pilih kategori. Lebih natural.

2. **Category sebagai Chip Horizontal**: Bukan dropdown. Bukan modal. Horizontal scroll chip. 1 tap.

3. **Last Used Category Highlight**: Kategori terakhir dipakai selalu paling kiri atau highlighted.

4. **No Confirmation Dialog**: Auto-save saat user tap "Done". Tidak ada "Are you sure?". Undo via toast (3 detik).

5. **Inline Edit**: Tap transaksi di list → langsung edit di place. Tidak ada page transition.

6. **Swipe Actions**: Swipe kiri = delete, swipe kanan = edit. Native feel.

7. **Haptic Feedback**: Vibration ringan saat add transaction. Memberikan "feel" native.

#### Information Architecture

```
┌─────────────────────────────────────────┐
│              BOTTOM NAV                 │
│  [Home] [Transactions] [Insights] [More]│
└─────────────────────────────────────────┘

Home (Dashboard):
├── Total Balance (all accounts)
├── Spending Today / This Week
├── Quick Add FAB (floating, always visible)
├── Recent Transactions (last 5)
├── Budget Progress (if any)
└── Streak Counter

Transactions:
├── List (virtualized, infinite scroll)
├── Filter (date, category, account, type)
├── Search (global)
└── Sort (date, amount)

Insights:
├── Monthly Overview (income vs expense)
├── Category Breakdown (bar chart)
├── Spending Trend (line chart, V2)
└── Monthly Review (V1.5)

More:
├── Accounts Management
├── Categories Management
├── Budgets
├── Recurring Transactions
├── Backup & Restore
├── Settings
├── Reminder Settings
└── About
```

#### Gesture Map

| Gesture | Action |
|---|---|
| Tap "+" FAB | Quick add transaction |
| Swipe transaction left | Delete (with undo) |
| Swipe transaction right | Edit |
| Pull down (home) | Refresh (if sync enabled) |
| Long press transaction | Quick actions menu |
| Swipe between tabs | Navigate bottom nav |
| Double tap FAB | Quick add with last category |

#### Native-Feel Checklist

| Element | Implementation |
|---|---|
| Bottom Navigation | Fixed, 4 items, active indicator |
| FAB | Floating, animated, bottom-right |
| Transitions | 200ms ease-out, slide left/right |
| Loading States | Optimistic UI, skeleton screens |
| Empty States | Illustrative, actionable CTA |
| Error States | Inline, recoverable, friendly |
| Scroll | Momentum, 60fps, virtualized |
| Touch Targets | Min 44x44px |
| Typography | System font, readable sizes |
| Colors | Dark mode support, high contrast |
| Haptic | navigator.vibrate() on key actions |
| Splash Screen | PWA splash, branded |
| Status Bar | Theme color match |

#### Color & Design System

```
Primary: Deep Blue (#1E40AF) — trust, finance
Accent: Emerald (#10B981) — income, positive
Danger: Rose (#EF4444) — expense, warning
Neutral: Slate (#64748B) — text, borders
Background: White / Dark Gray (#0F172A)

Principles:
- High contrast for readability
- Color coding: green = income, red = expense
- Minimal decoration, maximum clarity
- Numbers are the hero
```

---

## E. PWA ARCHITECTURE RECOMMENDATION

### 1. Offline Architecture: IndexedDB + Dexie.js

**Keputusan: IndexedDB dengan Dexie.js sebagai wrapper.**

#### Kenapa bukan yang lain?

| Option | Kenapa Tidak |
|---|---|
| localStorage | Limit 5MB, synchronous, tidak cocok untuk data transaksi |
| SQLite WASM | Bundle besar (~500KB+), overkill, complex setup |
| PouchDB | Overhead besar, CouchDB sync tidak dibutuhkan |
| RxDB | Kompleks, learning curve tinggi, bundle size besar |
| Supabase local | Butuh backend, bukan offline-first |
| **IndexedDB + Dexie** | **Native browser API, async, 50MB+, Dexie simplifies query** |

#### Dexie.js Advantages

- TypeScript support excellent
- Query syntax mirip MongoDB/SQL
- Bundle size kecil (~15KB gzipped)
- Mature, well-maintained
- Migration support
- Works dengan semua browser modern

#### Database Schema

```typescript
// accounts.db.ts
interface Account {
  id: string;           // uuid
  name: string;         // "BCA", "GoPay", "Cash"
  type: 'cash' | 'bank' | 'ewallet' | 'savings';
  balance: number;      // current balance
  currency: string;     // 'IDR'
  icon: string;         // emoji or icon name
  color: string;        // account color
  isPrimary: boolean;   // default account
  isArchived: boolean;
  createdAt: number;    // timestamp
  updatedAt: number;
}

interface Transaction {
  id: string;           // uuid
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  categoryId: string;   // FK to Category
  accountId: string;    // FK to Account (source for transfer)
  toAccountId?: string; // FK to Account (destination for transfer)
  date: number;         // timestamp (start of day)
  notes?: string;
  tags?: string[];      // array of tag strings
  isRecurring?: boolean;
  recurringId?: string; // FK to RecurringTransaction
  createdAt: number;
  updatedAt: number;
  synced: boolean;      // for future cloud sync
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault: boolean;
  budgetLimit?: number; // optional monthly budget
  order: number;        // display order
  createdAt: number;
}

interface RecurringTransaction {
  id: string;
  template: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'synced'>;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: number;
  endDate?: number;
  isActive: boolean;
  lastGenerated?: number;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  deadline?: number;
  createdAt: number;
}

interface Debt {
  id: string;
  type: 'owed' | 'owing';  // piutang / utang
  personName: string;
  amount: number;
  paidAmount: number;
  dueDate?: number;
  notes?: string;
  createdAt: number;
}

interface AppSettings {
  key: string;            // 'reminder_time', 'currency', etc.
  value: string;
}
```

#### Index Strategy

```typescript
// Dexie schema definition
db.version(1).stores({
  accounts: 'id, isPrimary, isArchived',
  transactions: 'id, type, categoryId, accountId, date, isRecurring, synced',
  categories: 'id, type, isDefault',
  recurring: 'id, frequency, isActive, lastGenerated',
  goals: 'id',
  debts: 'id, type, dueDate',
  settings: 'key',
});
```

### 2. Service Worker Strategy

#### Cache Strategy: Stale-While-Revalidate + Network-First Hybrid

```javascript
// sw.js strategy per resource type

// 1. App Shell (HTML, JS, CSS) → Stale-While-Revalidate
//    - App selalu load dari cache dulu
//    - Update di background
//    - User tidak pernah lihat loading screen

// 2. Static Assets (fonts, icons, images) → Cache First
//    - Tidak pernah berubah
//    - Serve dari cache, tidak pernah network

// 3. API Calls (jika ada sync) → Network First
//    - Coba network dulu
//    - Fallback ke cache jika offline

// 4. Dynamic Data → Network Only (tidak di-cache oleh SW)
//    - Data transaksi dikelola oleh IndexedDB
//    - SW tidak perlu cache ini
```

#### Workbox Configuration

```typescript
// vite.config.ts (with vite-plugin-pwa)
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      {
        urlPattern: /\/api\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        },
      },
    ],
  },
  manifest: {
    name: 'NyatetDuwit',
    short_name: 'NyatetDuwit',
    description: 'Catat keuangan pribadi dengan cepat',
    theme_color: '#1E40AF',
    background_color: '#FFFFFF',
    display: 'standalone',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Tambah Transaksi',
        short_name: 'Add',
        description: 'Catat transaksi baru',
        url: '/?action=add',
        icons: [{ src: '/icon-add.png', sizes: '96x96' }],
      },
    ],
  },
});
```

#### What to Cache vs What NOT to Cache

| Resource | Strategy | Why |
|---|---|---|
| App Shell (HTML/JS/CSS) | Stale-While-Revalidate | Instant load, update in background |
| Fonts | Cache First | Never change, critical for rendering |
| Icons | Cache First | Static assets |
| Images | Cache First | Static assets |
| API responses | Network First | Fresh data when online |
| Transaction data | NOT CACHED by SW | Managed by IndexedDB |
| User-generated content | NOT CACHED by SW | Managed by IndexedDB |

### 3. Sync Strategy (Future)

> Ini untuk persiapan ketika cloud sync ditambahkan di V3+.

#### Architecture: Local-First with Event Sourcing

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Local DB   │────▶│  Outbox      │────▶│   Cloud      │
│  (IndexedDB) │     │  (Queue)     │     │   Backend    │
└──────────────┘     └──────────────┘     └──────────────┘
       ▲                    │                     │
       │                    ▼                     ▼
       │             ┌──────────────┐     ┌──────────────┐
       └─────────────│  Inbox       │◀────│  Sync        │
                     │  (Pull)      │     │  Engine      │
                     └──────────────┘     └──────────────┘
```

#### Conflict Resolution Strategy

**Last-Write-Wins with Vector Clocks**

- Setiap entity punya `updatedAt` timestamp
- Setiap entity punya `version` number
- Conflict: compare timestamps, higher wins
- Edge case: user edit same transaction on 2 devices → merge fields, keep latest

#### Sync Flow

```
1. User makes change locally → save to IndexedDB
2. Change added to "outbox" table
3. Background sync triggers when online
4. Outbox items sent to server
5. Server responds with latest state
6. Local DB merges server state
7. Outbox items marked as synced
```

#### Restore Strategy

- Full backup export (JSON) → user download
- Restore: upload JSON → validate → merge or replace
- Conflict: user chooses (overwrite local / merge / skip)

### 4. Installability UX — Dual Path Strategy

> **Strategi utama: 2 jalur install. User pilih yang paling mudah buat mereka.**

#### Path A: APK Install (Primary — untuk user baru)

**Kenapa APK jadi jalur utama:**

User Indonesia biasa install app dari APK. Mereka tidak tahu apa itu PWA. Mereka tidak mengerti "Add to Home Screen". Tapi mereka paham: download APK → install → buka app.

**Distribution Strategy:**

```
User baru dapat link (WhatsApp, sosmed, teman)
  ↓
Landing page: "Download NyatetDuwit"
  ↓
2 tombol:
  ├── [Download APK] ← PRIMARY (highlighted)
  └── [Buka di Browser] ← SECONDARY (untuk yang mau coba dulu)
  ↓
APK download → Install → App langsung terbuka
  ↓
First run: onboarding → mulai nyatet
```

**APK Distribution Channels:**

| Channel | Cara | Reach | Trust |
|---|---|---|---|
| Direct download (website) | Link di landing page | Tinggi | Tinggi |
| WhatsApp share | Kirim file APK langsung | Sangat tinggi | Sangat tinggi |
| Google Drive / MediaFire | Link download | Tinggi | Medium |
| GitHub Releases | Link di repo | Medium | Tinggi (tech users) |
| Play Store (V3) | TWA submission | Sangat tinggi | Sangat tinggi |

**TWA (Trusted Web Activity) Setup:**

```
PWA (React + Vite)
  ↓
TWA Wrapper (bubblewrap / pwabuilder)
  ↓
APK (~50KB wrapper + PWA content)
  ↓
Install seperti app biasa
```

**Kenapa TWA, bukan Capacitor/Cordova:**

| Aspek | TWA | Capacitor/Cordova |
|---|---|---|
| Bundle size | ~50KB wrapper | +2-5MB native bridge |
| Code change | 0 (PWA tetap sama) | Perlu adaptasi |
| Update | Otomatis (update PWA = update app) | Harus rebuild APK |
| Offline | Service worker tetap jalan | Perlu plugin tambahan |
| Maintenance | Minimal (hanya wrapper) | Tinggi (native bridge) |
| Play Store ready | Ya | Ya |
| Complexity | Sangat rendah | Medium-tinggi |

**TWA Implementation:**

```bash
# Option 1: Bubblewrap (CLI, recommended)
npm install -g @googlechrome/bubblewrap
bubblewrap init --manifest https://nyatetduwit.app/manifest.json
bubblewrap build --signing-key-info signing-key.json

# Option 2: PWA Builder (web-based, easier)
# 1. Buka https://www.pwabuilder.com
# 2. Masukkan URL PWA
# 3. Download Android package
# 4. Sign dengan keystore
# 5. APK siap didistribusikan
```

**TWA Configuration (assetlinks.json):**

```json
// https://nyatetduwit.app/.well-known/assetlinks.json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.nyatetduwit.app",
    "sha256_cert_fingerprints": ["YOUR_CERT_FINGERPRINT"]
  }
}]
```

**APK Build Process (CI/CD):**

```yaml
# .github/workflows/build-apk.yml
name: Build APK
on:
  push:
    tags: ['v*']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: google/bubblewrap/actions@main
        with:
          manifest-url: 'https://nyatetduwit.app/manifest.json'
          signing-key: ${{ secrets.SIGNING_KEY }}
      - uses: actions/upload-artifact@v4
        with:
          name: nyatetduwit-apk
          path: app-release-signed.apk
```

**APK Install UX:**

```
1. User download APK dari website
2. Android: "File ini bisa berbahaya" → "Tetap install"
3. Install progress bar
4. "App terinstall" → "Buka"
5. App terbuka → onboarding → mulai nyatet
6. Icon muncul di home screen + app drawer
```

**Handling "Unknown Sources" Warning:**

Android akan show warning saat install APK dari luar Play Store. Ini tidak bisa dihindari, tapi bisa diminimalkan friction-nya:

1. **Instruksi jelas di landing page:**
   ```
   "Jika muncul peringatan 'App tidak dikenal':
    1. Tap 'Settings'
    2. Aktifkan 'Allow from this source'
    3. Kembali dan tap 'Install'"
   ```

2. **Screenshot instruksi** dengan gambar step-by-step

3. **Video tutorial 30 detik** (optional)

4. **WhatsApp support** untuk yang stuck

#### Path B: PWA Browser Install (Secondary — untuk user yang sudah familiar)

**The Problem:** Most users don't know they can install PWAs from browser.

**The Solution:**

1. **First Visit (Day 0):**
   - App works immediately, no install prompt
   - Show subtle banner: "Install untuk pengalaman lebih baik" di bottom
   - Banner muncul setelah user berhasil add 1 transaksi (after "aha moment")

2. **Install Prompt Timing:**
   - JANGAN show prompt saat pertama buka
   - Show setelah user:
     - Berhasil add 3+ transaksi, ATAU
     - Kembali ke app hari kedua
   - Timing: saat user di dashboard, tidak saat di form

3. **Install Banner Copy:**
   ```
   "Install NyatetDuwit"
   "Buka lebih cepat dari home screen"
   [Install] [Nanti Saja]
   ```

4. **After Install:**
   - Show onboarding: "NyatetDuwit sudah terinstall!"
   - Offer to add shortcut: "Buat shortcut untuk quick add"
   - Celebrate subtly (confetti optional, bisa annoying)

5. **If User Dismisses:**
   - Don't show again for 7 days
   - Show different copy next time: "Install untuk notifikasi reminder"

6. **Android-Specific:**
   - Use `beforeinstallprompt` event
   - Custom install button di settings
   - TWA (Trusted Web Activity) untuk APK distribution

#### Comparison: APK vs PWA Install

| Aspek | APK Install | PWA Browser Install |
|---|---|---|
| User familiarity | Tinggi (biasa install app) | Rendah (tidak tahu bisa) |
| Steps | 3-4 (download → install → buka) | 2-3 (menu → add to home) |
| Friction | Medium (unknown sources warning) | Tinggi (user tidak tahu caranya) |
| Icon di home screen | Ya (otomatis) | Ya (setelah add) |
| Offline support | Ya (service worker) | Ya (service worker) |
| Update | Otomatis (saat buka app) | Otomatis (service worker) |
| Play Store | Bisa (via TWA) | Tidak langsung |
| Share via WhatsApp | Bisa (kirim file APK) | Bisa (kirim link) |
| Trust | Tinggi (terasa seperti app asli) | Medium (terasa seperti website) |

**Kesimpulan:**

```
User baru → APK install (primary) — paling familiar, paling mudah
User tech-savvy → PWA browser install (secondary) — tanpa download file
V3 → Play Store (TWA) — discoverability + trust maksimal
```

### 5. Native-Feel UX Implementation

#### Tech Stack Recommendation

```
Framework: React + Vite (bukan Next.js)
  - Alasan: Next.js SSR tidak berguna untuk offline-first PWA
  - Vite = faster dev, smaller bundle, simpler

Routing: TanStack Router atau React Router v6
  - Client-side only
  - No SSR needed

State Management: Zustand
  - Ringan (~1KB)
  - Simple API
  - Works well with IndexedDB

Database: Dexie.js (IndexedDB wrapper)
  - ~15KB gzipped
  - TypeScript support
  - Query API yang clean

UI Components: Custom + Radix UI primitives
  - Jangan pakai MUI/Chakra (bundle besar)
  - Radix = accessible, headless, kecil
  - Custom styling dengan Tailwind

Styling: Tailwind CSS
  - Utility-first, small bundle with purge
  - Easy dark mode

Charts: Lightweight Charts (TradingView) atau custom SVG
  - Jangan Chart.js / Recharts (bundle besar)
  - Custom SVG untuk simple bar/line chart lebih ringan

Animations: CSS transitions + Framer Motion (selective)
  - Framer Motion hanya untuk critical animations
  - CSS transitions untuk yang lain

Icons: Lucide React
  - Tree-shakeable, kecil, consistent

Date: date-fns
  - Tree-shakeable, modular
  - Jangan moment.js (bundle besar)

Notifications: Web Push API + Service Worker
  - Local notifications untuk reminder

Haptic: navigator.vibrate()
  - Simple, works on Android
```

#### Bundle Size Budget

| Category | Budget | Notes |
|---|---|---|
| React + ReactDOM | ~45KB gzipped | Non-negotiable |
| Router | ~8KB | TanStack Router |
| State (Zustand) | ~1KB | Minimal |
| Dexie.js | ~15KB | IndexedDB wrapper |
| Tailwind | ~10KB | After purge |
| Icons (Lucide) | ~5KB | Used icons only |
| date-fns | ~5KB | Used functions only |
| Charts | ~10KB | Custom SVG preferred |
| App Code | ~50KB | Target |
| **TOTAL** | **~150KB gzipped** | Target < 200KB |

#### Startup Performance Target

| Metric | Target | How |
|---|---|---|
| First Contentful Paint | < 500ms | App shell cached, inline critical CSS |
| Time to Interactive | < 1000ms | Code splitting, lazy load non-critical |
| Dashboard Render | < 200ms | Optimistic UI, cached data |
| Transaction Add | < 100ms | Optimistic write, no network |
| List Scroll | 60fps | Virtualization, windowing |

### 6. Performance Strategy for Low-End Android

#### Virtualization

```tsx
// Transaction list MUST be virtualized
import { useVirtualizer } from '@tanstack/react-virtual';

// 1000 transaksi harus scroll smooth di RAM 2GB
// TanStack Virtual = ~5KB, efficient
```

#### Code Splitting

```tsx
// Lazy load non-critical routes
const Insights = lazy(() => import('./pages/Insights'));
const Settings = lazy(() => import('./pages/Settings'));

// Dashboard + Transaction list = eager load
// Everything else = lazy
```

#### Image Optimization

- Tidak ada gambar di app ini (kecuali icon)
- Icon = SVG inline (Lucide)
- No external images
- No avatars, no photos (kecuali attachment di V2)

#### Memory Management

```tsx
// Unsubscribe dari subscriptions
// Clear large query results
// Debounce search input
// Throttle scroll events
// Use React.memo untuk list items
// useMemo untuk expensive calculations
```

#### Chart Performance

- Jangan render chart yang tidak visible
- Lazy load chart component
- Use SVG, bukan Canvas (lebih ringan untuk simple chart)
- Limit data points (aggregate to daily/weekly)
- Max 90 days visible at once

#### Battery Efficiency

- Tidak ada polling
- Background sync only when needed
- No continuous animations
- RequestAnimationFrame for animations
- navigator.vibrate() sparingly (10ms max)

---

## F. MVP SCOPE

### What MUST Be in V1 (Launch)

Ini adalah fitur yang WAJIB ada sebelum launch. Tanpa ini, app tidak layak dipakai.

#### V1 Feature List

**Core:**
1. Quick Add Transaction (amount + category, < 3 detik)
2. Transaction List (virtualized, filter by date)
3. Income / Expense / Transfer types
4. Category Management (12 default + custom)
5. Account Management (cash, bank, e-wallet)
6. Real-time Balance (per account + total)
7. Dashboard (total balance, today spending, recent tx)
8. Monthly Overview (income vs expense summary)
9. Category Breakdown (simple bar chart)
10. Budget per Category (set limit, progress bar)
11. Recurring Transaction (monthly)
12. Edit & Delete Transaction
13. Notes per Transaction
14. Basic Search (by name/amount)
15. Daily Reminder Notification
16. Recording Streak
17. Backup & Restore (JSON export/import)
18. PWA Installability
19. Offline-First (all features work offline)
20. Dark Mode

**Non-Functional:**
- Startup < 1 second
- Add transaction < 3 seconds
- Scroll 60fps dengan 1000+ transactions
- Bundle < 200KB gzipped
- Works on Android 8+ (Chrome 80+)
- RAM usage < 100MB

#### V1 Feature yang DIHAPUS dari Scope Awal

| Fitur | Alasan Dihapus |
|---|---|
| Tag System | Bisa pakai notes, kompleksitas tidak worth it |
| Weekly/Monthly Review | Bisa V1.5, bukan blocker |
| Savings Goal | V2, retention driver tapi bukan core |
| Debt Tracker | V2, not daily use |
| Export CSV | Backup JSON sudah cukup untuk V1 |
| Import CSV | V2, migration tool |
| Spending Trend Chart | V2, category breakdown sudah cukup |
| Anomaly Detection | V2, butuh data history |
| AI Insight | Tidak pernah worth it untuk app ini |
| Multi-currency | Niche untuk Indonesia |
| Attachment/Receipt | V3, kompleks, battery drain |
| App Lock / Biometric | V2, privacy concern tapi bukan daily blocker |
| Local Encryption | V2, performance cost |

### MVP User Journey

```
Day 0:
1. User buka link NyatetDuwit
2. Landing page → "Mulai" (no login, no signup)
3. Onboarding (3 screens, skippable):
   - "Catat pemasukan & pengeluaran dengan cepat"
   - "Bisa dipakai tanpa internet"
   - "Data kamu tetap di HP kamu"
4. Setup awal:
   - Pilih mata uang (default IDR)
   - Tambah akun pertama (default: Cash)
   - Pilih kategori default (auto-populated)
5. Dashboard muncul dengan saldo 0
6. Prompt: "Tambah transaksi pertama kamu"
7. User tap + → add expense → DONE
8. Streak: 1 hari
9. Banner: "Install untuk akses lebih cepat"

Day 1:
1. Notification: "Jangan lupa catat pengeluaran hari ini"
2. User buka app → dashboard updated
3. Add 2-3 transaksi
4. Streak: 2 hari

Day 7:
1. Streak: 7 hari (fire icon)
2. Monthly overview mulai ada data
3. Category breakdown mulai meaningful
4. User mulai lihat pattern

Day 30:
1. Monthly review available
2. Budget progress visible
3. User punya habit
```

---

## G. V1 → V2 → V3 ROADMAP

### V1: Foundation (Month 1-2)

**Theme:** "Bisa dipakai, cepat, offline, install mudah"

**Focus:** Core transaction flow + habit formation + APK distribution

**Deliverables:**
- Semua fitur MVP di atas
- PWA installable (browser)
- **TWA APK build (download langsung dari website)**
- **Landing page dengan download APK button**
- **APK distribution (WhatsApp, link, GitHub Releases)**
- Offline-first
- Daily reminder
- Streak system
- Backup/restore

**Success Metrics:**
- 50% user add transaction on Day 1
- 30% user return on Day 7
- **40% user install via APK**
- 15% user install via PWA browser
- Average time-to-record < 3 seconds
- Crash rate < 0.1%

**Timeline:**
- Week 1-2: Setup, DB schema, core transaction CRUD
- Week 3-4: Dashboard, transaction list, categories, accounts
- Week 5-6: Budget, recurring, search
- Week 7-8: PWA, offline, notifications, streak, **TWA APK build**, polish

### V1.5: Insight & Trust (Month 3)

**Theme:** "User mulai ngerti uang mereka"

**Deliverables:**
- Weekly Summary (in-app + notification)
- Monthly Review screen
- "You Saved This Month" highlight
- Export CSV
- Improved category breakdown (pie chart option)
- Better empty states
- Onboarding improvements based on data

**Success Metrics:**
- 40% user return on Day 7 (up from 30%)
- 25% user view monthly review
- 10% user export data

### V2: Control & Growth (Month 4-6)

**Theme:** "User kontrol keuangan mereka"

**Deliverables:**
- Savings Goal system
- Emergency Fund Tracker
- Debt/Piutang Tracker
- Tag System
- Spending Trend Chart (90 days)
- Cashflow View
- Import CSV
- App Lock (PIN/Biometric)
- Local Encryption (optional, toggle)
- PWA Shortcuts (quick add from home screen)
- Improved notification (smart timing)
- Multi-account transfer history

**Success Metrics:**
- 50% user return on Day 7
- 20% user set at least 1 goal
- 30% user set budget
- Average 3+ transactions per active day

### V3: Sync & Premium (Month 7-12)

**Theme:** "Data aman, bisa di mana saja, Play Store ready"

**Deliverables:**
- Cloud Sync (optional, with account)
- Multi-device support
- Conflict resolution
- Web dashboard (desktop view)
- Advanced insights (anomaly detection)
- Predictive insight ("estimated month-end balance")
- Subscription management (recurring + tracking)
- Bill reminder
- **Play Store listing (existing TWA, submit ke Play Store)**
- **Auto-update APK via in-app notification**
- Premium tier (if monetization desired)

**Success Metrics:**
- 60% user return on Day 7
- 20% user enable cloud sync
- 10K+ MAU
- Positive app store reviews (4.5+)

### Future (Year 2+)

- Couple/family shared finance
- Bank integration (if viable in Indonesia)
- OCR receipt scanning (if tech mature)
- Auto-categorization (if dataset large enough)
- API for third-party integrations
- Regional expansion (SEA)

---

## H. BIGGEST MISTAKES TO AVOID

### 1. Membangun Cloud Sync di V1

**Kenapa salah:** Kompleksitas conflict resolution sangat tinggi. Butuh backend, auth, database server. Distraksi dari core value.

**Yang benar:** Local-first. Sync nanti kalau user base sudah ada dan minta.

### 2. Terlalu Banyak Kategori Default

**Kenapa salah:** 50 kategori = overwhelming. User bingung pilih.

**Yang benar:** 8-12 kategori default yang relevan untuk Indonesia:
- Makan & Minum
- Transport
- Belanja
- Hiburan
- Tagihan
- Kesehatan
- Pendidikan
- Gaji
- Investasi
- Lainnya

### 3. Form Transaksi Terlalu Panjang

**Kenapa salah:** 10 field = user males = app abandoned.

**Yang benar:** 2 field wajib (amount, category). Sisanya optional.

### 4. Chart yang Berat dan Kompleks

**Kenapa salah:** Chart.js + 1000 data points = lag di HP low-end.

**Yang benar:** Simple SVG bar chart. Aggregate data. Max 90 days.

### 5. Login/Signup di Awal

**Kenapa salah:** Friction tertinggi. User belum lihat value sudah disuruh daftar.

**Yang benar:** No login. Data lokal. Akun nanti kalau mau sync.

### 6. Subscription di Awal

**Kenapa salah:** User belum trust. Belum lihat value. Paywall = uninstall.

**Yang benar:** Free core. Premium nanti kalau ada fitur yang benar-benar bernilai.

### 7. AI Insight di V1

**Kenapa salah:** Costly, inaccurate tanpa data banyak, gimmicky.

**Yang benar:** Rule-based insight dulu. "Kamu spending 20% lebih dari bulan lalu" sudah cukup.

### 8. Mengabaikan Performance di HP Low-End

**Kenapa salah:** Target user Indonesia banyak pakai HP 2-3GB RAM.

**Yang benar:** Virtualization, code splitting, bundle budget, test di HP murah.

### 9. Tidak Ada Habit System

**Kenapa salah:** App finance tanpa habit = user pakai 3 hari lalu abandon.

**Yang benar:** Streak + reminder + weekly review = habit loop.

### 10. Scope Creep

**Kenapa salah:** "Oh, sekalian buat fitur investment tracking deh." → app jadi tidak fokus.

**Yang benar:** Katakan TIDAK. Setiap fitur baru harus melewati bar: "Apakah ini membuat user lebih rajin nyatet?"

---

## I. BRUTALLY HONEST RECOMMENDATION

### The Hard Truths

#### 1. 90% App Finance Gagal Karena User Berhenti Nyatet

Bukan karena fitur kurang. Bukan karena UI jelek. Tapi karena **user malas**.

Solusi bukan lebih banyak fitur. Solusi adalah **mengurangi friction sampai tidak ada alasan untuk tidak nyatet**.

**Action:** Quick add dalam 2 tap. Default yang smart. Reminder yang tidak annoying.

#### 2. User Indonesia Tidak Mau Bayar untuk App Finance

Market Indonesia price-sensitive. App finance berbayar = niche.

**Action:** Free core. Monetize nanti via premium features yang benar-benar bernilai (cloud sync, advanced insight). Atau donasi. Atau tidak monetize sama sekali (portfolio project).

#### 3. Bank Integration di Indonesia adalah Mimpi Buruk

Bank API tidak standar. Maintenance berat. Tidak reliable.

**Action:** Jangan bangun ini. Manual entry adalah cara terbaik untuk awareness keuangan anyway.

#### 4. AI Insight adalah Gimmick untuk App Personal Finance

User tidak butuh AI untuk bilang "kamu banyak makan di luar". Mereka butuh data yang akurat dan habit yang konsisten.

**Action:** Rule-based insight sudah cukup. AI hanya worth it jika benar-benar actionable dan murah.

#### 5. Offline-First adalah Competitive Advantage

Mayoritas app finance butuh internet. NyatetDuwit tidak. Ini adalah differentiator.

**Action:** Invest di offline architecture. Ini bukan nice-to-have. Ini core value.

#### 6. PWA + TWA APK adalah Kombinasi yang Tepat

Native app = maintenance 2 platform (iOS + Android). PWA = 1 codebase, installable, offline-capable. TWA APK = user bisa install seperti app biasa tanpa ribet.

**Action:** Commit ke PWA. Build TWA APK untuk distribusi mudah. Jangan pivot ke React Native/Flutter.

#### 7. User Indonesia Lebih Paham APK daripada PWA

"Add to Home Screen" = konsep asing. "Download APK → Install" = konsep yang sudah dipahami.

**Action:** Landing page prioritaskan tombol "Download APK". PWA browser install sebagai alternatif.

### 10 Keputusan Produk Paling Penting

| # | Keputusan | Alasan |
|---|---|---|
| 1 | **Local-first, offline-first** | Internet tidak reliable, privacy, speed |
| 2 | **No login di V1** | Friction killer, user belum trust |
| 3 | **Quick add < 3 detik** | Friction = death untuk finance app |
| 4 | **2 field wajib di form** | Amount + category. Sisanya optional |
| 5 | **Smart defaults** | Last-used category, today's date, primary account |
| 6 | **Daily reminder** | Habit formation butuh nudge |
| 7 | **Streak system** | Gamification ringan, proven retention driver |
| 8 | **Bundle < 200KB** | HP low-end, internet lambat |
| 9 | **No cloud sync di V1** | Kompleksitas tinggi, bukan core value |
| 10 | **APK install = primary, PWA = secondary** | User Indonesia lebih paham APK daripada PWA |
| 11 | **Say no to 90% feature requests** | Focus > completeness |

### Kalau Scope Harus Dipangkas 50%

Ini yang DISIMPAN:

1. Quick Add Transaction
2. Transaction List
3. Categories (8 default)
4. Accounts (cash + 1 bank)
5. Dashboard (total balance + recent)
6. Monthly Overview
7. Category Breakdown
8. Daily Reminder
9. Streak
10. PWA Installability
11. **TWA APK Build**
12. **Landing Page + Download Button**
13. Offline Storage
14. Backup/Restore

Ini yang DIPOTONG:

- Budget system → V1.5
- Recurring transaction → V1.5
- Transfer → V1.5
- Search → V1.5
- Notes → V1.5
- Dark mode → V1.5
- In-app update checker → V1.5
- Edit/Delete → TETAP (non-negotiable)

### Fitur Overrated (Jangan Dibuat)

| Fitur | Kenapa Overrated |
|---|---|
| AI Insight | Gimmick, costly, inaccurate |
| OCR Receipt | Error rate tinggi, battery drain |
| Bank Sync | Tidak reliable di Indonesia |
| Social Features | Bukan social app |
| Investment Tracking | Bukan core |
| Multi-currency | Niche |
| Shared Finance | Bukan target user |
| Tax Calculation | Bukan personal finance |
| Crypto Tracking | Volatile, bukan core |
| Bill Splitting | Bukan personal finance |

### Final Recommendation

**Build the smallest thing that could possibly work.**

V1 harus bisa:
1. Buka app < 1 detik
2. Catat transaksi < 3 detik
3. Lihat summary bulan ini
4. Dapat reminder harian
5. Bekerja offline
6. Backup data
7. **Install via APK (download → install → buka)**

Itu saja.

Kalau user pakai ini setiap hari selama 30 hari, baru tambah fitur lain.

Kalau tidak, fix friction-nya. Bukan tambah fitur.

**The best feature is the one that makes users record more transactions.**

Everything else is secondary.

**Distribution strategy:**
- Landing page dengan tombol "Download APK" sebagai primary
- PWA browser install sebagai secondary
- WhatsApp share APK untuk word-of-mouth
- Play Store (TWA) di V3 untuk discoverability

---

## APPENDIX: Technical Implementation Checklist

### Pre-Launch Checklist

- [ ] PWA manifest valid
- [ ] Service worker registered
- [ ] Offline mode tested (airplane mode)
- [ ] Install prompt works on Android Chrome
- [ ] Splash screen configured
- [ ] Icons (192, 512, maskable)
- [ ] Theme color set
- [ ] Bundle size < 200KB gzipped
- [ ] Startup time < 1s on low-end device
- [ ] Transaction add < 3s
- [ ] List scroll 60fps with 1000 items
- [ ] IndexedDB migration tested
- [ ] Backup/restore tested
- [ ] Notification permission handled
- [ ] Daily reminder works
- [ ] Streak counter accurate
- [ ] Dark mode tested
- [ ] Error boundaries in place
- [ ] No console errors
- [ ] Lighthouse score > 90 (PWA, Performance, Accessibility, Best Practices)
- [ ] **TWA APK built and signed**
- [ ] **APK installs on Android device**
- [ ] **APK works offline**
- [ ] **assetlinks.json deployed**
- [ ] **Landing page live with APK download button**
- [ ] **Install instructions tested end-to-end**
- [ ] **APK uploaded to GitHub Releases + website hosting**

### Testing Devices (Minimum)

- Android 8, Chrome 80, 2GB RAM (low-end)
- Android 12, Chrome 120, 4GB RAM (mid-range)
- Android 14, Chrome 120, 8GB RAM (high-end)
- Desktop Chrome (for dev)
- **APK install test on each device tier**
- **APK offline test on each device tier**

### Monitoring (Post-Launch)

- Sentry / LogRocket untuk error tracking
- Plausible / Umami untuk analytics (privacy-friendly)
- Custom metrics:
  - Time-to-record
  - Daily active recorders
  - Streak distribution
  - Feature usage
  - Crash rate

---

*Document Version: 1.0*
*Last Updated: May 2026*
*Status: Ready for Implementation*
