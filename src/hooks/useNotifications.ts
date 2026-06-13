import { useState, useEffect, useCallback } from 'react';

const LS_KEY_REMINDER = 'nyatetduwit_reminder_enabled';
const LS_KEY_HOUR = 'nyatetduwit_reminder_hour';
const LS_KEY_MINUTE = 'nyatetduwit_reminder_minute';
const LS_KEY_SMART = 'nyatetduwit_reminder_smart';
const LS_KEY_HOUR_HISTORY = 'nyatetduwit_recording_hours';

const HOUR_HISTORY_DAYS = 7;
const MS_PER_DAY = 86400000;

function loadHourHistory(): number[] {
  try {
    const raw = localStorage.getItem(LS_KEY_HOUR_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { hour: number; ts: number }[];
    const cutoff = Date.now() - HOUR_HISTORY_DAYS * MS_PER_DAY;
    return parsed.filter((h) => h.ts > cutoff).map((h) => h.hour);
  } catch {
    return [];
  }
}

function saveHourEntry(hour: number) {
  const raw = localStorage.getItem(LS_KEY_HOUR_HISTORY);
  let entries: { hour: number; ts: number }[] = [];
  if (raw) {
    try { entries = JSON.parse(raw); } catch { /* reset */ }
  }
  const cutoff = Date.now() - HOUR_HISTORY_DAYS * MS_PER_DAY;
  entries = entries.filter((h) => h.ts > cutoff);
  entries.push({ hour, ts: Date.now() });
  localStorage.setItem(LS_KEY_HOUR_HISTORY, JSON.stringify(entries));
}

function calculatePeakHour(): number | null {
  const hours = loadHourHistory();
  if (hours.length < 3) return null;
  const counts = new Map<number, number>();
  for (const h of hours) {
    counts.set(h, (counts.get(h) ?? 0) + 1);
  }
  let peak = -1;
  let maxCount = 0;
  for (const [hour, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      peak = hour;
    }
  }
  if (peak < 0) return null;
  // Send reminder 1 hour before peak
  return (peak - 1 + 24) % 24;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | 'unavailable'>('default');
  const [enabled, setEnabled] = useState(() => localStorage.getItem(LS_KEY_REMINDER) === 'true');
  const [smart, setSmartState] = useState(() => localStorage.getItem(LS_KEY_SMART) === 'true');
  const [hour, setHourState] = useState(() => {
    const saved = localStorage.getItem(LS_KEY_HOUR);
    return saved ? parseInt(saved, 10) : 20;
  });
  const [minute, setMinuteState] = useState(() => {
    const saved = localStorage.getItem(LS_KEY_MINUTE);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [peakHour, setPeakHour] = useState<number | null>(null);

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unavailable');
      return;
    }
    setPermission(Notification.permission);
  }, []);

  // Recalculate peak hour on mount and periodically
  useEffect(() => {
    const update = () => setPeakHour(calculatePeakHour());
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
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
    if (enabled && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_REMINDER',
        payload: { hour: h, minute },
      });
    }
  }, [enabled, minute]);

  const setMinute = useCallback((m: number) => {
    setMinuteState(m);
    localStorage.setItem(LS_KEY_MINUTE, String(m));
    if (enabled && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_REMINDER',
        payload: { hour, minute: m },
      });
    }
  }, [enabled, hour]);

  const setSmart = useCallback((val: boolean) => {
    setSmartState(val);
    localStorage.setItem(LS_KEY_SMART, String(val));
    if (enabled && navigator.serviceWorker.controller) {
      const effectiveHour = val && peakHour !== null ? peakHour : hour;
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_REMINDER',
        payload: { hour: effectiveHour, minute },
      });
    }
  }, [enabled, peakHour, hour, minute]);

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
          payload: val ? { hour: smart && peakHour !== null ? peakHour : hour, minute } : undefined,
        });
      }
    },
    [permission, requestPermission, hour, minute, smart, peakHour],
  );

  /**
   * Track a transaction recording at the given hour.
   * Called when a transaction is saved.
   */
  const trackRecording = useCallback((h: number) => {
    saveHourEntry(h);
    setPeakHour(calculatePeakHour());
    // If smart mode is on, re-schedule notification with new peak
    if (enabled && smart && navigator.serviceWorker.controller) {
      const newPeak = calculatePeakHour();
      if (newPeak !== null) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SCHEDULE_REMINDER',
          payload: { hour: newPeak, minute },
        });
      }
    }
  }, [enabled, smart, minute]);

  return {
    permission, enabled, hour, minute, smart, peakHour,
    toggle, setHour, setMinute, setSmart, requestPermission, trackRecording,
  };
}
