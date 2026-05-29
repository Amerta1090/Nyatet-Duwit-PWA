/// <reference lib="webworker" />

const SW = self as unknown as ServiceWorkerGlobalScope;
const CACHE_NAME = 'nyatetduwit-v1';

type ManifestEntry = { url: string; revision: string | null };

SW.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const manifest: ManifestEntry[] = (self as any).__WB_MANIFEST || [];
      await cache.addAll(manifest.map((entry) => entry.url));
    })(),
  );
  SW.skipWaiting();
});

SW.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
      await SW.clients.claim();
    })(),
  );
});

SW.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Google Fonts: cache-first with dedicated cache
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(cacheFirst(request, 'google-fonts'));
    return;
  }

  // Same-origin (app shell, JS, CSS, images): network-first
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cross-origin non-font: network-first
  event.respondWith(networkFirst(request));
});

async function cacheFirst(request: Request, cacheName?: string) {
  const cache = await caches.open(cacheName || CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request: Request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

SW.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_REMINDER') {
    const { hour, minute } = event.data.payload;
    scheduleDailyReminder(hour, minute);
  }
  if (event.data?.type === 'CLEAR_REMINDER') {
    SW.registration.getNotifications().then((notifications) => {
      notifications.forEach((n) => n.close());
    });
  }
  if (event.data?.type === 'SCHEDULE_WEEKLY_SUMMARY') {
    scheduleWeeklySummary();
  }
  if (event.data?.type === 'CLEAR_WEEKLY_SUMMARY') {
    SW.registration.getNotifications().then((notifications) => {
      notifications.forEach((n) => {
        if (n.tag === 'weekly-summary') n.close();
      });
    });
  }
  if (event.data?.type === 'SHOW_WEEKLY_SUMMARY_NOW') {
    const { totalExpense, totalIncome, topCategory } = event.data.payload;
    showWeeklyNotification(totalExpense, totalIncome, topCategory);
  }
});

function scheduleDailyReminder(hour: number, minute: number) {
  const now = Date.now();
  const next = getNextAlarm(now, hour, minute);
  const delay = next - now;

  setTimeout(() => {
    const opts: NotificationOptions = {
      body: 'Jangan lupa catat pengeluaranmu hari ini!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'daily-reminder',
    };
    SW.registration.showNotification('NyatetDuwit', opts);
    scheduleDailyReminder(hour, minute);
  }, delay);
}

function getNextAlarm(now: number, hour: number, minute: number): number {
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

function scheduleWeeklySummary() {
  const now = Date.now();
  const next = getNextSunday1900(now);
  const delay = next - now;

  setTimeout(() => {
    // Ask the client (app) to generate and send weekly summary data
    SW.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: 'GENERATE_WEEKLY_SUMMARY' });
      }
    });

    // Fallback: show generic notification in case no client responds
    setTimeout(() => {
      showWeeklyNotification(0, 0, '');
    }, 5000);

    scheduleWeeklySummary();
  }, delay);
}

function showWeeklyNotification(totalExpense: number, totalIncome: number, topCategory: string) {
  if (totalExpense === 0 && totalIncome === 0) {
    const opts: NotificationOptions = {
      body: 'Tidak ada transaksi minggu ini.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'weekly-summary',
      data: { url: '/' },
    };
    SW.registration.showNotification('Ringkasan Mingguan', opts);
    return;
  }

  const expenseStr = `Rp ${totalExpense.toLocaleString('id-ID')}`;
  const incomeStr = `Rp ${totalIncome.toLocaleString('id-ID')}`;
  let body = `Pengeluaran: ${expenseStr}\nPemasukan: ${incomeStr}`;
  if (topCategory) body += `\nKategori teratas: ${topCategory} (${expenseStr})`;

  SW.registration.showNotification('Ringkasan Mingguan', {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'weekly-summary',
    data: { url: '/' },
  });
}

function getNextSunday1900(now: number): number {
  const next = new Date(now);
  next.setHours(19, 0, 0, 0);
  const dayOfWeek = next.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7;
  if (daysUntilSunday === 0 && next.getTime() <= now) {
    next.setDate(next.getDate() + 7);
  } else {
    next.setDate(next.getDate() + daysUntilSunday);
  }
  return next.getTime();
}

SW.addEventListener('notificationclick', (event) => {
  const url = event.notification.data?.url || '/';
  event.notification.close();
  event.waitUntil(
    SW.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const client = clients[0];
      if (client) {
        client.focus();
      } else {
        SW.clients.openWindow(url);
      }
    }),
  );
});
