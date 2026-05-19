# Sprint Planning — NyatetDuwit V1

> 8 Sprint (Week 1–8) | Target: MVP Launch
> Based on: Perancangan_Nyatet_Duwit.md
> Stack: React + Vite + Dexie.js + Zustand + Tailwind + vite-plugin-pwa

---

## TABLE OF CONTENTS

1. [Sprint Overview](#1-sprint-overview)
2. [Definition of Done](#2-definition-of-done)
3. [Sprint 1: Foundation Setup](#3-sprint-1-foundation-setup)
4. [Sprint 2: Database & Core CRUD](#4-sprint-2-database--core-crud)
5. [Sprint 3: Dashboard & Transaction List](#5-sprint-3-dashboard--transaction-list)
6. [Sprint 4: Accounts, Categories & Transfer](#6-sprint-4-accounts-categories--transfer)
7. [Sprint 5: Budget & Recurring](#7-sprint-5-budget--recurring)
8. [Sprint 6: Insights & Search](#8-sprint-6-insights--search)
9. [Sprint 7: PWA, Offline & Notifications](#9-sprint-7-pwa-offline--notifications)
10. [Sprint 8: Polish, Backup & Launch Prep](#10-sprint-8-polish-backup--launch-prep)
11. [Risk Register](#11-risk-register)
12. [Dependency Map](#12-dependency-map)
13. [Performance Budget Tracker](#13-performance-budget-tracker)

---

## 1. SPRINT OVERVIEW

| Sprint | Week | Theme | Deliverable | Story Points |
|---|---|---|---|---|
| **Sprint 1** | 1–2 | Foundation Setup | Project scaffold, design system, routing, DB schema | 34 |
| **Sprint 2** | 3 | Database & Core CRUD | Transaction CRUD, category seed, account seed | 40 |
| **Sprint 3** | 4 | Dashboard & Transaction List | Home screen, virtualized list, date filter | 38 |
| **Sprint 4** | 5 | Accounts, Categories & Transfer | Account management, category management, transfer flow | 36 |
| **Sprint 5** | 6 | Budget & Recurring | Budget per category, recurring transaction engine | 34 |
| **Sprint 6** | 7 | Insights & Search | Monthly overview, category breakdown, search | 30 |
| **Sprint 7** | 8 | PWA, Offline, Notifications & TWA APK | Service worker, install prompt, notifications, streak, **TWA APK build** | 46 |
| **Sprint 8** | 9 | Polish, Backup & Launch Prep | Backup/restore, dark mode, testing, performance, **landing page + APK distribution**, launch | 44 |
| **TOTAL** | | | **V1 MVP** | **302** |

### Velocity Assumption

- 1 developer = ~35–40 story points per sprint
- Story point scale: 1 (trivial), 2 (simple), 3 (medium), 5 (complex), 8 (very complex), 13 (epic)

---

## 2. DEFINITION OF DONE

### DoD — All User Stories

Setiap user story dianggap **DONE** jika memenuhi SEMUA kriteria berikut:

#### Code Quality
- [ ] Code written in TypeScript (strict mode)
- [ ] No ESLint warnings or errors
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] Code follows project conventions (naming, structure, imports)
- [ ] No `any` types used (use `unknown` if needed)
- [ ] Components are functional (no class components)
- [ ] No console.log in production code (use proper logger)
- [ ] Unused imports removed
- [ ] Dead code removed

#### Testing
- [ ] Unit tests written for business logic (hooks, utils, stores)
- [ ] Component tests for critical UI (form validation, list rendering)
- [ ] Integration test for transaction flow (add → save → display)
- [ ] All tests pass (`npm run test`)
- [ ] Test coverage ≥ 70% for new code
- [ ] Edge cases tested (empty state, error state, large data)

#### UX / UI
- [ ] Responsive on 320px–428px width (mobile-first)
- [ ] Touch targets ≥ 44x44px
- [ ] Works in light mode AND dark mode
- [ ] Loading states implemented (skeleton or spinner)
- [ ] Empty states implemented (illustration + CTA)
- [ ] Error states implemented (friendly message + recovery action)
- [ ] No layout shift (CLS < 0.1)
- [ ] Animations use CSS transitions or requestAnimationFrame (no jank)
- [ ] Haptic feedback on key actions (navigator.vibrate)

#### Performance
- [ ] Component renders in < 100ms (no unnecessary re-renders)
- [ ] List items virtualized if > 50 items
- [ ] Images/icons optimized (SVG inline, no external)
- [ ] No memory leaks (subscriptions cleaned up)
- [ ] Expensive calculations memoized (useMemo, useCallback)

#### Accessibility
- [ ] Semantic HTML used (button, nav, main, section)
- [ ] ARIA labels on interactive elements without visible text
- [ ] Keyboard navigable (tab order logical)
- [ ] Color contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] Screen reader can read key information

#### PWA / Offline
- [ ] Feature works offline (airplane mode test)
- [ ] Data persists after browser close/reopen
- [ ] No network dependency for core flow
- [ ] IndexedDB operations are async (no blocking)

#### Review
- [ ] Code reviewed (self-review checklist completed)
- [ ] Tested on Android Chrome (real device or emulator)
- [ ] Tested on low-end device profile (Chrome DevTools throttling)
- [ ] Product owner acceptance (matches acceptance criteria)

### DoD — Sprint Level

Setiap sprint dianggap **DONE** jika:

- [ ] All user stories in sprint meet individual DoD
- [ ] No P0 or P1 bugs open
- [ ] Bundle size checked (within budget)
- [ ] Lighthouse scores checked (Performance ≥ 90, PWA ≥ 90)
- [ ] Demo ready (working build deployable)
- [ ] Sprint retrospective completed
- [ ] Next sprint backlog groomed

### DoD — Release Level (V1 Launch)

- [ ] All sprints complete
- [ ] All pre-launch checklist items checked (see Appendix in Perancangan_Nyatet_Duwit.md)
- [ ] Zero known P0 bugs
- [ ] P1 bugs have workarounds documented
- [ ] Tested on 3 device tiers (low-end, mid-range, high-end)
- [ ] Backup/restore tested end-to-end
- [ ] Offline mode tested end-to-end
- [ ] Install flow tested on Android Chrome
- [ ] Notification permission flow tested
- [ ] Performance targets met (see Performance Budget Tracker)

---

## 3. SPRINT 1: FOUNDATION SETUP

**Week:** 1–2
**Theme:** "Project scaffold, design system, routing, DB schema"
**Story Points:** 34

### Sprint Goal

Project bisa di-run secara lokal dengan routing yang berfungsi, design system siap, database schema defined, dan struktur folder yang scalable. Belum ada fitur finance, tapi fondasi sudah solid.

---

### US-1.1: Project Initialization

**Priority:** P0 (Blocker)
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Setup project dari nol dengan Vite + React + TypeScript. Semua dependency utama terinstall dan terkonfigurasi.

**Tech Stack:**
```
- Vite 5+ (bukan Next.js — SSR tidak diperlukan untuk offline-first PWA)
- React 18+
- TypeScript 5+ (strict mode)
- Tailwind CSS 3+
- ESLint + Prettier
- Vitest (testing)
- Husky + lint-staged (pre-commit hooks)
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 1.1.1 | `npm create vite@latest nyatet-duwit -- --template react-ts` | 1 | Setup |
| 1.1.2 | Install dependencies: zustand, dexie, react-router, date-fns, lucide-react, @tanstack/react-virtual, clsx, tailwind-merge | 2 | Setup |
| 1.1.3 | Install dev dependencies: vitest, @testing-library/react, @testing-library/jest-dom, eslint, prettier, husky, lint-staged, vite-plugin-pwa | 2 | Setup |
| 1.1.4 | Configure Tailwind (tailwind.config.ts) dengan custom colors, fonts, dark mode | 2 | Config |
| 1.1.5 | Configure ESLint + Prettier rules | 1 | Config |
| 1.1.6 | Setup Husky pre-commit hook (lint + typecheck + test) | 1 | Config |
| 1.1.7 | Setup Vitest config + testing library | 1 | Config |
| 1.1.8 | Create folder structure | 1 | Setup |
| 1.1.9 | Verify `npm run dev` works, `npm run build` succeeds, `npm run test` passes | 1 | Verification |

**Folder Structure:**
```
src/
├── assets/              # Static assets (icons, images)
├── components/          # Reusable UI components
│   ├── ui/              # Primitives (Button, Input, Modal, etc.)
│   ├── layout/          # Layout components (BottomNav, Header, etc.)
│   └── finance/         # Finance-specific components
├── pages/               # Route-level components
│   ├── Home/            # Dashboard
│   ├── Transactions/    # Transaction list
│   ├── Insights/        # Monthly overview, category breakdown
│   └── More/            # Settings, accounts, categories, etc.
├── hooks/               # Custom React hooks
├── stores/              # Zustand stores
├── db/                  # Dexie database schema & queries
├── utils/               # Pure utility functions
├── types/               # TypeScript type definitions
├── constants/           # App constants (categories, icons, etc.)
├── styles/              # Global styles
└── App.tsx              # Root component
```

**Acceptance Criteria:**
- [ ] `npm run dev` starts dev server in < 3 seconds
- [ ] `npm run build` produces build in < 15 seconds
- [ ] `npm run test` runs with 0 failures
- [ ] `npm run lint` returns 0 errors
- [ ] `npm run typecheck` (tsc --noEmit) returns 0 errors
- [ ] Tailwind dark mode configured (class-based)
- [ ] Custom colors defined in tailwind.config (primary: #1E40AF, accent: #10B981, danger: #EF4444, neutral: #64748B)
- [ ] Pre-commit hook runs lint + typecheck before commit

**Dependencies:** None
**Risks:** Dependency version conflicts. Mitigation: use exact versions in package.json.

---

### US-1.2: Design System — UI Primitives

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Buat komponen UI dasar yang akan dipakai di seluruh app. Tidak ada styling fancy — hanya fungsional, accessible, dan konsisten.

**Components to Build:**

| Component | Props | Notes |
|---|---|---|
| `Button` | variant (primary/secondary/ghost/danger), size (sm/md/lg), disabled, loading, onClick, children | Loading state shows spinner, disabled state reduces opacity |
| `Input` | type, value, onChange, placeholder, error, label, helperText | Numeric keyboard for amount (inputMode="decimal") |
| `IconButton` | icon, size, variant, onClick, aria-label | Min 44x44px touch target |
| `Chip` | label, selected, onClick, icon, color | Horizontal scroll for categories |
| `Modal` | open, onClose, title, children | Bottom sheet style on mobile |
| `BottomSheet` | open, onClose, title, children | Slide up from bottom, snap points |
| `Toast` | message, type (success/error/info), duration, onClose | Auto-dismiss 3s, undo support |
| `EmptyState` | icon, title, description, action | Illustration + CTA button |
| `Skeleton` | width, height, lines | Loading placeholder |
| `Badge` | label, variant (default/success/warning/danger) | Small status indicator |

**Design Tokens:**
```typescript
// src/constants/tokens.ts
export const colors = {
  primary: { 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#1E40AF', 700: '#1D4ED8', 900: '#1E3A8A' },
  accent: { 50: '#ECFDF5', 500: '#10B981', 600: '#059669' },
  danger: { 50: '#FEF2F2', 500: '#EF4444', 600: '#DC2626' },
  neutral: { 50: '#F8FAFC', 100: '#F1F5F9', 500: '#64748B', 700: '#334155', 900: '#0F172A' },
};

export const spacing = { 4: '4px', 8: '8px', 12: '12px', 16: '16px', 20: '20px', 24: '24px', 32: '32px', 48: '48px' };
export const radius = { sm: '6px', md: '10px', lg: '16px', full: '9999px' };
export const shadows = { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 6px -1px rgba(0,0,0,0.1)', lg: '0 10px 15px -3px rgba(0,0,0,0.1)' };
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 1.2.1 | Create design tokens (colors, spacing, radius, shadows) | 2 | Code |
| 1.2.2 | Build Button component (4 variants, 3 sizes, loading state) | 2 | Code |
| 1.2.3 | Build Input component (with label, error, helper text) | 2 | Code |
| 1.2.4 | Build IconButton component | 1 | Code |
| 1.2.5 | Build Chip component (selectable, horizontal scroll ready) | 1 | Code |
| 1.2.6 | Build Modal component | 1 | Code |
| 1.2.7 | Build BottomSheet component (slide up animation) | 2 | Code |
| 1.2.8 | Build Toast component (with undo support) | 2 | Code |
| 1.2.9 | Build EmptyState component | 1 | Code |
| 1.2.10 | Build Skeleton component | 1 | Code |
| 1.2.11 | Build Badge component | 1 | Code |
| 1.2.12 | Write tests for Button, Input, Chip | 3 | Testing |
| 1.2.13 | Test all components in light + dark mode | 1 | Verification |

**Acceptance Criteria:**
- [ ] All 11 components render correctly
- [ ] All components accessible (ARIA labels, keyboard nav)
- [ ] All components work in light + dark mode
- [ ] Button loading state shows spinner, disables clicks
- [ ] Input with error shows red border + error message
- [ ] BottomSheet slides up with smooth animation (200ms ease-out)
- [ ] Toast auto-dismisses after 3 seconds
- [ ] Touch targets ≥ 44x44px for all interactive elements
- [ ] Tests pass for Button, Input, Chip

**Dependencies:** US-1.1
**Risks:** BottomSheet animation jank on low-end devices. Mitigation: use CSS transitions, not JS animation.

---

### US-1.3: Routing & Layout Shell

**Priority:** P0
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Setup routing dengan React Router dan layout shell dengan bottom navigation. 4 tab: Home, Transactions, Insights, More.

**Routes:**
```
/                    → Home (Dashboard)
/transactions        → Transaction List
/transactions/:id    → Transaction Detail/Edit
/insights            → Insights (Monthly Overview)
/more                → More (Settings hub)
/more/accounts       → Account Management
/more/categories     → Category Management
/more/budgets        → Budget Management
/more/recurring      → Recurring Transactions
/more/settings       → Settings
/more/backup         → Backup & Restore
```

**Layout Structure:**
```tsx
<AppLayout>
  <Header />          {/* Page title, optional back button */}
  <main>              {/* Page content, scrollable */}
    <Outlet />
  </main>
  <BottomNav />       {/* Fixed bottom, 4 tabs */}
  <FAB />             {/* Floating action button, bottom-right */}
</AppLayout>
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 1.3.1 | Install & configure React Router v6 | 1 | Setup |
| 1.3.2 | Create route definitions (all routes above) | 1 | Code |
| 1.3.3 | Create AppLayout component | 2 | Code |
| 1.3.4 | Create BottomNav component (4 tabs, active indicator) | 2 | Code |
| 1.3.5 | Create Header component (dynamic title, back button) | 1 | Code |
| 1.3.6 | Create FAB component (animated, bottom-right) | 1 | Code |
| 1.3.7 | Create placeholder pages (Home, Transactions, Insights, More) | 1 | Code |
| 1.3.8 | Implement route transitions (slide left/right, 200ms) | 2 | Code |
| 1.3.9 | Test navigation on mobile viewport | 1 | Verification |

**Acceptance Criteria:**
- [ ] All routes accessible via URL and navigation
- [ ] Bottom nav shows correct active tab
- [ ] FAB visible on Home and Transactions (hidden on Insights/More)
- [ ] Back button works on nested routes
- [ ] Route transitions smooth (no jank)
- [ ] Layout works on 320px–428px width
- [ ] Bottom nav fixed, content scrollable behind it

**Dependencies:** US-1.1, US-1.2
**Risks:** Route transitions may cause layout shift. Mitigation: use CSS transform, not layout-changing properties.

---

### US-1.4: Database Schema & Dexie Setup

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Setup Dexie.js dengan schema lengkap sesuai design document. Seed data untuk categories default.

**Database Schema:**
```typescript
// src/db/schema.ts
import Dexie, { type Table } from 'dexie';

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'savings';
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isPrimary: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  date: number;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringId?: string;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault: boolean;
  budgetLimit?: number;
  order: number;
  createdAt: number;
}

export interface RecurringTransaction {
  id: string;
  template: {
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    categoryId: string;
    accountId: string;
    toAccountId?: string;
    notes?: string;
  };
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: number;
  endDate?: number;
  isActive: boolean;
  lastGenerated?: number;
}

export interface AppSettings {
  key: string;
  value: string;
}

export class NyatetDuwitDB extends Dexie {
  accounts!: Table<Account, string>;
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  recurring!: Table<RecurringTransaction, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('nyatetduwit');
    this.version(1).stores({
      accounts: 'id, isPrimary, isArchived',
      transactions: 'id, type, categoryId, accountId, date, isRecurring, synced',
      categories: 'id, type, isDefault',
      recurring: 'id, frequency, isActive, lastGenerated',
      settings: 'key',
    });
  }
}

export const db = new NyatetDuwitDB();
```

**Default Categories (Seed):**
```typescript
// src/constants/defaultCategories.ts
export const DEFAULT_CATEGORIES = [
  // Expense
  { id: 'cat-food', name: 'Makan & Minum', type: 'expense', icon: 'utensils', color: '#F59E0B', order: 1 },
  { id: 'cat-transport', name: 'Transport', type: 'expense', icon: 'car', color: '#3B82F6', order: 2 },
  { id: 'cat-shopping', name: 'Belanja', type: 'expense', icon: 'shopping-bag', color: '#8B5CF6', order: 3 },
  { id: 'cat-entertainment', name: 'Hiburan', type: 'expense', icon: 'gamepad-2', color: '#EC4899', order: 4 },
  { id: 'cat-bills', name: 'Tagihan', type: 'expense', icon: 'receipt', color: '#6366F1', order: 5 },
  { id: 'cat-health', name: 'Kesehatan', type: 'expense', icon: 'heart-pulse', color: '#EF4444', order: 6 },
  { id: 'cat-education', name: 'Pendidikan', type: 'expense', icon: 'graduation-cap', color: '#14B8A6', order: 7 },
  { id: 'cat-other-expense', name: 'Lainnya', type: 'expense', icon: 'ellipsis', color: '#64748B', order: 8 },
  // Income
  { id: 'cat-salary', name: 'Gaji', type: 'income', icon: 'banknote', color: '#10B981', order: 1 },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', icon: 'laptop', color: '#06B6D4', order: 2 },
  { id: 'cat-investment', name: 'Investasi', type: 'income', icon: 'trending-up', color: '#84CC16', order: 3 },
  { id: 'cat-other-income', name: 'Lainnya', type: 'income', icon: 'ellipsis', color: '#64748B', order: 4 },
];
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 1.4.1 | Create Dexie database class with schema | 2 | Code |
| 1.4.2 | Create TypeScript interfaces for all entities | 1 | Code |
| 1.4.3 | Create seed function for default categories | 2 | Code |
| 1.4.4 | Create seed function for default account (Cash) | 1 | Code |
| 1.4.5 | Create seed function for default settings | 1 | Code |
| 1.4.6 | Create database initialization hook (runs on app start) | 2 | Code |
| 1.4.7 | Create repository layer (db.accounts.add, db.transactions.where, etc.) | 3 | Code |
| 1.4.8 | Write unit tests for repository layer | 3 | Testing |
| 1.4.9 | Test seed data populates correctly on first run | 1 | Verification |
| 1.4.10 | Test database migration (version bump) | 1 | Verification |

**Acceptance Criteria:**
- [ ] Database initializes on first app load
- [ ] 12 default categories seeded (8 expense, 4 income)
- [ ] 1 default account (Cash, balance 0) seeded
- [ ] Default settings seeded (currency: IDR, reminder_time: 20:00)
- [ ] Repository layer provides clean API for CRUD operations
- [ ] Unit tests pass for all repository methods
- [ ] Database migration works (version 1 → version 2 test)
- [ ] No data loss on app restart

**Dependencies:** US-1.1
**Risks:** Dexie schema migration can be tricky. Mitigation: test migration path early, keep schema stable.

---

### US-1.5: State Management Setup (Zustand)

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Setup Zustand stores untuk app state yang tidak disimpan di IndexedDB (UI state, transient state).

**Stores:**

```typescript
// stores/uiStore.ts — UI state
interface UIState {
  bottomSheet: { open: boolean; content: React.ReactNode } | null;
  toast: { message: string; type: 'success' | 'error' | 'info'; undo?: () => void } | null;
  loading: boolean;
  openBottomSheet: (content: React.ReactNode) => void;
  closeBottomSheet: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info', undo?: () => void) => void;
  hideToast: () => void;
  setLoading: (loading: boolean) => void;
}

// stores/transactionStore.ts — Transaction form state
interface TransactionFormState {
  type: 'income' | 'expense' | 'transfer';
  amount: string;
  categoryId: string | null;
  accountId: string | null;
  toAccountId: string | null;
  date: number;
  notes: string;
  reset: () => void;
  setField: (field: string, value: any) => void;
}

// stores/appStore.ts — App-level state
interface AppState {
  lastUsedCategoryId: string | null;
  lastUsedAccountId: string | null;
  lastTransactionType: 'income' | 'expense' | 'transfer';
  updateLastUsed: (categoryId: string, accountId: string, type: string) => void;
}
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 1.5.1 | Create uiStore (bottomSheet, toast, loading) | 2 | Code |
| 1.5.2 | Create transactionFormStore (form state management) | 2 | Code |
| 1.5.3 | Create appStore (last used defaults) | 1 | Code |
| 1.5.4 | Write tests for all stores | 2 | Testing |
| 1.5.5 | Integrate stores with UI components | 1 | Integration |

**Acceptance Criteria:**
- [ ] All 3 stores created and typed
- [ ] Store actions work correctly (set, reset, update)
- [ ] No unnecessary re-renders (selective subscriptions)
- [ ] Tests pass for all stores
- [ ] Toast shows and auto-dismisses
- [ ] BottomSheet opens and closes smoothly

**Dependencies:** US-1.1, US-1.2
**Risks:** Zustand re-renders if not careful with selectors. Mitigation: use shallow comparison, selective subscriptions.

---

### US-1.6: Utility Functions & Constants

**Priority:** P1
**Story Points:** 3
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Buat utility functions yang akan dipakai di seluruh app.

**Utilities:**

| Function | Purpose |
|---|---|
| `formatCurrency(amount: number, currency?: string)` | Format IDR: "Rp 15.000" |
| `formatDate(timestamp: number, format?: string)` | Format date: "19 Mei 2026" |
| `formatDateShort(timestamp: number)` | Short date: "19 Mei" |
| `formatDateRelative(timestamp: number)` | Relative: "Hari ini", "Kemarin" |
| `generateId()` | UUID v4 generation |
| `startOfDay(timestamp: number)` | Get start of day timestamp |
| `startOfMonth(timestamp: number)` | Get start of month timestamp |
| `getMonthRange(timestamp: number)` | Get start/end of month |
| `debounce(fn, delay)` | Debounce function |
| `throttle(fn, delay)` | Throttle function |
| `vibrate(pattern)` | navigator.vibrate wrapper with fallback |
| `getCategoryIcon(iconName: string)` | Map icon name to Lucide component |

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 1.6.1 | Create currency formatter (IDR) | 1 | Code |
| 1.6.2 | Create date formatters (using date-fns) | 1 | Code |
| 1.6.3 | Create ID generator | 0.5 | Code |
| 1.6.4 | Create date range utilities | 1 | Code |
| 1.6.5 | Create debounce/throttle utilities | 0.5 | Code |
| 1.6.6 | Create haptic feedback wrapper | 0.5 | Code |
| 1.6.7 | Create icon mapper | 0.5 | Code |
| 1.6.8 | Write unit tests for all utilities | 2 | Testing |

**Acceptance Criteria:**
- [ ] formatCurrency(15000) → "Rp 15.000"
- [ ] formatCurrency(1500000) → "Rp 1.500.000"
- [ ] formatDateRelative(today) → "Hari ini"
- [ ] formatDateRelative(yesterday) → "Kemarin"
- [ ] getMonthRange(Date.now()) returns correct start/end
- [ ] vibrate() works on Android, no-op on desktop
- [ ] All unit tests pass

**Dependencies:** US-1.1
**Risks:** date-fns locale for Indonesian (id). Mitigation: import locale/id from date-fns.

---

### Sprint 1 Deliverables Checklist

- [ ] Project scaffold complete (US-1.1)
- [ ] 11 UI primitive components (US-1.2)
- [ ] Routing with 4-tab bottom nav (US-1.3)
- [ ] Dexie database with schema + seed data (US-1.4)
- [ ] 3 Zustand stores (US-1.5)
- [ ] 12 utility functions (US-1.6)
- [ ] All tests pass
- [ ] Lighthouse: Performance ≥ 90, Best Practices ≥ 90
- [ ] Bundle size < 50KB gzipped (baseline)

---

## 4. SPRINT 2: DATABASE & CORE CRUD

**Week:** 3
**Theme:** "Transaction CRUD, category seed, account seed"
**Story Points:** 40

### Sprint Goal

User bisa menambah, mengedit, dan menghapus transaksi. Form quick add bekerja dengan smart defaults. Ini adalah fitur paling kritis — tanpa ini app tidak ada gunanya.

---

### US-2.1: Quick Add Transaction Form

**Priority:** P0 (CRITICAL)
**Story Points:** 13
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Form transaksi yang bisa diisi dalam < 3 detik. Amount first, category chips horizontal, smart defaults. Ini adalah core interaction dari seluruh app.

**UX Flow:**
```
Tap FAB → BottomSheet slides up
        → Amount input auto-focus (numeric keyboard)
        → User types amount
        → Category chips visible below (horizontal scroll)
        → User taps category (default: last used)
        → Tap "Simpan" → Transaction saved → BottomSheet closes → Toast "Tersimpan"
```

**Form Fields:**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| Type | Toggle (Income/Expense/Transfer) | Yes | Expense | 3-segment toggle |
| Amount | Number input | Yes | Empty | Auto-focus, inputMode="decimal", format on blur |
| Category | Chip horizontal scroll | Yes | Last used | Only show categories matching type |
| Account | Dropdown/selector | Yes | Primary / Last used | Hidden for transfer (shows from/to) |
| To Account | Dropdown/selector | Conditional | — | Only for transfer type |
| Date | Date picker | Yes | Today | Default today, swipe to change |
| Notes | Text input | No | Empty | Optional, expandable |

**Smart Defaults Logic:**
```typescript
// When form opens:
type = appStore.lastTransactionType || 'expense'
amount = ''
categoryId = appStore.lastUsedCategoryId || firstCategoryForType(type)
accountId = appStore.lastUsedAccountId || primaryAccount.id
date = startOfDay(Date.now())
notes = ''
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 2.1.1 | Create TransactionForm component (BottomSheet-based) | 3 | Code |
| 2.1.2 | Implement type toggle (Income/Expense/Transfer) | 2 | Code |
| 2.1.3 | Implement amount input (auto-focus, numeric keyboard, format on blur) | 2 | Code |
| 2.1.4 | Implement category chip selector (horizontal scroll, filtered by type) | 2 | Code |
| 2.1.5 | Implement account selector (dropdown, default primary) | 2 | Code |
| 2.1.6 | Implement transfer mode (from/to account selector) | 2 | Code |
| 2.1.7 | Implement date picker (default today, date-fns) | 2 | Code |
| 2.1.8 | Implement notes field (optional, expandable) | 1 | Code |
| 2.1.9 | Implement form validation (amount > 0, category selected) | 2 | Code |
| 2.1.10 | Implement save logic (optimistic write to IndexedDB) | 2 | Code |
| 2.1.11 | Implement smart defaults (last used category/account) | 2 | Code |
| 2.1.12 | Implement haptic feedback on save | 1 | Code |
| 2.1.13 | Implement undo toast after save (3 second window) | 2 | Code |
| 2.1.14 | Write tests for form validation | 2 | Testing |
| 2.1.15 | Write tests for save flow | 2 | Testing |
| 2.1.16 | Test on low-end device (form open < 200ms, save < 100ms) | 1 | Verification |

**Acceptance Criteria:**
- [ ] Form opens in < 200ms (BottomSheet animation)
- [ ] Amount input auto-focuses on open
- [ ] Numeric keyboard appears on Android
- [ ] Amount formats on blur (15000 → "15.000")
- [ ] Category chips show only matching type (expense categories for expense)
- [ ] Last used category highlighted/first
- [ ] Save button disabled until amount > 0 and category selected
- [ ] Transaction saved to IndexedDB on submit
- [ ] BottomSheet closes after save
- [ ] Toast "Tersimpan" appears with undo option
- [ ] Undo deletes transaction if tapped within 3 seconds
- [ ] Smart defaults work correctly (last used category, account, type)
- [ ] Transfer mode shows from/to account selectors
- [ ] Form resets after save (except smart defaults)
- [ ] Haptic feedback fires on save (Android)
- [ ] Total flow: open → type amount → select category → save = < 3 seconds

**Dependencies:** US-1.2, US-1.3, US-1.4, US-1.5, US-1.6
**Risks:** 
- BottomSheet keyboard interaction on mobile. Mitigation: adjust bottom inset on keyboard open.
- Form state sync with Zustand. Mitigation: reset form on close.

---

### US-2.2: Transaction Repository (CRUD Operations)

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Lengkapkan repository layer untuk Transaction dengan semua operasi CRUD, termasuk balance update otomatis.

**Repository Methods:**

```typescript
// src/db/transactionRepository.ts
export const transactionRepo = {
  // Create
  async create(tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<Transaction>

  // Read
  async getById(id: string): Promise<Transaction | undefined>
  async getAll(options?: { limit?: number; offset?: number; type?: string; categoryId?: string; accountId?: string; dateFrom?: number; dateTo?: number }): Promise<Transaction[]>
  async getByDateRange(from: number, to: number): Promise<Transaction[]>
  async getByMonth(year: number, month: number): Promise<Transaction[]>
  async search(query: string): Promise<Transaction[]>

  // Update
  async update(id: string, data: Partial<Transaction>): Promise<Transaction>

  // Delete
  async delete(id: string): Promise<void>

  // Aggregate
  async getTotalByType(type: 'income' | 'expense', dateFrom: number, dateTo: number): Promise<number>
  async getTotalByCategory(dateFrom: number, dateTo: number): Promise<{ categoryId: string; total: number }[]>
  async getDailySpending(dateFrom: number, dateTo: number): Promise<{ date: number; total: number }[]>
}
```

**Balance Update Logic:**
```typescript
// When transaction is created/updated/deleted:
// 1. For expense: decrease source account balance
// 2. For income: increase source account balance
// 3. For transfer: decrease from account, increase to account
// 4. All in a single Dexie transaction (atomic)
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 2.2.1 | Implement create with balance update | 2 | Code |
| 2.2.2 | Implement getAll with filtering/pagination | 2 | Code |
| 2.2.3 | Implement getByDateRange | 1 | Code |
| 2.2.4 | Implement getByMonth | 1 | Code |
| 2.2.5 | Implement search (by notes, amount, category name) | 2 | Code |
| 2.2.6 | Implement update with balance recalculation | 2 | Code |
| 2.2.7 | Implement delete with balance reversal | 2 | Code |
| 2.2.8 | Implement aggregate methods (getTotalByType, getByCategory, getDailySpending) | 2 | Code |
| 2.2.9 | Write unit tests for all repository methods | 3 | Testing |
| 2.2.10 | Test atomic transactions (Dexie.transaction) | 1 | Verification |

**Acceptance Criteria:**
- [ ] create() saves transaction AND updates account balance atomically
- [ ] getAll() supports all filter options
- [ ] search() finds transactions by notes, amount, category name
- [ ] update() recalculates affected account balances
- [ ] delete() reverses balance changes
- [ ] Aggregate methods return correct totals
- [ ] All operations work within Dexie.transaction (atomic)
- [ ] Unit tests cover all methods + edge cases
- [ ] No balance inconsistency after CRUD operations

**Dependencies:** US-1.4
**Risks:** Balance inconsistency if operation fails mid-way. Mitigation: Dexie.transaction ensures atomicity.

---

### US-2.3: Edit & Delete Transaction

**Priority:** P0
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
User bisa edit dan hapus transaksi yang sudah dibuat. Swipe gesture di list, atau tap untuk edit.

**UX:**
- Swipe left → Delete confirmation toast (undo)
- Swipe right → Open edit form (pre-filled)
- Tap transaction → Open detail view → Edit button

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 2.3.1 | Implement swipe gestures on transaction list items | 2 | Code |
| 2.3.2 | Implement edit flow (open form pre-filled) | 2 | Code |
| 2.3.3 | Implement delete with undo toast | 1 | Code |
| 2.3.4 | Handle balance recalculation on edit/delete | 1 | Code |
| 2.3.5 | Write tests for edit and delete flows | 2 | Testing |

**Acceptance Criteria:**
- [ ] Swipe left reveals delete action
- [ ] Swipe right reveals edit action
- [ ] Delete shows undo toast (3 seconds)
- [ ] Undo restores deleted transaction
- [ ] Edit opens form pre-filled with transaction data
- [ ] Save edit updates transaction AND recalculates balance
- [ ] Balance correct after edit and delete

**Dependencies:** US-2.1, US-2.2
**Risks:** Swipe gesture conflicts with scroll. Mitigation: use react-swipeable or custom touch handler with threshold.

---

### US-2.4: Transaction List (Basic)

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Tampilkan daftar transaksi dengan virtualized list. Group by date. Smooth scroll 60fps.

**UX:**
```
Header: "Transaksi"
Date Group: "Hari ini — 19 Mei 2026"
  ├── [icon] Makan Siang          -Rp 25.000
  ├── [icon] Grab ke Kantor       -Rp 15.000
  └── [icon] Gaji Bulanan      +Rp 8.000.000

Date Group: "Kemarin — 18 Mei 2026"
  ├── [icon] Kopi                 -Rp 18.000
  └── [icon] Transfer ke GoPay  (Transfer)
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 2.4.1 | Create TransactionItem component | 2 | Code |
| 2.4.2 | Implement date grouping | 2 | Code |
| 2.4.3 | Integrate @tanstack/react-virtual for virtualization | 2 | Code |
| 2.4.4 | Implement pull-to-refresh (optional, for future sync) | 1 | Code |
| 2.4.5 | Implement empty state | 1 | Code |
| 2.4.6 | Write tests for list rendering | 2 | Testing |
| 2.4.7 | Test scroll performance with 1000 items | 1 | Verification |

**Acceptance Criteria:**
- [ ] Transactions grouped by date (today, yesterday, date)
- [ ] Each item shows: icon, name (category), amount (color-coded), time
- [ ] Income = green, Expense = red, Transfer = blue
- [ ] Virtualized list renders smoothly with 1000+ items
- [ ] Scroll at 60fps on low-end device
- [ ] Empty state shows illustration + "Tambah transaksi pertama" CTA
- [ ] Swipe gestures work (US-2.3)

**Dependencies:** US-2.2
**Risks:** Virtualization with variable height items. Mitigation: estimate size, use dynamic sizing.

---

### US-2.5: Account Repository & Balance Management

**Priority:** P0
**Story Points:** 6
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Repository untuk Account dengan CRUD dan balance management.

**Repository Methods:**
```typescript
export const accountRepo = {
  async getAll(activeOnly?: boolean): Promise<Account[]>
  async getById(id: string): Promise<Account | undefined>
  async getPrimary(): Promise<Account | undefined>
  async create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account>
  async update(id: string, data: Partial<Account>): Promise<Account>
  async updateBalance(id: string, newBalance: number): Promise<Account>
  async getTotalBalance(): Promise<number>
  async archive(id: string): Promise<void>
}
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 2.5.1 | Implement account repository methods | 2 | Code |
| 2.5.2 | Implement getTotalBalance (sum all active accounts) | 1 | Code |
| 2.5.3 | Implement balance update (called by transaction operations) | 1 | Code |
| 2.5.4 | Write unit tests | 2 | Testing |
| 2.5.5 | Test balance consistency with transactions | 1 | Verification |

**Acceptance Criteria:**
- [ ] getAll() returns accounts sorted by order
- [ ] getPrimary() returns the primary account
- [ ] getTotalBalance() sums all active account balances
- [ ] updateBalance() persists correctly
- [ ] Balance stays consistent after transaction CRUD
- [ ] Archive hides account from normal queries

**Dependencies:** US-1.4
**Risks:** Balance drift over time. Mitigation: periodic balance reconciliation (sum all transactions per account).

---

### Sprint 2 Deliverables Checklist

- [ ] Quick Add Transaction Form (US-2.1)
- [ ] Transaction Repository with all CRUD + aggregates (US-2.2)
- [ ] Edit & Delete with swipe gestures (US-2.3)
- [ ] Virtualized Transaction List (US-2.4)
- [ ] Account Repository & Balance Management (US-2.5)
- [ ] All tests pass (coverage ≥ 70%)
- [ ] Transaction flow works end-to-end: add → list → edit → delete
- [ ] Balance stays consistent after all operations
- [ ] Form completes in < 3 seconds (measured)

---

## 5. SPRINT 3: DASHBOARD & TRANSACTION LIST

**Week:** 4
**Theme:** "Home screen, virtualized list, date filter"
**Story Points:** 38

### Sprint Goal

Dashboard menampilkan ringkasan keuangan yang meaningful. Transaction list lengkap dengan filter. User bisa lihat big picture dan detail dalam 1 tap.

---

### US-3.1: Dashboard — Home Screen

**Priority:** P0
**Story Points:** 13
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Halaman utama yang menampilkan total balance, spending hari ini, transaksi terakhir, dan quick actions. Ini adalah first screen yang user lihat setiap kali buka app.

**Layout:**
```
┌────────────────────────────────────┐
│ [Streak 🔥 7]              [⚙️]   │
│                                    │
│  Total Balance                     │
│  Rp 2.450.000                      │
│  ▲ +Rp 500.000 bulan ini           │
│                                    │
│  ┌──────────┬──────────┐           │
│  │ Pemasukan│ Pengeluaran│          │
│  │ Rp 8.000K│ Rp 5.550K │          │
│  └──────────┴──────────┘           │
│                                    │
│  Budget Progress                   │
│  ━━━━━━━━━━░░░░ 65%                │
│                                    │
│  Transaksi Terakhir                │
│  ├── Makan Siang    -Rp 25.000     │
│  ├── Grab           -Rp 15.000     │
│  └── Gaji          +Rp 8.000.000   │
│                                    │
│  [Lihat Semua →]                   │
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 3.1.1 | Create Dashboard page layout | 2 | Code |
| 3.1.2 | Implement total balance card (sum all accounts) | 2 | Code |
| 3.1.3 | Implement monthly income/expense summary | 2 | Code |
| 3.1.4 | Implement month-over-month change indicator (▲/▼) | 2 | Code |
| 3.1.5 | Implement budget progress bar (if budgets exist) | 2 | Code |
| 3.1.6 | Implement recent transactions list (last 5) | 2 | Code |
| 3.1.7 | Implement streak counter display | 2 | Code |
| 3.1.8 | Implement "Lihat Semua" link to Transactions page | 1 | Code |
| 3.1.9 | Implement empty state (no transactions yet) | 1 | Code |
| 3.1.10 | Optimize render performance (useMemo, React.memo) | 2 | Performance |
| 3.1.11 | Test dashboard render time < 200ms | 1 | Verification |

**Acceptance Criteria:**
- [ ] Total balance displays correctly (sum of all active accounts)
- [ ] Monthly income/expense shows current month totals
- [ ] Month-over-month change compares with previous month
- [ ] Budget progress bar shows if budgets are set
- [ ] Recent transactions show last 5, sorted by date desc
- [ ] Streak counter displays current streak
- [ ] Empty state shows when no transactions exist
- [ ] Dashboard renders in < 200ms
- [ ] All data updates in real-time after transaction CRUD

**Dependencies:** US-2.2, US-2.4, US-2.5
**Risks:** Dashboard queries can be slow with many transactions. Mitigation: use indexed queries, aggregate at DB level.

---

### US-3.2: Transaction List — Filters & Sort

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Transaction list dengan filter by date, category, account, dan type. Sort by date or amount.

**Filter UI:**
```
[Filter ▼] [Sort ▼]

Filter Modal:
├── Date Range: [Hari Ini] [Minggu Ini] [Bulan Ini] [Custom]
├── Type: [Semua] [Pemasukan] [Pengeluaran] [Transfer]
├── Category: [Semua] [Makan] [Transport] [Belanja] ...
└── Account: [Semua] [Cash] [BCA] [GoPay]
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 3.2.1 | Create filter state management (Zustand) | 1 | Code |
| 3.2.2 | Implement filter UI (modal with options) | 2 | Code |
| 3.2.3 | Implement date range filter (today, week, month, custom) | 2 | Code |
| 3.2.4 | Implement type filter (income/expense/transfer) | 1 | Code |
| 3.2.5 | Implement category filter | 1 | Code |
| 3.2.6 | Implement account filter | 1 | Code |
| 3.2.7 | Implement sort (date desc/asc, amount desc/asc) | 1 | Code |
| 3.2.8 | Connect filters to repository queries | 2 | Code |
| 3.2.9 | Implement active filter indicator (badge count) | 1 | Code |
| 3.2.10 | Write tests for filter logic | 2 | Testing |

**Acceptance Criteria:**
- [ ] Filter modal opens from Transactions page
- [ ] Date range filter works (today shows only today's transactions)
- [ ] Type filter works (income only shows income)
- [ ] Category filter works
- [ ] Account filter works
- [ ] Multiple filters can be combined
- [ ] Sort works (date desc is default)
- [ ] Active filter count shown as badge
- [ ] Clear all filters option available
- [ ] Filtered list updates instantly

**Dependencies:** US-2.4, US-2.2
**Risks:** Multiple filter combinations can create slow queries. Mitigation: use IndexedDB indexes, avoid full table scans.

---

### US-3.3: Transaction Detail View

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Tampilan detail transaksi saat user tap item di list. Bisa edit atau delete dari sini.

**Layout:**
```
┌────────────────────────────────────┐
│ ← Detail Transaksi          [Edit] │
│                                    │
│         -Rp 25.000                 │
│         Makan Siang                │
│         Makan & Minum              │
│                                    │
│  Tanggal    19 Mei 2026            │
│  Akun       Cash                   │
│  Tipe       Pengeluaran            │
│  Catatan    Makan di warteg dekat  │
│             kantor                 │
│                                    │
│  ┌──────────────────────────────┐  │
│  │       Hapus Transaksi        │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 3.3.1 | Create TransactionDetail page | 2 | Code |
| 3.3.2 | Display all transaction fields | 1 | Code |
| 3.3.3 | Link to edit form (pre-filled) | 1 | Code |
| 3.3.4 | Implement delete with confirmation | 1 | Code |
| 3.3.5 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] All transaction fields displayed
- [ ] Amount color-coded (green/red/blue)
- [ ] Category name and icon shown
- [ ] Account name shown
-  [ ] Notes displayed (if exists)
- [ ] Edit button opens form pre-filled
- [ ] Delete button removes transaction with undo

**Dependencies:** US-2.1, US-2.3
**Risks:** None significant.

---

### US-3.4: FAB (Floating Action Button)

**Priority:** P0
**Story Points:** 3
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
FAB yang selalu visible di Home dan Transactions. Tap untuk quick add. Double-tap untuk quick add dengan kategori terakhir.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 3.4.1 | Create FAB component (animated, bottom-right) | 1 | Code |
| 3.4.2 | Show/hide based on route (visible on Home/Transactions) | 1 | Code |
| 3.4.3 | Implement single tap → open quick add form | 1 | Code |
| 3.4.4 | Implement double tap → quick add with last category | 2 | Code |
| 3.4.5 | Add haptic feedback on tap | 1 | Code |

**Acceptance Criteria:**
- [ ] FAB visible on Home and Transactions pages
- [ ] FAB hidden on Insights and More pages
- [ ] Single tap opens quick add form
- [ ] Double tap (within 300ms) opens form with last category pre-selected
- [ ] FAB animates on scroll (hide on scroll down, show on scroll up)
- [ ] Haptic feedback on tap

**Dependencies:** US-1.3, US-2.1
**Risks:** Double-tap vs scroll conflict. Mitigation: use gesture library with proper threshold.

---

### US-3.5: Empty States & Onboarding Prompt

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Empty state yang actionable. Saat user pertama kali buka app tanpa data, tampilkan onboarding prompt.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 3.5.1 | Create empty state for Dashboard | 1 | Code |
| 3.5.2 | Create empty state for Transaction List | 1 | Code |
| 3.5.3 | Create empty state for Insights | 1 | Code |
| 3.5.4 | Implement first-time user prompt ("Tambah transaksi pertama") | 2 | Code |
| 3.5.5 | Track first transaction flag (settings) | 1 | Code |
| 3.5.6 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] Dashboard empty state shows illustration + CTA
- [ ] Transaction list empty state shows illustration + CTA
- [ ] Insights empty state shows "Belum ada data" message
- [ ] First-time user sees prompt to add first transaction
- [ ] After first transaction, prompt disappears permanently
- [ ] CTA opens quick add form directly

**Dependencies:** US-3.1, US-2.1
**Risks:** None significant.

---

### US-3.6: Loading States & Error Boundaries

**Priority:** P1
**Story Points:** 4
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Skeleton loading untuk semua pages. Error boundary untuk catch runtime errors.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 3.6.1 | Create skeleton for Dashboard | 1 | Code |
| 3.6.2 | Create skeleton for Transaction List | 1 | Code |
| 3.6.3 | Create skeleton for Insights | 1 | Code |
| 3.6.4 | Implement ErrorBoundary component | 2 | Code |
| 3.6.5 | Wrap all routes with ErrorBoundary | 1 | Code |

**Acceptance Criteria:**
- [ ] Skeleton shows while data loads
- [ ] Skeleton matches final layout (no layout shift)
- [ ] Error boundary catches runtime errors
- [ ] Error state shows friendly message + retry button
- [ ] No white screen on errors

**Dependencies:** US-1.2, US-3.1, US-2.4
**Risks:** None significant.

---

### Sprint 3 Deliverables Checklist

- [ ] Dashboard with balance, summary, recent transactions (US-3.1)
- [ ] Transaction list with filters and sort (US-3.2)
- [ ] Transaction detail view (US-3.3)
- [ ] FAB with single/double tap (US-3.4)
- [ ] Empty states for all pages (US-3.5)
- [ ] Loading skeletons + error boundaries (US-3.6)
- [ ] All tests pass
- [ ] Dashboard renders < 200ms
- [ ] List scrolls 60fps with 1000 items

---

## 6. SPRINT 4: ACCOUNTS, CATEGORIES & TRANSFER

**Week:** 5
**Theme:** "Account management, category management, transfer flow"
**Story Points:** 36

### Sprint Goal

User bisa manage akun (tambah, edit, hapus) dan kategori (tambah, edit, reorder). Transfer antar akun bekerja dengan benar.

---

### US-4.1: Account Management Page

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Halaman untuk manage semua akun. Tambah, edit, hapus, set primary, archive.

**Layout:**
```
┌────────────────────────────────────┐
│ ← Akun                       [+]  │
│                                    │
│  Total: Rp 2.450.000               │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 💵 Cash              Rp 500K │  │
│  │    Primary                   │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ 🏦 BCA             Rp 1.500K │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ 💳 GoPay             Rp 450K │  │
│  └──────────────────────────────┘  │
│                                    │
│  [Tambah Akun]                     │
└────────────────────────────────────┘
```

**Account Types:**
- Cash (💵)
- Bank (🏦)
- E-Wallet (💳)
- Savings (🏧)

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 4.1.1 | Create AccountList page | 1 | Code |
| 4.1.2 | Display account cards with balance | 1 | Code |
| 4.1.3 | Display total balance header | 1 | Code |
| 4.1.4 | Implement add account form (BottomSheet) | 2 | Code |
| 4.1.5 | Implement edit account form | 1 | Code |
| 4.1.6 | Implement delete account (with balance check) | 2 | Code |
| 4.1.7 | Implement set primary account | 1 | Code |
| 4.1.8 | Implement archive account | 1 | Code |
| 4.1.9 | Prevent delete if account has transactions | 1 | Code |
| 4.1.10 | Write tests | 2 | Testing |

**Acceptance Criteria:**
- [ ] All accounts listed with name, icon, balance
- [ ] Total balance shown at top
- [ ] Primary account marked with badge
- [ ] Add account form with name, type, icon, color, initial balance
- [ ] Edit account form pre-filled
- [ ] Delete account blocked if transactions exist (show error)
- [ ] Set primary works (only 1 primary at a time)
- [ ] Archive hides account from normal views
- [ ] Account type icons correct

**Dependencies:** US-2.5
**Risks:** Deleting account with transactions. Mitigation: block delete, suggest archive instead.

---

### US-4.2: Category Management Page

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Halaman untuk manage kategori. Tambah, edit, hapus, reorder. Default categories tidak bisa dihapus.

**Layout:**
```
┌────────────────────────────────────┐
│ ← Kategori                   [+]  │
│                                    │
│  Pengeluaran                       │
│  ├── 🍽️ Makan & Minum       [✏️]  │
│  ├── 🚗 Transport           [✏️]  │
│  ├── 🛍️ Belanja             [✏️]  │
│  ├── 🎮 Hiburan             [✏️]  │
│  ├── 🧾 Tagihan             [✏️]  │
│  ├── ❤️ Kesehatan           [✏️]  │
│  ├── 🎓 Pendidikan          [✏️]  │
│  └── ⋯ Lainnya              [✏️]  │
│                                    │
│  Pemasukan                         │
│  ├── 💰 Gaji                [✏️]  │
│  ├── 💻 Freelance           [✏️]  │
│  ├── 📈 Investasi           [✏️]  │
│  └── ⋯ Lainnya              [✏️]  │
│                                    │
│  [Tambah Kategori]                 │
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 4.2.1 | Create CategoryList page | 1 | Code |
| 4.2.2 | Group categories by type (income/expense) | 1 | Code |
| 4.2.3 | Display category cards with icon, color | 1 | Code |
| 4.2.4 | Implement add category form | 2 | Code |
| 4.2.5 | Implement edit category form | 1 | Code |
| 4.2.6 | Implement delete category (with transaction check) | 2 | Code |
| 4.2.7 | Prevent delete default categories | 1 | Code |
| 4.2.8 | Implement reorder (drag or up/down buttons) | 2 | Code |
| 4.2.9 | Write tests | 2 | Testing |

**Acceptance Criteria:**
- [ ] Categories grouped by income/expense
- [ ] Default categories shown with lock icon (can't delete)
- [ ] Add category form: name, icon picker, color picker, type
- [ ] Edit category form pre-filled
- [ ] Delete blocked if category has transactions
- [ ] Delete blocked for default categories
- [ ] Reorder changes display order in form chips
- [ ] Icon picker shows relevant icons (Lucide)
- [ ] Color picker shows preset colors

**Dependencies:** US-1.4
**Risks:** Reorder UX on mobile. Mitigation: use up/down buttons instead of drag (easier on touch).

---

### US-4.3: Transfer Flow

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Transfer antar akun. Bukan income, bukan expense — hanya perpindahan. Balance source turun, balance destination naik.

**UX Flow:**
```
Tap FAB → Select "Transfer" type
        → Select "Dari" account
        → Select "Ke" account
        → Enter amount
        → Add notes (optional)
        → Save
```

**Validation:**
- From account ≠ To account
- From account balance ≥ amount
- Both accounts must be active (not archived)

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 4.3.1 | Extend TransactionForm for transfer mode | 2 | Code |
| 4.3.2 | Implement from/to account selectors | 2 | Code |
| 4.3.3 | Implement validation (same account, insufficient balance) | 2 | Code |
| 4.3.4 | Implement balance update (decrease from, increase to) | 2 | Code |
| 4.3.5 | Display transfer in list with special indicator | 1 | Code |
| 4.3.6 | Write tests for transfer flow | 2 | Testing |

**Acceptance Criteria:**
- [ ] Transfer type shows from/to selectors
- [ ] Cannot select same account for from and to
- [ ] Cannot transfer more than source balance
- [ ] Source balance decreases after transfer
- [ ] Destination balance increases after transfer
- [ ] Transfer shown in list with "→" indicator
- [ ] Transfer not counted in income/expense totals
- [ ] Edit/delete transfer recalculates both account balances

**Dependencies:** US-2.1, US-2.2, US-4.1
**Risks:** Balance inconsistency. Mitigation: Dexie.transaction for atomic update.

---

### US-4.4: Account Selector Component

**Priority:** P1
**Story Points:** 3
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Reusable component untuk memilih akun. Dipakai di transaction form, transfer form, dan filter.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 4.4.1 | Create AccountSelector component | 2 | Code |
| 4.4.2 | Show account name, icon, balance | 1 | Code |
| 4.4.3 | Filter out archived accounts | 1 | Code |

**Acceptance Criteria:**
- [ ] Shows account name, icon, and current balance
- [ ] Archived accounts excluded
- [ ] Primary account highlighted
- [ ] Works in BottomSheet context
- [ ] Accessible (keyboard nav, ARIA)

**Dependencies:** US-4.1
**Risks:** None significant.

---

### US-4.5: Category Icon & Color Picker

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Icon picker dan color picker untuk custom kategori.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 4.5.1 | Create IconPicker component (grid of Lucide icons) | 2 | Code |
| 4.5.2 | Create ColorPicker component (preset colors) | 2 | Code |
| 4.5.3 | Integrate with category add/edit form | 1 | Code |
| 4.5.4 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] IconPicker shows 30+ relevant icons in scrollable grid
- [ ] Icon selection updates preview
- [ ] ColorPicker shows 12 preset colors
- [ ] Color selection updates preview
- [ ] Preview shows category card with selected icon + color
- [ ] Works in BottomSheet

**Dependencies:** US-4.2
**Risks:** IconPicker can be heavy. Mitigation: lazy load, virtualize grid.

---

### US-4.6: Balance Reconciliation Utility

**Priority:** P2
**Story Points:** 4
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Utility untuk reconcile balance — hitung ulang balance semua akun berdasarkan semua transaksi. Berguna untuk debug dan fix balance drift.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 4.6.1 | Create reconcileBalances() function | 2 | Code |
| 4.6.2 | Sum all transactions per account (income - expense - transfer out + transfer in) | 2 | Code |
| 4.6.3 | Update account balances | 1 | Code |
| 4.6.4 | Add to Settings (hidden, for debug) | 1 | Code |

**Acceptance Criteria:**
- [ ] reconcileBalances() recalculates all account balances
- [ ] Result matches expected balance from transaction history
- [ ] Runs within Dexie.transaction (atomic)
- [ ] Accessible from Settings (debug section)

**Dependencies:** US-2.2, US-2.5
**Risks:** None significant.

---

### Sprint 4 Deliverables Checklist

- [ ] Account management page (US-4.1)
- [ ] Category management page (US-4.2)
- [ ] Transfer flow with balance update (US-4.3)
- [ ] Account selector component (US-4.4)
- [ ] Icon & color picker (US-4.5)
- [ ] Balance reconciliation utility (US-4.6)
- [ ] All tests pass
- [ ] Transfer balance atomic (no inconsistency)
- [ ] Default categories cannot be deleted

---

## 7. SPRINT 5: BUDGET & RECURRING

**Week:** 6
**Theme:** "Budget per category, recurring transaction engine"
**Story Points:** 34

### Sprint Goal

User bisa set budget per kategori dan dapat visual feedback. Recurring transaction otomatis generate transaksi rutin setiap bulan.

---

### US-5.1: Budget Setup per Category

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
User bisa set monthly budget limit per kategori expense.

**UX Flow:**
```
More → Budgets → [Tambah Budget]
  → Select category
  → Enter monthly limit
  → Save
```

**Layout (Budget List):**
```
┌────────────────────────────────────┐
│ ← Budget                           │
│                                    │
│  Makan & Minum                     │
│  ━━━━━━━━━━━━━━░░░░ 75%            │
│  Rp 750.000 / Rp 1.000.000         │
│                                    │
│  Transport                         │
│  ━━━━━━━━░░░░░░░░░░ 40%            │
│  Rp 200.000 / Rp 500.000           │
│                                    │
│  Hiburan                    ⚠️     │
│  ████████████████████ 120%         │
│  Rp 600.000 / Rp 500.000           │
│                                    │
│  [Tambah Budget]                   │
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 5.1.1 | Extend Category schema with budgetLimit field | 1 | Code |
| 5.1.2 | Create BudgetList page | 1 | Code |
| 5.1.3 | Create BudgetSetup form (BottomSheet) | 2 | Code |
| 5.1.4 | Implement progress bar (color-coded: green/yellow/red) | 2 | Code |
| 5.1.5 | Calculate spending vs budget for current month | 2 | Code |
| 5.1.6 | Implement edit/remove budget | 1 | Code |
| 5.1.7 | Implement overspending warning indicator | 1 | Code |
| 5.1.8 | Write tests | 2 | Testing |

**Acceptance Criteria:**
- [ ] Budget can be set per expense category
- [ ] Budget stored in category.budgetLimit
- [ ] Progress bar shows spending/budget ratio
- [ ] Green < 75%, Yellow 75-100%, Red > 100%
- [ ] Overspending shows warning icon
- [ ] Budget resets monthly (new month = fresh calculation)
- [ ] Edit budget updates limit
- [ ] Remove budget clears limit
- [ ] Dashboard shows aggregate budget progress

**Dependencies:** US-2.2, US-4.2
**Risks:** Budget calculation performance. Mitigation: pre-aggregate spending by category for current month.

---

### US-5.2: Budget Progress on Dashboard

**Priority:** P1
**Story Points:** 3
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Tampilkan budget progress di dashboard. Aggregate dari semua budget yang aktif.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 5.2.1 | Calculate total budget vs total spending | 1 | Code |
| 5.2.2 | Display aggregate progress bar on dashboard | 1 | Code |
| 5.2.3 | Show "X kategori overspent" warning | 1 | Code |

**Acceptance Criteria:**
- [ ] Dashboard shows total budget progress
- [ ] Shows number of categories overspent
- [ ] Updates in real-time after transaction

**Dependencies:** US-5.1, US-3.1
**Risks:** None significant.

---

### US-5.3: Recurring Transaction Engine

**Priority:** P0
**Story Points:** 13
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
User bisa setup transaksi berulang (kost, langganan, gaji). Otomatis generate transaksi sesuai jadwal.

**UX Flow:**
```
More → Recurring → [Tambah]
  → Fill transaction template (amount, category, account)
  → Select frequency (daily/weekly/monthly/yearly)
  → Select start date
  → Optional end date
  → Save
```

**Generation Logic:**
```typescript
// Run on app start (check if any recurring needs generation)
// For each active recurring transaction:
//   If lastGenerated + frequency < today:
//     Generate new transaction from template
//     Update lastGenerated
//     Save transaction
//     Update account balance
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 5.3.1 | Create RecurringList page | 1 | Code |
| 5.3.2 | Create RecurringForm (BottomSheet) | 2 | Code |
| 5.3.3 | Implement frequency selector (daily/weekly/monthly/yearly) | 1 | Code |
| 5.3.4 | Implement date range (start, optional end) | 1 | Code |
| 5.3.5 | Create recurring transaction generator (runs on app start) | 3 | Code |
| 5.3.6 | Implement generation logic (check lastGenerated + frequency) | 2 | Code |
| 5.3.7 | Link generated transactions to recurring (recurringId) | 1 | Code |
| 5.3.8 | Implement pause/resume recurring | 1 | Code |
| 5.3.9 | Implement delete recurring (with option to delete generated) | 1 | Code |
| 5.3.10 | Write tests for generation logic | 3 | Testing |
| 5.3.11 | Test edge cases (month boundary, leap year, timezone) | 1 | Verification |

**Acceptance Criteria:**
- [ ] Recurring transaction can be created with template + frequency
- [ ] Generator runs on app start
- [ ] New transaction generated when schedule matches
-  [ ] Generated transaction linked to recurring (recurringId)
- [ ] Account balance updated for generated transactions
- [ ] lastGenerated timestamp updated
- [ ] End date stops generation
- [ ] Pause stops generation without deleting
- [ ] Resume continues from lastGenerated
- [ ] Delete recurring asks about generated transactions
- [ ] Edge cases handled (Feb 29, month-end dates)

**Dependencies:** US-2.1, US-2.2, US-4.1
**Risks:** 
- Timezone issues. Mitigation: use startOfDay() for all date comparisons.
- Duplicate generation. Mitigation: check lastGenerated before generating.
- Performance with many recurring. Mitigation: only check active ones.

---

### US-5.4: Recurring Transaction List

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Tampilkan daftar recurring transaction yang aktif.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 5.4.1 | Display recurring list with next occurrence date | 2 | Code |
| 5.4.2 | Show frequency badge (monthly, weekly, etc.) | 1 | Code |
| 5.4.3 | Show active/pause status | 1 | Code |
| 5.4.4 | Implement tap to edit | 1 | Code |
| 5.4.5 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] All active recurring transactions listed
- [ ] Next occurrence date calculated and shown
- [ ] Frequency badge visible
- [ ] Active/pause status indicated
- [ ] Tap opens edit form
- [ ] Swipe to delete

**Dependencies:** US-5.3
**Risks:** Next occurrence calculation for complex frequencies. Mitigation: use date-fns addDays/addMonths.

---

### US-5.5: Overspending Notification

**Priority:** P1
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Saat kategori overspend (spending > budget), tampilkan warning di dashboard dan optional notification.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 5.5.1 | Check overspending on each transaction save | 1 | Code |
| 5.5.2 | Show inline warning on dashboard | 2 | Code |
| 5.5.3 | Show inline warning on budget page | 1 | Code |
| 5.5.4 | Optional: trigger local notification | 2 | Code |
| 5.5.5 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] Overspending detected immediately after transaction save
- [ ] Warning shown on dashboard (red banner)
- [ ] Warning shows which category is overspent
- [ ] Budget page shows red progress bar
- [ ] Local notification fires (if enabled in settings)
- [ ] Notification not spammy (once per category per day)

**Dependencies:** US-5.1, US-3.1
**Risks:** Notification spam. Mitigation: throttle to once per category per day.

---

### Sprint 5 Deliverables Checklist

- [ ] Budget setup per category (US-5.1)
- [ ] Budget progress on dashboard (US-5.2)
- [ ] Recurring transaction engine (US-5.3)
- [ ] Recurring transaction list (US-5.4)
- [ ] Overspending notification (US-5.5)
- [ ] All tests pass
- [ ] Recurring generates correctly on app start
- [ ] Budget progress updates in real-time
- [ ] Overspending warning visible

---

## 8. SPRINT 6: INSIGHTS & SEARCH

**Week:** 7
**Theme:** "Monthly overview, category breakdown, search"
**Story Points:** 30

### Sprint Goal

User bisa lihat insight keuangan: monthly overview, category breakdown dengan chart. Global search untuk cari transaksi.

---

### US-6.1: Monthly Overview

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Ringkasan keuangan bulan ini: total income, total expense, net, top categories.

**Layout:**
```
┌────────────────────────────────────┐
│ ← Insight                          │
│                                    │
│  [◀ Mei 2026 ▶]                    │
│                                    │
│  ┌──────────┬──────────┐           │
│  │ Pemasukan│ Pengeluaran│          │
│  │ Rp 8.000K│ Rp 5.550K │          │
│  │    ▲ 10% │    ▼ 5%   │          │
│  └──────────┴──────────┘           │
│                                    │
│  Sisa: Rp 2.450.000                │
│                                    │
│  Top Kategori                      │
│  ├── 🍽️ Makan & Minum  Rp 1.200K  │
│  ├── 🛍️ Belanja        Rp 800K    │
│  ├── 🚗 Transport       Rp 500K    │
│  ├── 🧾 Tagihan         Rp 450K    │
│  └── 🎮 Hiburan         Rp 300K    │
│                                    │
│  [Lihat Detail →]                  │
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 6.1.1 | Create Insights page layout | 1 | Code |
| 6.1.2 | Implement month selector (prev/next) | 1 | Code |
| 6.1.3 | Calculate monthly income/expense | 2 | Code |
| 6.1.4 | Calculate month-over-month change (%) | 2 | Code |
| 6.1.5 | Calculate net (income - expense) | 1 | Code |
| 6.1.6 | Get top categories by spending | 2 | Code |
| 6.1.7 | Display category breakdown list | 1 | Code |
| 6.1.8 | Write tests | 2 | Testing |

**Acceptance Criteria:**
- [ ] Month selector works (prev/next month)
- [ ] Current month highlighted
- [ ] Income/expense totals correct
- [ ] Month-over-month change calculated correctly
- [ ] Net displayed (green if positive, red if negative)
- [ ] Top 5 categories shown, sorted by amount desc
- [ ] Category amounts correct
- [ ] Empty state if no data for selected month

**Dependencies:** US-2.2, US-3.1
**Risks:** Month-over-month calculation for first month (no previous data). Mitigation: show "—" or "Data pertama".

---

### US-6.2: Category Breakdown Chart

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Visual breakdown spending per kategori. Custom SVG bar chart (ringan, tidak perlu chart library berat).

**Chart Types:**
1. Horizontal bar chart (spending by category)
2. Percentage labels

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 6.2.1 | Create BarChart component (custom SVG) | 3 | Code |
| 6.2.2 | Implement horizontal bars with category colors | 2 | Code |
| 6.2.3 | Implement percentage labels | 1 | Code |
| 6.2.4 | Implement amount labels | 1 | Code |
| 6.2.5 | Animate bars on mount (CSS transition) | 1 | Code |
| 6.2.6 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] Bar chart renders correctly
- [ ] Bars proportional to spending amounts
- [ ] Category colors match
- [ ] Percentage labels accurate
- [ ] Amount labels formatted (Rp 1.200K)
- [ ] Bars animate on mount (smooth, no jank)
- [ ] Chart works on 320px width
- [ ] No external chart library used

**Dependencies:** US-6.1
**Risks:** SVG performance on low-end devices. Mitigation: simple SVG, no complex filters.

---

### US-6.3: Global Search

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Search transaksi by nama (notes), amount, atau kategori. Instant results.

**UX:**
```
Tap search icon → Search bar appears
Type "makan" → Results:
  ├── Makan Siang (Makan & Minum) -Rp 25.000
  ├── Makan Malam (Makan & Minum) -Rp 30.000
  └── Belanja makanan (Belanja) -Rp 50.000

Type "50000" → Results:
  ├── Transfer 50K (Transfer) Rp 50.000
  └── Belanja makanan (Belanja) -Rp 50.000
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 6.3.1 | Create SearchBar component | 1 | Code |
| 6.3.2 | Implement search input with debounce (300ms) | 1 | Code |
| 6.3.3 | Implement search logic (notes, amount, category name) | 2 | Code |
| 6.3.4 | Display search results (same as transaction list) | 2 | Code |
| 6.3.5 | Implement "no results" state | 1 | Code |
| 6.3.6 | Implement search history (recent searches) | 2 | Code |
| 6.3.7 | Write tests | 2 | Testing |

**Acceptance Criteria:**
- [ ] Search bar accessible from Transactions page
- [ ] Debounce prevents excessive queries (300ms)
- [ ] Search matches notes, amount, category name
- [ ] Results update instantly
- [ ] Results formatted same as transaction list
- [ ] "Tidak ditemukan" shown for no results
- [ ] Recent searches shown when search bar empty
- [ ] Tap search history item runs search
- [ ] Clear search button works

**Dependencies:** US-2.2, US-2.4
**Risks:** Search performance with many transactions. Mitigation: IndexedDB index on notes, limit results to 50.

---

### US-6.4: Transaction Count & Stats

**Priority:** P2
**Story Points:** 3
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Tampilkan statistik tambahan: jumlah transaksi, rata-rata per hari, hari paling boros.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 6.4.1 | Calculate transaction count per month | 1 | Code |
| 6.4.2 | Calculate average daily spending | 1 | Code |
| 6.4.3 | Find highest spending day | 1 | Code |
| 6.4.4 | Display stats on Insights page | 1 | Code |

**Acceptance Criteria:**
- [ ] Transaction count shown
- [ ] Average daily spending calculated
- [ ] Highest spending day identified
- [ ] Stats displayed at bottom of Insights page

**Dependencies:** US-6.1
**Risks:** None significant.

---

### US-6.5: Category Spending Trend (Simple)

**Priority:** P2
**Story Points:** 3
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Lihat trend spending per kategori dalam 3 bulan terakhir. Naik atau turun?

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 6.5.1 | Calculate category spending for last 3 months | 1 | Code |
| 6.5.2 | Show trend arrow (▲/▼) per category | 1 | Code |
| 6.5.3 | Show percentage change | 1 | Code |

**Acceptance Criteria:**
- [ ] 3-month trend calculated per category
- [ ] Trend arrow shown (up/down/stable)
- [ ] Percentage change displayed
- [ ] Stable (< 5% change) shows "—"

**Dependencies:** US-6.1
**Risks:** Not enough data for new users. Mitigation: show "Belum cukup data" if < 2 months.

---

### Sprint 6 Deliverables Checklist

- [ ] Monthly overview with income/expense/net (US-6.1)
- [ ] Category breakdown bar chart (US-6.2)
- [ ] Global search with debounce (US-6.3)
- [ ] Transaction count & stats (US-6.4)
- [ ] Category spending trend (US-6.5)
- [ ] All tests pass
- [ ] Chart renders smoothly (no jank)
- [ ] Search results in < 500ms

---

## 9. SPRINT 7: PWA, OFFLINE & NOTIFICATIONS

**Week:** 8
**Theme:** "Service worker, install prompt, push notifications, streak"
**Story Points:** 38

### Sprint Goal

App bisa di-install sebagai PWA. Bekerja 100% offline. Daily reminder notification berfungsi. Streak system aktif.

---

### US-7.1: PWA Manifest & Service Worker

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Setup vite-plugin-pwa dengan manifest dan service worker yang benar.

**Manifest:**
```json
{
  "name": "NyatetDuwit",
  "short_name": "NyatetDuwit",
  "description": "Catat keuangan pribadi dengan cepat",
  "theme_color": "#1E40AF",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    {
      "name": "Tambah Transaksi",
      "short_name": "Add",
      "description": "Catat transaksi baru",
      "url": "/?action=add",
      "icons": [{ "src": "/icon-add.png", "sizes": "96x96" }]
    }
  ]
}
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 7.1.1 | Install & configure vite-plugin-pwa | 2 | Setup |
| 7.1.2 | Create PWA manifest (as above) | 1 | Config |
| 7.1.3 | Create app icons (192, 512, maskable) | 2 | Design |
| 7.1.4 | Create shortcut icon (add transaction) | 1 | Design |
| 7.1.5 | Configure service worker (Stale-While-Revalidate for app shell) | 2 | Config |
| 7.1.6 | Configure runtime caching (fonts: CacheFirst, API: NetworkFirst) | 2 | Config |
| 7.1.7 | Test offline mode (airplane mode) | 1 | Verification |
| 7.1.8 | Test install prompt on Android Chrome | 1 | Verification |
| 7.1.9 | Test PWA shortcut (quick add) | 1 | Verification |

**Acceptance Criteria:**
- [ ] Manifest valid (Lighthouse PWA audit passes)
- [ ] Icons generated and correct sizes
- [ ] Service worker registered
- [ ] App loads offline (app shell from cache)
- [ ] Install prompt appears on Android Chrome
- [ ] Installed app opens in standalone mode (no browser UI)
- [ ] PWA shortcut opens app with add action
- [ ] Splash screen shows on app launch

**Dependencies:** US-1.1
**Risks:** Install prompt not triggering. Mitigation: ensure all PWA criteria met (HTTPS, manifest, service worker, icons).

---

### US-7.2: Install Prompt UX

**Priority:** P0
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Custom install banner yang muncul setelah user merasakan value (setelah 3 transaksi atau return visit).

**Logic:**
```typescript
// Show install banner if:
// 1. Not already installed (displayMode !== 'standalone')
// 2. User has added ≥ 3 transactions OR is returning visitor
// 3. User has not dismissed in last 7 days
// 4. beforeinstallprompt event is available
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 7.2.1 | Capture beforeinstallprompt event | 1 | Code |
| 7.2.2 | Create InstallBanner component | 2 | Code |
| 7.2.3 | Implement show logic (3 transactions or return visit) | 2 | Code |
| 7.2.4 | Implement dismiss logic (don't show for 7 days) | 1 | Code |
| 7.2.5 | Track install event (analytics) | 1 | Code |

**Acceptance Criteria:**
- [ ] Install banner shows after 3 transactions or return visit
- [ ] Banner does NOT show on first visit
- [ ] Banner does NOT show if already installed
- [ ] Dismiss hides banner for 7 days
- [ ] Tap "Install" triggers beforeinstallprompt
- [ ] Banner copy: "Install untuk akses lebih cepat"

**Dependencies:** US-7.1
**Risks:** beforeinstallprompt not firing. Mitigation: fallback to manual instructions.

---

### US-7.3: Daily Reminder Notification

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Push notification harian untuk remind user nyatet. User bisa set waktu.

**Implementation:**
- Use Web Push API for local notifications (no server needed)
- Schedule notification using service worker
- User sets reminder time in settings

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 7.3.1 | Request notification permission | 1 | Code |
| 7.3.2 | Create reminder settings page | 1 | Code |
| 7.3.3 | Implement time picker for reminder | 1 | Code |
| 7.3.4 | Schedule notification using service worker | 3 | Code |
| 7.3.5 | Implement notification payload (custom message) | 1 | Code |
| 7.3.6 | Implement smart skip (don't notify if already recorded today) | 2 | Code |
| 7.3.7 | Implement enable/disable toggle | 1 | Code |
| 7.3.8 | Test notification fires at correct time | 2 | Verification |

**Acceptance Criteria:**
- [ ] Notification permission requested on first settings visit
- [ ] User can set reminder time (default 20:00)
- [ ] Notification fires at set time
- [ ] Notification message: "Jangan lupa catat pengeluaran hari ini 💰"
- [ ] Notification does NOT fire if user already recorded today
- [ ] User can disable reminder
- [ ] Notification taps open app
- [ ] Works when app is closed (service worker handles it)

**Dependencies:** US-7.1
**Risks:** 
- Notification permission denied. Mitigation: explain value before requesting.
- Service worker not running. Mitigation: ensure SW is registered and active.
- Browser limitations (some browsers don't support scheduled notifications). Mitigation: use Notification API fallback.

---

### US-7.4: Recording Streak System

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Track berapa hari berturut-turut user mencatat. Tampilkan di dashboard.

**Logic:**
```typescript
// On each transaction save:
// 1. Get last recording date from settings
// 2. If last recording date = yesterday → streak++
// 3. If last recording date = today → streak unchanged (already counted)
// 4. If last recording date < yesterday → streak = 1 (reset)
// 5. Save last recording date = today
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 7.4.1 | Create streak tracking logic | 2 | Code |
| 7.4.2 | Store streak data in settings | 1 | Code |
| 7.4.3 | Display streak counter on dashboard | 1 | Code |
| 7.4.4 | Implement streak milestone messages (7, 30, 100) | 2 | Code |
| 7.4.5 | Implement streak reset visualization | 1 | Code |
| 7.4.6 | Write tests for streak logic | 2 | Testing |
| 7.4.7 | Test edge cases (timezone, midnight transactions) | 1 | Verification |

**Acceptance Criteria:**
- [ ] Streak increments by 1 each day user records
- [ ] Streak resets if user misses a day
- [ ] Streak displayed on dashboard (🔥 7)
- [ ] Milestone toast at 7, 30, 100 days
- [ ] Streak data persists across app restarts
- [ ] Midnight edge case handled (use local date, not UTC)
- [ ] Tests cover all streak scenarios

**Dependencies:** US-3.1, US-2.1
**Risks:** Timezone issues with date comparison. Mitigation: use local date (startOfDay in user timezone).

---

### US-7.5: Offline-First Verification

**Priority:** P0
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Verifikasi SEMUA fitur bekerja offline. Ini adalah core value proposition.

**Test Matrix:**

| Feature | Online | Offline | Notes |
|---|---|---|---|
| Add transaction | ✅ | ✅ | IndexedDB write |
| View transactions | ✅ | ✅ | IndexedDB read |
| Edit transaction | ✅ | ✅ | IndexedDB update |
| Delete transaction | ✅ | ✅ | IndexedDB delete |
| Dashboard | ✅ | ✅ | Cached data |
| Insights | ✅ | ✅ | Cached data |
| Search | ✅ | ✅ | IndexedDB query |
| Budget | ✅ | ✅ | Local data |
| Recurring | ✅ | ✅ | Local scheduler |
| Settings | ✅ | ✅ | Local data |
| Backup/Restore | ✅ | ✅ | Local file |
| Install | ✅ | ❌ | Needs network first time |

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 7.5.1 | Test all features in airplane mode | 2 | Testing |
| 7.5.2 | Fix any online-only dependencies | 2 | Code |
| 7.5.3 | Add offline indicator (subtle banner if no network) | 1 | Code |
| 7.5.4 | Test app restart offline (data persists) | 1 | Verification |
| 7.5.5 | Test service worker update flow | 1 | Verification |

**Acceptance Criteria:**
- [ ] All features in test matrix pass offline
- [ ] No network requests for core features
- [ ] Data persists after offline app restart
- [ ] Offline indicator shows when no network (subtle, not intrusive)
- [ ] Service worker updates app in background

**Dependencies:** All previous sprints
**Risks:** Hidden network dependencies (fonts, analytics). Mitigation: audit all network requests.

---

### US-7.6: PWA Shortcuts & Deep Links

**Priority:** P2
**Story Points:** 4
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
PWA shortcuts untuk quick add dari home screen. Deep links untuk?action=add.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 7.6.1 | Configure PWA shortcuts in manifest | 1 | Config |
| 7.6.2 | Handle shortcut URL params (?action=add) | 2 | Code |
| 7.6.3 | Auto-open transaction form on ?action=add | 1 | Code |
| 7.6.4 | Test on Android Chrome | 1 | Verification |

**Acceptance Criteria:**
- [ ] Long-press app icon shows shortcuts
- [ ] "Tambah Transaksi" shortcut opens app with form
- [ ] Deep link ?action=add opens transaction form
- [ ] Works on installed PWA

**Dependencies:** US-7.1, US-2.1
**Risks:** Shortcut support varies by browser. Mitigation: graceful degradation.

---

### US-7.7: TWA APK Build Setup

**Priority:** P0 (CRITICAL — ini yang bikin user mudah install)
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Setup TWA (Trusted Web Activity) wrapper supaya PWA bisa di-build jadi APK. User bisa download APK dan install seperti app biasa — tanpa perlu tahu apa itu PWA.

**Kenapa TWA:**
- Wrapper tipis (~50KB), tidak menambah bundle size app
- 0 code change — PWA tetap sama, cuma di-wrap
- Update otomatis — update PWA = update app, tidak perlu rebuild APK
- Service worker tetap aktif — offline jalan normal
- Play Store ready — nanti tinggal submit

**Tech Choice: Bubblewrap (Google official CLI)**

```bash
# Install
npm install -g @googlechrome/bubblewrap

# Init (perlu PWA manifest URL)
bubblewrap init --manifest https://nyatetduwit.app/manifest.json

# Build
bubblewrap build --signing-key-info signing-key.json

# Output: app-release-signed.apk
```

**TWA Configuration:**

```json
// twa-manifest.json (generated by bubblewrap)
{
  "packageId": "com.nyatetduwit.app",
  "host": "nyatetduwit.app",
  "name": "NyatetDuwit",
  "launcherName": "NyatetDuwit",
  "themeColor": "#1E40AF",
  "backgroundColor": "#FFFFFF",
  "enableNotifications": true,
  "fallbackType": "customtabs",
  "signingKey": {
    "path": "android.keystore",
    "alias": "android"
  }
}
```

**Asset Links (untuk full-screen TWA, tanpa browser bar):**

```json
// https://nyatetduwit.app/.well-known/assetlinks.json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.nyatetduwit.app",
    "sha256_cert_fingerprints": ["SHA256_FINGERPRINT_DARI_KEYSTORE"]
  }
}]
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 7.7.1 | Install & setup Bubblewrap CLI | 1 | Setup |
| 7.7.2 | Generate signing key (keystore) | 0.5 | Setup |
| 7.7.3 | Initialize TWA project dari PWA manifest | 1 | Setup |
| 7.7.4 | Configure TWA manifest (package ID, colors, name) | 1 | Config |
| 7.7.5 | Configure notification delegation (untuk reminder di TWA) | 1 | Config |
| 7.7.6 | Build APK (debug) | 1 | Build |
| 7.7.7 | Build APK (release, signed) | 1 | Build |
| 7.7.8 | Setup assetlinks.json di server | 1 | Config |
| 7.7.9 | Test APK install on Android device | 1 | Verification |
| 7.7.10 | Test APK works offline (airplane mode) | 1 | Verification |
| 7.7.11 | Test APK notifications work | 1 | Verification |
| 7.7.12 | Setup GitHub Actions untuk auto-build APK on tag | 2 | CI/CD |

**Acceptance Criteria:**
- [ ] TWA project initialized dari PWA manifest
- [ ] APK build berhasil (debug + release)
- [ ] APK install normal di Android device
- [ ] APK membuka PWA dalam full-screen (no browser bar)
- [ ] APK works offline (service worker aktif)
- [ ] APK notifications work (daily reminder)
- [ ] APK icon muncul di home screen + app drawer
- [ ] APK splash screen shows on launch
- [ ] assetlinks.json deployed dan verified
- [ ] GitHub Actions build APK otomatis saat tag dibuat
- [ ] APK size < 10MB (seharusnya ~5-7MB termasuk Chrome embedded)

**Dependencies:** US-7.1 (PWA manifest harus valid dulu)
**Risks:**
- assetlinks.json tidak terverifikasi → browser bar muncul. Mitigation: verify SHA256 fingerprint matches keystore.
- Chrome not installed on device → fallback ke Custom Tab. Mitigation: acceptable, masih usable.
- APK size lebih besar dari expected. Mitigation: TWA embeds Chrome, ini normal.

---

### US-7.8: In-App Update Checker (untuk APK)

**Priority:** P1
**Story Points:** 4
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Karena APK tidak auto-update seperti Play Store app, buat mechanism untuk notify user kalau ada versi baru.

**Logic:**
```typescript
// Check on app start (throttle: once per day)
// Fetch version.json dari server
// Compare with current version
// If newer → show banner: "Update tersedia!"
```

**UX:**
```
┌────────────────────────────────────┐
│  🔄 Update tersedia!               │
│  Versi 1.1.0 sudah rilis.          │
│  [Download Update] [Nanti Saja]    │
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 7.8.1 | Create version.json di server/build output | 1 | Config |
| 7.8.2 | Implement update checker (fetch version.json) | 1 | Code |
| 7.8.3 | Create update notification banner | 1 | Code |
| 7.8.4 | Link to APK download page | 0.5 | Code |
| 7.8.5 | Throttle check (once per day) | 0.5 | Code |
| 7.8.6 | Test update flow | 1 | Verification |

**Acceptance Criteria:**
- [ ] version.json generated saat build
- [ ] App checks version on start (once/day)
- [ ] Banner shows when new version available
- [ ] "Download Update" opens APK download page
- [ ] "Nanti Saja" dismisses banner
- [ ] Check throttled to once per day
- [ ] Works in both APK and PWA browser

**Dependencies:** US-7.7
**Risks:** None significant.

---

### Sprint 7 Deliverables Checklist

- [ ] PWA manifest & service worker (US-7.1)
- [ ] Install prompt UX (US-7.2)
- [ ] Daily reminder notification (US-7.3)
- [ ] Recording streak system (US-7.4)
- [ ] Offline-first verification (US-7.5)
- [ ] PWA shortcuts & deep links (US-7.6)
- [ ] **TWA APK build setup (US-7.7)**
- [ ] **In-app update checker (US-7.8)**
- [ ] All tests pass
- [ ] Lighthouse PWA score ≥ 90
- [ ] All features work offline (airplane mode test)
- [ ] Install flow works on Android Chrome
- [ ] **APK installs and works on Android device**
- [ ] **APK works offline**
- [ ] **GitHub Actions auto-builds APK on tag**

---

## 10. SPRINT 8: POLISH, BACKUP & LAUNCH PREP

**Week:** 9
**Theme:** "Backup/restore, dark mode, testing, performance, landing page + APK distribution, launch"
**Story Points:** 44

### Sprint Goal

App production-ready. Backup/restore berfungsi. Dark mode complete. Performance targets met. **Landing page dengan download APK siap. APK didistribusikan.** Semua pre-launch checklist checked.

---

### US-8.1: Backup & Restore

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
User bisa export semua data ke file JSON dan import kembali. Ini adalah safety net untuk data loss.

**Export Format:**
```json
{
  "version": "1.0",
  "exportDate": "2026-05-19T20:00:00Z",
  "accounts": [...],
  "transactions": [...],
  "categories": [...],
  "recurring": [...],
  "settings": [...]
}
```

**UX Flow:**
```
More → Backup & Restore
  → [Export Data] → Download JSON file
  → [Import Data] → Select JSON file → Confirm → Data replaced
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 8.1.1 | Create BackupRestore page | 1 | Code |
| 8.1.2 | Implement export (serialize all tables to JSON) | 2 | Code |
| 8.1.3 | Implement file download (Blob + anchor) | 1 | Code |
| 8.1.4 | Implement import (file picker + parse JSON) | 2 | Code |
| 8.1.5 | Implement validation (check schema version, required fields) | 2 | Code |
| 8.1.6 | Implement import confirmation (warning: replaces data) | 1 | Code |
| 8.1.7 | Implement merge option (skip duplicates) | 2 | Code |
| 8.1.8 | Write tests for export/import | 2 | Testing |
| 8.1.9 | Test with large dataset (1000+ transactions) | 1 | Verification |

**Acceptance Criteria:**
- [ ] Export downloads JSON file with all data
- [ ] File includes version and export date
- [ ] Import reads and validates JSON
- [ ] Import warns about data replacement
- [ ] Import replaces all data correctly
- [ ] Merge option skips duplicates (by ID)
- [ ] Validation rejects invalid files
- [ ] Works with 1000+ transactions
- [ ] Export file size reasonable (< 1MB for typical use)

**Dependencies:** US-1.4
**Risks:** Large export files. Mitigation: compress if needed, but JSON is typically small.

---

### US-8.2: Dark Mode Complete

**Priority:** P0
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Semua halaman dan komponen support dark mode. Toggle di settings.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 8.2.1 | Create dark mode toggle in settings | 1 | Code |
| 8.2.2 | Store preference in settings | 1 | Code |
| 8.2.3 | Audit all components for dark mode | 2 | Code |
| 8.2.4 | Fix any hardcoded light-mode colors | 2 | Code |
| 8.2.5 | Test all pages in dark mode | 1 | Verification |

**Acceptance Criteria:**
- [ ] Toggle switches between light and dark
- [ ] Preference persists across sessions
- [ ] All pages readable in dark mode
- [ ] No hardcoded light colors remaining
- [ ] Contrast ratio ≥ 4.5:1 in dark mode
- [ ] Charts readable in dark mode
- [ ] Icons visible in dark mode

**Dependencies:** All UI components
**Risks:** Missed components. Mitigation: systematic audit page by page.

---

### US-8.3: Settings Page

**Priority:** P0
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Halaman settings yang rapi dengan semua pengaturan.

**Settings Items:**
```
┌────────────────────────────────────┐
│ ← Pengaturan                       │
│                                    │
│  Tampilan                          │
│  ├── Mode Gelap            [Toggle]│
│  └── Bahasa                [Indonesia]│
│                                    │
│  Notifikasi                        │
│  ├── Reminder Haris        [Toggle]│
│  └── Waktu Reminder        [20:00] │
│                                    │
│  Data                              │
│  ├── Backup & Restore      [→]     │
│  ├── Reconcile Balance     [→]     │
│  └── Hapus Semua Data      [→]     │
│                                    │
│  Tentang                           │
│  ├── Versi                 [1.0.0] │
│  └── Kebijakan Privasi     [→]     │
└────────────────────────────────────┘
```

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 8.3.1 | Create Settings page layout | 1 | Code |
| 8.3.2 | Group settings by category | 1 | Code |
| 8.3.3 | Wire up dark mode toggle | 1 | Code |
| 8.3.4 | Wire up reminder settings | 1 | Code |
| 8.3.5 | Link to Backup & Restore | 1 | Code |
| 8.3.6 | Implement "Hapus Semua Data" (with confirmation) | 2 | Code |
| 8.3.7 | Display app version | 0.5 | Code |
| 8.3.8 | Write tests | 1 | Testing |

**Acceptance Criteria:**
- [ ] All settings items listed and grouped
- [ ] Dark mode toggle works
- [ ] Reminder toggle + time picker works
- [ ] Backup & Restore link works
- [ ] Reconcile Balance link works (debug)
- [ ] "Hapus Semua Data" requires double confirmation
- [ ] App version displayed
- [ ] Settings persist across sessions

**Dependencies:** US-8.1, US-8.2, US-7.3
**Risks:** Accidental data deletion. Mitigation: double confirmation + type "HAPUS" to confirm.

---

### US-8.4: Performance Optimization

**Priority:** P0
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Optimasi performa untuk memenuhi semua target. Bundle size, render time, scroll performance.

**Optimization Checklist:**

| Area | Target | Action |
|---|---|---|
| Bundle size | < 200KB gzipped | Tree-shake, code split, remove unused deps |
| Startup time | < 1s | Lazy load non-critical routes, inline critical CSS |
| Dashboard render | < 200ms | useMemo, React.memo, optimize queries |
| Transaction add | < 100ms | Optimistic write, no blocking |
| List scroll | 60fps | Virtualization, windowing |
| Memory usage | < 100MB | Cleanup subscriptions, limit cached data |

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 8.4.1 | Analyze bundle size (rollup-plugin-visualizer) | 1 | Analysis |
| 8.4.2 | Remove unused dependencies | 1 | Optimization |
| 8.4.3 | Code split non-critical routes (Insights, Settings, More pages) | 2 | Optimization |
| 8.4.4 | Add React.memo to list items | 1 | Optimization |
| 8.4.5 | Add useMemo to expensive calculations | 1 | Optimization |
| 8.4.6 | Optimize IndexedDB queries (use indexes) | 2 | Optimization |
| 8.4.7 | Test bundle size | 1 | Verification |
| 8.4.8 | Test startup time | 1 | Verification |
| 8.4.9 | Test scroll performance with 1000 items | 1 | Verification |
| 8.4.10 | Test on low-end device profile | 1 | Verification |

**Acceptance Criteria:**
- [ ] Bundle size < 200KB gzipped
- [ ] Startup time < 1s (measured on low-end profile)
- [ ] Dashboard render < 200ms
- [ ] Transaction add < 100ms
- [ ] List scrolls 60fps with 1000 items
- [ ] No memory leaks (DevTools memory profile)
- [ ] Lighthouse Performance ≥ 90

**Dependencies:** All previous sprints
**Risks:** Bundle size over budget. Mitigation: audit dependencies, replace heavy libs.

---

### US-8.5: Error Handling & Edge Cases

**Priority:** P0
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Handle semua edge cases dan error scenarios gracefully.

**Edge Cases:**

| Scenario | Handling |
|---|---|
| IndexedDB full | Show error, offer export + clear old data |
| Corrupted database | Show error, offer restore from backup |
| Invalid import file | Show error, explain what's wrong |
| Transaction with deleted category | Show "Unknown category" |
| Transaction with deleted account | Show "Unknown account" |
| Negative balance | Allow (user might be in debt), show warning |
| Very large amount (trillions) | Allow, format correctly |
| Date in future | Allow, but show indicator |
| Timezone change | Use local time consistently |
| App update (new version) | Service worker updates, data preserved |

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 8.5.1 | Handle IndexedDB errors (quota exceeded, etc.) | 2 | Code |
| 8.5.2 | Handle corrupted database | 1 | Code |
| 8.5.3 | Handle orphaned transactions (deleted category/account) | 1 | Code |
| 8.5.4 | Handle negative balance display | 1 | Code |
| 8.5.5 | Add global error handler | 1 | Code |
| 8.5.6 | Write tests for error scenarios | 2 | Testing |

**Acceptance Criteria:**
- [ ] IndexedDB quota error shows friendly message
- [ ] Corrupted database shows recovery options
- [ ] Orphaned transactions display gracefully
- [ ] Negative balance shown with warning
- [ ] Global error boundary catches unhandled errors
- [ ] All error states tested

**Dependencies:** All previous sprints
**Risks:** Edge cases hard to reproduce. Mitigation: mock scenarios in tests.

---

### US-8.6: Final Testing & QA

**Priority:** P0
**Story Points:** 5
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Testing menyeluruh sebelum launch. Manual testing + automated tests.

**Test Plan:**

| Test | Method | Pass Criteria |
|---|---|---|
| Add transaction flow | Manual | < 3 seconds, data saved |
| Edit transaction | Manual | Data updated, balance correct |
| Delete transaction | Manual | Data removed, balance correct |
| Transfer flow | Manual | Both balances correct |
| Budget setup | Manual | Progress bar accurate |
| Recurring generation | Manual | Transaction generated on app start |
| Search | Manual | Results accurate, < 500ms |
| Offline mode | Manual | All features work |
| Install flow | Manual | PWA installs correctly |
| Notification | Manual | Fires at correct time |
| Streak | Manual | Increments correctly |
| Backup/Restore | Manual | Data exported and imported correctly |
| Dark mode | Manual | All pages readable |
| Low-end device | Manual | Smooth, no crashes |
| Bundle size | Automated | < 200KB gzipped |
| Lighthouse | Automated | Performance ≥ 90, PWA ≥ 90 |
| Unit tests | Automated | All pass, coverage ≥ 70% |

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 8.6.1 | Run full test plan (manual) | 2 | Testing |
| 8.6.2 | Fix all P0 bugs | 2 | Code |
| 8.6.3 | Fix all P1 bugs | 2 | Code |
| 8.6.4 | Run Lighthouse audit | 1 | Verification |
| 8.6.5 | Run bundle size check | 1 | Verification |
| 8.6.6 | Document known issues (P2+) | 1 | Documentation |

**Acceptance Criteria:**
- [ ] All test plan items pass
- [ ] Zero P0 bugs
- [ ] Zero P1 bugs
- [ ] Lighthouse: Performance ≥ 90, PWA ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90
- [ ] Bundle size < 200KB gzipped
- [ ] Known issues documented

**Dependencies:** All previous sprints
**Risks:** Last-minute bugs. Mitigation: buffer time in sprint.

---

### US-8.7: Landing Page + APK Distribution

**Priority:** P0 (CRITICAL — ini cara utama user install app)
**Story Points:** 8
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Buat landing page sederhana yang fokus pada 1 hal: **user download dan install APK**. Bukan marketing page yang fancy — tapi functional page yang jelas dan mudah dipahami.

**Landing Page Layout:**
```
┌────────────────────────────────────┐
│                                    │
│        [Logo NyatetDuwit]          │
│                                    │
│   Catat keuangan pribadi           │
│   dengan cepat & private           │
│                                    │
│   ✅ Bisa dipakai tanpa internet   │
│   ✅ Data tetap di HP kamu         │
│   ✅ Gratis, tanpa login           │
│                                    │
│   ┌──────────────────────────────┐ │
│   │   📥 Download APK (v1.0.0)   │ │
│   │   5.2 MB • Android 8+        │ │
│   └──────────────────────────────┘ │
│                                    │
│   atau                             │
│                                    │
│   [Buka di Browser]                │
│                                    │
│   ──────────────────────────────── │
│   Cara install:                    │
│   1. Download APK                  │
│   2. Buka file APK                 │
│   3. Jika muncul peringatan:       │
│      → Settings → Allow            │
│   4. Tap Install                   │
│   5. Buka app & mulai nyatet!      │
│   ──────────────────────────────── │
│                                    │
│   Butuh bantuan?                   │
│   [WhatsApp Support]               │
│                                    │
└────────────────────────────────────┘
```

**APK Distribution Channels:**

| Channel | Setup | Notes |
|---|---|---|
| Website direct download | APK file di static hosting | Primary channel |
| WhatsApp share | Kirim file APK langsung | Paling efektif untuk word-of-mouth |
| GitHub Releases | Upload di repo releases | Untuk tech-savvy users |
| Google Drive/MediaFire | Upload + share link | Backup channel |

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 8.7.1 | Create landing page (simple HTML/CSS, bukan React) | 2 | Code |
| 8.7.2 | Add APK download button with version + size | 1 | Code |
| 8.7.3 | Add install instructions (step-by-step) | 1 | Code |
| 8.7.4 | Add "Unknown Sources" troubleshooting guide | 1 | Code |
| 8.7.5 | Add WhatsApp support link | 0.5 | Code |
| 8.7.6 | Add "Buka di Browser" link (ke PWA) | 0.5 | Code |
| 8.7.7 | Upload APK to hosting (website + GitHub Releases) | 1 | Setup |
| 8.7.8 | Setup auto-update APK link on new release | 1 | CI/CD |
| 8.7.9 | Test download + install flow end-to-end | 1 | Verification |
| 8.7.10 | Test landing page on low-end device | 1 | Verification |

**Acceptance Criteria:**
- [ ] Landing page loads in < 1 second
- [ ] APK download button works
- [ ] APK file downloads correctly
- [ ] Install instructions clear and accurate
- [ ] "Unknown Sources" guide helpful
- [ ] WhatsApp support link works
- [ ] "Buka di Browser" link opens PWA
- [ ] Landing page works on 320px width
- [ ] Landing page is lightweight (< 50KB total)
- [ ] End-to-end test: download → install → open app → works

**Dependencies:** US-7.7 (APK harus sudah di-build)
**Risks:** 
- APK hosting bandwidth. Mitigation: use GitHub Releases (free, unlimited) atau CDN.
- User confused by "Unknown Sources" warning. Mitigation: clear instructions + screenshots + WhatsApp support.

---

### US-8.8: Documentation & Launch Prep

**Priority:** P1
**Story Points:** 4
**Assignee:** Developer
**Status:** To Do

**Deskripsi:**
Dokumentasi untuk developer dan user. Prep untuk deploy.

**Tasks:**

| # | Task | Estimate | Type |
|---|---|---|---|
| 8.8.1 | Write README (setup, development, build, APK build) | 1 | Documentation |
| 8.8.2 | Write CONTRIBUTING.md | 1 | Documentation |
| 8.8.3 | Write CHANGELOG.md | 0.5 | Documentation |
| 8.8.4 | Setup deployment (Vercel/Netlify/GitHub Pages) | 1 | Setup |
| 8.8.5 | Configure custom domain (optional) | 0.5 | Setup |
| 8.8.6 | Create privacy policy page | 1 | Documentation |
| 8.8.7 | Final pre-launch checklist | 1 | Verification |

**Acceptance Criteria:**
- [ ] README complete (setup, dev, build, APK build, deploy)
- [ ] CONTRIBUTING.md exists
- [ ] CHANGELOG.md with V1 entries
- [ ] App deployed and accessible via URL
- [ ] HTTPS enabled
- [ ] Privacy policy page exists
- [ ] All pre-launch checklist items checked

**Dependencies:** US-8.6, US-8.7
**Risks:** None significant.

---

### Sprint 8 Deliverables Checklist

- [ ] Backup & Restore (US-8.1)
- [ ] Dark mode complete (US-8.2)
- [ ] Settings page (US-8.3)
- [ ] Performance optimization (US-8.4)
- [ ] Error handling & edge cases (US-8.5)
- [ ] Final testing & QA (US-8.6)
- [ ] **Landing page + APK distribution (US-8.7)**
- [ ] Documentation & launch prep (US-8.8)
- [ ] Zero P0/P1 bugs
- [ ] Lighthouse scores ≥ 90 all categories
- [ ] Bundle size < 200KB gzipped
- [ ] App deployed and accessible
- [ ] **APK available for download**
- [ ] **Landing page live with download button**
- [ ] **Install instructions clear and tested**

---

## 11. RISK REGISTER

| # | Risk | Impact | Probability | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | Bundle size exceeds 200KB | High | Medium | Audit dependencies early, tree-shake aggressively, code split | Dev |
| R2 | IndexedDB performance degrades with large data | High | Low | Use indexes, limit queries, virtualize lists | Dev |
| R3 | PWA install prompt not triggering on some devices | Medium | Medium | Provide manual install instructions as fallback | Dev |
| R4 | Notification permission denied by user | Medium | High | Explain value before requesting, offer in-app reminder alternative | Dev |
| R5 | Balance inconsistency after failed transaction | High | Low | Dexie.transaction for atomicity, reconciliation utility | Dev |
| R6 | Recurring transaction generates duplicates | High | Low | Check lastGenerated before generating, idempotent logic | Dev |
| R7 | Low-end device scroll jank | High | Medium | Virtualization mandatory, test on low-end profile early | Dev |
| R8 | Scope creep (feature requests mid-sprint) | High | High | Strict scope freeze, push to V1.5/V2 backlog | PM |
| R9 | Keyboard interaction with BottomSheet on mobile | Medium | Medium | Test early, adjust bottom inset on keyboard open | Dev |
| R10 | Service worker caching stale data | Medium | Low | Stale-While-Revalidate strategy, version cache names | Dev |
| R11 | Timezone issues with date calculations | Medium | Medium | Use local time consistently, startOfDay for all comparisons | Dev |
| R12 | Browser compatibility (older Chrome) | Medium | Low | Test on Chrome 80+, polyfill if needed | Dev |
| R13 | **APK blocked by Android security (unknown sources)** | **High** | **High** | Clear instructions + screenshots + WhatsApp support | Dev |
| R14 | **TWA shows browser bar (assetlinks not verified)** | **Medium** | **Medium** | Verify SHA256 fingerprint matches keystore, test before release | Dev |
| R15 | **APK distribution bandwidth limit** | **Medium** | **Low** | Use GitHub Releases (free, unlimited) or CDN | Dev |
| R16 | **User installs old APK version** | **Medium** | **Medium** | In-app update checker + version.json + landing page always shows latest | Dev |

---

## 12. DEPENDENCY MAP

```
Sprint 1: Foundation
├── US-1.1 Project Init
│   ├── US-1.2 UI Primitives
│   ├── US-1.4 DB Schema
│   └── US-1.6 Utilities
├── US-1.2 UI Primitives
│   └── US-1.3 Routing & Layout
├── US-1.3 Routing & Layout
│   └── (depends on US-1.2)
├── US-1.4 DB Schema
│   └── US-1.5 State Management
├── US-1.5 State Management
│   └── (depends on US-1.4)
└── US-1.6 Utilities
    └── (depends on US-1.1)

Sprint 2: Core CRUD
├── US-2.1 Quick Add Form
│   ├── depends on: US-1.2, US-1.3, US-1.4, US-1.5, US-1.6
│   └── US-2.3 Edit & Delete
├── US-2.2 Transaction Repository
│   ├── depends on: US-1.4
│   └── US-2.4 Transaction List
├── US-2.3 Edit & Delete
│   └── depends on: US-2.1, US-2.2
├── US-2.4 Transaction List
│   └── depends on: US-2.2
└── US-2.5 Account Repository
    ├── depends on: US-1.4
    └── US-4.1 Account Management

Sprint 3: Dashboard & List
├── US-3.1 Dashboard
│   ├── depends on: US-2.2, US-2.4, US-2.5
│   └── US-3.5 Empty States
├── US-3.2 Filters & Sort
│   ├── depends on: US-2.4, US-2.2
├── US-3.3 Transaction Detail
│   ├── depends on: US-2.1, US-2.3
├── US-3.4 FAB
│   ├── depends on: US-1.3, US-2.1
├── US-3.5 Empty States
│   └── depends on: US-3.1
└── US-3.6 Loading & Error
    └── depends on: US-1.2, US-3.1, US-2.4

Sprint 4: Accounts, Categories, Transfer
├── US-4.1 Account Management
│   ├── depends on: US-2.5
│   └── US-4.3 Transfer
├── US-4.2 Category Management
│   ├── depends on: US-1.4
│   └── US-4.5 Icon/Color Picker
├── US-4.3 Transfer
│   ├── depends on: US-2.1, US-2.2, US-4.1
├── US-4.4 Account Selector
│   └── depends on: US-4.1
├── US-4.5 Icon/Color Picker
│   └── depends on: US-4.2
└── US-4.6 Balance Reconciliation
    └── depends on: US-2.2, US-2.5

Sprint 5: Budget & Recurring
├── US-5.1 Budget Setup
│   ├── depends on: US-2.2, US-4.2
│   └── US-5.2 Budget on Dashboard
├── US-5.2 Budget on Dashboard
│   └── depends on: US-5.1, US-3.1
├── US-5.3 Recurring Engine
│   ├── depends on: US-2.1, US-2.2, US-4.1
│   └── US-5.4 Recurring List
├── US-5.4 Recurring List
│   └── depends on: US-5.3
└── US-5.5 Overspending Notification
    └── depends on: US-5.1, US-3.1

Sprint 6: Insights & Search
├── US-6.1 Monthly Overview
│   ├── depends on: US-2.2, US-3.1
│   └── US-6.2 Category Chart
├── US-6.2 Category Chart
│   └── depends on: US-6.1
├── US-6.3 Global Search
│   ├── depends on: US-2.2, US-2.4
├── US-6.4 Stats
│   └── depends on: US-6.1
└── US-6.5 Trend
    └── depends on: US-6.1

Sprint 7: PWA, Offline, Notifications, TWA APK
├── US-7.1 PWA Manifest & SW
│   ├── depends on: US-1.1
│   ├── US-7.2 Install Prompt
│   ├── US-7.3 Notifications
│   ├── US-7.5 Offline Verification
│   ├── US-7.6 Shortcuts
│   └── US-7.7 TWA APK Build
├── US-7.2 Install Prompt
│   └── depends on: US-7.1
├── US-7.3 Notifications
│   └── depends on: US-7.1
├── US-7.4 Streak
│   ├── depends on: US-3.1, US-2.1
├── US-7.5 Offline Verification
│   └── depends on: ALL previous sprints
├── US-7.6 Shortcuts
│   └── depends on: US-7.1, US-2.1
├── US-7.7 TWA APK Build
│   ├── depends on: US-7.1 (PWA manifest must be valid)
│   └── US-7.8 In-App Update Checker
└── US-7.8 In-App Update Checker
    └── depends on: US-7.7

Sprint 8: Polish, Backup, Landing Page, Launch
├── US-8.1 Backup & Restore
│   └── depends on: US-1.4
├── US-8.2 Dark Mode
│   └── depends on: ALL UI components
├── US-8.3 Settings
│   ├── depends on: US-8.1, US-8.2, US-7.3
├── US-8.4 Performance
│   └── depends on: ALL previous sprints
├── US-8.5 Error Handling
│   └── depends on: ALL previous sprints
├── US-8.6 Final Testing
│   └── depends on: ALL previous sprints
├── US-8.7 Landing Page + APK Distribution
│   ├── depends on: US-7.7 (APK must be built)
│   └── US-8.8 Documentation
└── US-8.8 Documentation
    └── depends on: US-8.6, US-8.7

Sprint 8: Polish & Launch
├── US-8.1 Backup & Restore
│   └── depends on: US-1.4
├── US-8.2 Dark Mode
│   └── depends on: ALL UI components
├── US-8.3 Settings
│   ├── depends on: US-8.1, US-8.2, US-7.3
├── US-8.4 Performance
│   └── depends on: ALL previous sprints
├── US-8.5 Error Handling
│   └── depends on: ALL previous sprints
├── US-8.6 Final Testing
│   └── depends on: ALL previous sprints
├── US-8.7 Landing Page + APK Distribution
│   ├── depends on: US-7.7 (APK must be built)
│   └── US-8.8 Documentation
└── US-8.8 Documentation
    └── depends on: US-8.6, US-8.7
```

---

## 13. PERFORMANCE BUDGET TRACKER

Track ini harus di-update setiap sprint. Target akhir V1:

| Metric | Target | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Sprint 5 | Sprint 6 | Sprint 7 | Sprint 8 |
|---|---|---|---|---|---|---|---|---|---|
| Bundle (gzipped) | < 200KB | < 50KB | < 80KB | < 100KB | < 130KB | < 150KB | < 170KB | < 180KB | < 200KB |
| APK size | < 10MB | — | — | — | — | — | — | < 10MB | < 10MB |
| Startup time | < 1s | < 0.3s | < 0.4s | < 0.5s | < 0.6s | < 0.7s | < 0.8s | < 0.8s | < 1s |
| Dashboard render | < 200ms | — | — | < 200ms | < 200ms | < 200ms | < 200ms | < 200ms | < 200ms |
| Transaction add | < 100ms | — | < 100ms | < 100ms | < 100ms | < 100ms | < 100ms | < 100ms | < 100ms |
| List scroll (1000 items) | 60fps | — | < 60fps | 60fps | 60fps | 60fps | 60fps | 60fps | 60fps |
| Lighthouse Performance | ≥ 90 | ≥ 95 | ≥ 95 | ≥ 90 | ≥ 90 | ≥ 90 | ≥ 90 | ≥ 90 | ≥ 90 |
| Lighthouse PWA | ≥ 90 | — | — | — | — | — | — | ≥ 90 | ≥ 90 |
| Memory usage | < 100MB | < 30MB | < 40MB | < 50MB | < 60MB | < 70MB | < 80MB | < 90MB | < 100MB |

---

## APPENDIX: Pre-Launch Checklist

### PWA Checklist
- [ ] PWA manifest valid
- [ ] Service worker registered
- [ ] Offline mode tested (airplane mode)
- [ ] Install prompt works on Android Chrome
- [ ] Splash screen configured
- [ ] Icons (192, 512, maskable)
- [ ] Theme color set

### APK Checklist
- [ ] TWA APK built and signed
- [ ] APK installs on Android device
- [ ] APK works offline (airplane mode)
- [ ] APK notifications work
- [ ] APK opens in full-screen (no browser bar)
- [ ] assetlinks.json deployed and verified
- [ ] APK uploaded to GitHub Releases
- [ ] APK uploaded to website hosting
- [ ] APK download link works on landing page
- [ ] In-app update checker functional

### Performance Checklist
- [ ] Bundle size < 200KB gzipped
- [ ] Startup time < 1s on low-end device
- [ ] Transaction add < 3s
- [ ] List scroll 60fps with 1000 items
- [ ] Lighthouse score > 90 (all categories)

### Functionality Checklist
- [ ] IndexedDB migration tested
- [ ] Backup/restore tested
- [ ] Notification permission handled
- [ ] Daily reminder works
- [ ] Streak counter accurate
- [ ] Dark mode tested
- [ ] Error boundaries in place
- [ ] No console errors

### Launch Checklist
- [ ] Zero P0 bugs
- [ ] Zero P1 bugs
- [ ] README complete (includes APK build instructions)
- [ ] Privacy policy page exists
- [ ] Deployed to production URL
- [ ] Landing page live with APK download button
- [ ] Install instructions tested end-to-end
- [ ] WhatsApp support link active

---

*Document Version: 1.0*
*Created: May 2026*
*Based on: Perancangan_Nyatet_Duwit.md*
*Status: Ready for Sprint 1*
