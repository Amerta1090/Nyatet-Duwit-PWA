import { useNotifications } from '@/hooks/useNotifications';
import { useAppStore } from '@/stores/appStore';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Sun, Moon, Database, Info, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { permission, enabled, hour, minute, setHour, setMinute, toggle } = useNotifications();
  const darkMode = useAppStore((s) => s.darkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* Tampilan */}
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Tampilan</p>

      <div className="rounded-xl bg-white p-4 dark:bg-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="h-5 w-5 text-primary-500" /> : <Sun className="h-5 w-5 text-amber-500" />}
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Mode Gelap</p>
              <p className="text-xs text-neutral-400">{darkMode ? 'Aktif' : 'Nonaktif'}</p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative h-6 w-11 rounded-full transition-colors ${darkMode ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}
            role="switch"
            aria-checked={darkMode}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-5' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Notifikasi */}
      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-neutral-400">Notifikasi</p>

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
              className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
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
              className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
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

      {/* Data */}
      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-neutral-400">Data</p>

      <button
        onClick={() => navigate('/more/backup')}
        className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5 text-left transition-all hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
          <Database className="h-5 w-5 text-rose-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Backup & Restore</p>
          <p className="text-xs text-neutral-400">Export atau import data</p>
        </div>
        <ChevronRight className="h-4 w-4 text-neutral-300" />
      </button>

      {/* Tentang */}
      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-neutral-400">Tentang</p>

      <div className="rounded-xl bg-white p-4 dark:bg-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
            <Info className="h-5 w-5 text-primary-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">NyatetDuwit</p>
            <p className="text-xs text-neutral-400">Versi {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
