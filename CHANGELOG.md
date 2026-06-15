# Changelog

## [2.0.0] - 2026-06-15

### Added
- **Savings Goal System** (Sprint 1): Goal CRUD with target/deadline/icon/color, progress bar, goal dashboard widget, milestone celebration (25/50/75/100%)
- **Emergency Fund & Debt Tracker** (Sprint 2): Emergency fund calculator (3× monthly expense), debt/piutang CRUD with partial payment tracking, due date reminders, debt dashboard widget, net balance summary
- **Tag System** (Sprint 3): Tag CRUD with color picker, multi-select tag assignment on transactions, tag filter in transaction list, tag analytics in Insights, keyword-based tag suggestions
- **Spending Trend & Cashflow Charts** (Sprint 4): 90-day spending trend line chart with 7-day moving average, pinch-to-zoom and pan, period comparison overlay; cashflow dual bar chart (income vs expense) with 6/12/24 month selector; all charts hand-rolled SVG, auto code-split
- **Import CSV & App Lock** (Sprint 5): CSV import with column mapping, preview, validation, duplicate detection, support for Money Lover & generic formats; app lock with PIN 6-digit and biometric (WebAuthn), configurable timeout, graceful fallback
- **Local Encryption & Smart Notifications** (Sprint 6): AES-256-GCM encryption toggle for sensitive fields (amount, notes, person names) using Web Crypto API; adaptive notification timing based on user recording patterns; V2 data in monthly review (tags, goals, debt, emergency fund)
- **Transfer History & PWA Shortcuts** (Sprint 7): Dedicated transfer history page with account/date filters, grouped by date, summary card; 4 PWA shortcuts (Tambah Transaksi, Tambah Makanan, Dashboard, Insight); URL param deep linking for category pre-selection; in-app update checker with changelog, force update, and "What's New" modal

### Changed
- Dashboard: now shows goal progress widget, debt summary (collapsible), emergency fund status
- Insights: tag spending breakdown, category pie chart, month-over-month comparison
- More page: reorganized with new sections (Goals, Debt, Tags, Transfer History, Import)
- Transaction form: optional tag assignment with multi-select chips
- Security settings: app lock toggle, encryption toggle, biometric config
- All V2 pages lazy-loaded to maintain bundle size < 350KB gzipped

### Performance
- Total JS bundle: ~260KB gzipped (well under 350KB target)
- All charts render in < 500ms via hand-rolled SVG
- Encryption overhead < 50ms per operation
- All 23 page routes code-split via React.lazy

## [1.5.0] - 2026-05-28

### Added
- Onboarding v2: 3 swipeable intro screens + setup wizard (language, account name, category selection, reminder time)
- Language toggle (Indonesia / English) — stored in settings, consumed via `useI18n` hook
- Number format toggle — show/hide decimals in currency display
- Open source licenses link in Settings

### Changed
- Settings page reorganized with new sections for language and number format
- Default accounts and categories are now configurable during first-run setup
- Formatting utilities support dynamic decimal toggle

## [1.4.0] - 2026-05-21

### Added
- Export transactions to CSV and PDF
- PieChart component for expense breakdown
- Insight sharing button
- BarChart component for monthly comparison
- Contextual EmptyState components

### Changed
- Insights page improved with radial progress and category distribution

## [1.3.0] - 2026-05-14

### Added
- Weekly summary card on Home
- "You Saved" highlight card
- Monthly review page with full breakdown
- Recurring transaction scheduling via Service Worker
- `useWeeklySummary` hook for aggregated weekly data

## [1.2.0] - 2026-05-07

### Added
- Budget management (set monthly budgets per category)
- Recurring transaction support
- Account reconciliation
- Insights page with charts
- Transaction search by notes/category/amount

## [1.1.0] - 2026-04-30

### Added
- Account management (multiple accounts)
- Category management (custom categories)
- Transfer between accounts
- Data backup and restore via JSON file
- PWA install prompt
- Push notifications for reminders

## [1.0.0] - 2026-04-23

### Added
- CRUD transactions (income, expense)
- Dashboard with monthly summary
- Dark mode support
- Offline-first architecture with IndexedDB
- Initial settings page
