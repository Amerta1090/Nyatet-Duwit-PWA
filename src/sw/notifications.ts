/// <reference lib="webworker" />

const SW = self as unknown as ServiceWorkerGlobalScope;

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
});

function scheduleDailyReminder(hour: number, minute: number) {
  const now = Date.now();
  const next = getNextAlarm(now, hour, minute);
  const delay = next - now;

  setTimeout(() => {
    const opts: NotificationOptions & { vibrate?: number[] } = {
      body: 'Jangan lupa catat pengeluaranmu hari ini!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'daily-reminder',
      vibrate: [200, 100, 200],
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

SW.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    SW.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const client = clients[0];
      if (client) {
        client.focus();
      } else {
        SW.clients.openWindow('/');
      }
    }),
  );
});
