# NyatetDuwit

> Personal Finance PWA untuk User Indonesia — cepat, private, offline-first. **V2 telah rilis!**

🌐 **Live demo:** [https://nyatet-duwit.abdulmajidr708.workers.dev/](https://nyatet-duwit.abdulmajidr708.workers.dev/)

Catat pemasukan & pengeluaran dalam < 3 detik. Semua data tetap di HP kamu.

## Fitur

### V2 (Baru!)
- 🎯 **Savings Goal System**: Buat goal tabungan, track progress, milestone celebration
- 🛡️ **Emergency Fund Tracker**: Hitung dana darurat (3× pengeluaran), pantau progress
- 💳 **Debt/Piutang Tracker**: Catat utang & piutang, partial payment, due date reminders
- 🏷️ **Tag System**: Tag transaksi, filter by tag, analisis per tag
- 📈 **Spending Trend Chart**: Line chart 90 hari dengan moving average, zoom & pan
- 💰 **Cashflow Chart**: Dual bar chart pemasukan vs pengeluaran per bulan
- 📄 **Import CSV**: Import dari Money Lover / generic CSV dengan column mapping
- 🔒 **App Lock**: Kunci app dengan PIN 6 digit atau biometrik (WebAuthn)
- 🔐 **Local Encryption**: Enkripsi AES-256-GCM untuk data sensitif (opsional)
- 🔔 **Smart Notification**: Notifikasi adaptive berdasarkan kebiasaan catat user
- 🔄 **Transfer History**: Riwayat transfer antar akun dengan filter
- 📱 **PWA Shortcuts**: 4 shortcut saat long-press icon (Tambah Transaksi, Makanan, Dashboard, Insight)

### V1/V1.5 (Sejak Awal)
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
- Export CSV & PDF
- Onboarding v2 (setup wizard)
- Language toggle (Indonesia / English)
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
| Encryption | Web Crypto API (AES-256-GCM) |
| Testing | Vitest + Testing Library (160+ tests) |

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
bubblewrap init --manifest https://nyatet-duwit.abdulmajidr708.workers.dev/manifest.json

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
