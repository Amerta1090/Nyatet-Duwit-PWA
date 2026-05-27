# NyatetDuwit

> Personal Finance PWA untuk User Indonesia — cepat, private, offline-first.

Catat pemasukan & pengeluaran dalam < 3 detik. Semua data tetap di HP kamu.

## Fitur

- Quick Add Transaction (amount + category, < 3 detik)
- Manajemen Akun (Cash, Bank, E-Wallet)
- Manajemen Kategori (12 default + custom)
- Dashboard, Monthly Overview, Category Breakdown
- Budget per Kategori
- Transaksi Berulang
- Filter & Search
- Dark Mode
- Daily Reminder Notification
- Recording Streak
- Backup & Restore (JSON export/import)
- 100% Offline
- PWA Installable

## Tech Stack

| Stack | Pilihan |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Database | Dexie.js 4 (IndexedDB) |
| State | Zustand 5 |
| Routing | React Router 7 |
| PWA | vite-plugin-pwa |
| Icons | Lucide React |
| Date | date-fns |
| Testing | Vitest + Testing Library |

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

## PWA

App di-build sebagai PWA (Progressive Web App) dengan:

- Service worker untuk caching app shell
- Manifest untuk installability
- Ikon 192px, 512px, maskable
- Dapat di-install dari browser Android

## APK Build (TWA)

Untuk distribusi APK:

```bash
# Prerequisites
npm install -g @googlechrome/bubblewrap
# or use https://pwabuilder.com

# Init TWA project
bubblewrap init --manifest https://nyatetduwit.app/manifest.json

# Build signed APK
bubblewrap build

# Output: app-release-signed.apk
```

APK juga bisa di-build otomatis via GitHub Actions saat tag dibuat.

## Landing Page

Landing page tersedia di `/landing.html` untuk distribusi APK.

## Data

Semua data disimpan di IndexedDB lokal. Export ke JSON untuk backup.

## Lisensi

MIT
