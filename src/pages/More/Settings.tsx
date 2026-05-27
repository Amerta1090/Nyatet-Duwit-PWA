import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellOff } from 'lucide-react';

export default function SettingsPage() {
  const { permission, enabled, hour, minute, setHour, setMinute, toggle } = useNotifications();

  return (
    <div className="flex flex-col gap-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Notifikasi</p>

      <div className="rounded-xl bg-white p-4 dark:bg-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {enabled ? <Bell className="h-5 w-5 text-primary-500" /> : <BellOff className="h-5 w-5 text-neutral-400" />}
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Pengingat harian</p>
              <p className="text-xs text-neutral-400">
                {enabled ? `Setiap jam ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` : 'Mati'}
              </p>
            </div>
          </div>
          <button
            onClick={() => toggle(!enabled)}
            className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}
            role="switch"
            aria-checked={enabled}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : ''}`}
            />
          </button>
        </div>

        {enabled && (
          <div className="mt-4 flex items-center gap-3">
            <label className="text-xs text-neutral-500">Jam:</label>
            <select
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value, 10))}
              className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-700"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, '0')}
                </option>
              ))}
            </select>
            <span className="text-xs text-neutral-400">:</span>
            <select
              value={minute}
              onChange={(e) => setMinute(parseInt(e.target.value, 10))}
              className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-700"
            >
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        )}

        {permission === 'denied' && (
          <p className="mt-2 text-xs text-danger-500">
            Izin notifikasi ditolak. Aktifkan melalui pengaturan browser.
          </p>
        )}
      </div>
    </div>
  );
}
