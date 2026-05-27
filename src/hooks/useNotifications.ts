import { useState, useEffect, useCallback } from 'react';

const LS_KEY_REMINDER = 'nyatetduwit_reminder_enabled';
const LS_KEY_HOUR = 'nyatetduwit_reminder_hour';
const LS_KEY_MINUTE = 'nyatetduwit_reminder_minute';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | 'unavailable'>('default');
  const [enabled, setEnabled] = useState(() => localStorage.getItem(LS_KEY_REMINDER) === 'true');
  const [hour, setHourState] = useState(() => {
    const saved = localStorage.getItem(LS_KEY_HOUR);
    return saved ? parseInt(saved, 10) : 20;
  });
  const [minute, setMinuteState] = useState(() => {
    const saved = localStorage.getItem(LS_KEY_MINUTE);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unavailable');
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  const setHour = useCallback((h: number) => {
    setHourState(h);
    localStorage.setItem(LS_KEY_HOUR, String(h));
  }, []);

  const setMinute = useCallback((m: number) => {
    setMinuteState(m);
    localStorage.setItem(LS_KEY_MINUTE, String(m));
  }, []);

  const toggle = useCallback(
    async (val: boolean) => {
      if (val && permission === 'default') {
        const granted = await requestPermission();
        if (!granted) return;
      }
      setEnabled(val);
      localStorage.setItem(LS_KEY_REMINDER, String(val));

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: val ? 'SCHEDULE_REMINDER' : 'CLEAR_REMINDER',
          payload: val ? { hour, minute } : undefined,
        });
      }
    },
    [permission, requestPermission, hour, minute],
  );

  return { permission, enabled, hour, minute, toggle, setHour, setMinute, requestPermission };
}
