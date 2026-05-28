# Changelog

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
