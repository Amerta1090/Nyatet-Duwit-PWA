import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding, setupOnboardingAccount, archiveUnusedCategories } from '@/hooks/useOnboarding';
import { db } from '@/db/schema';
import { useUIStore } from '@/stores/uiStore';
import {
  Zap, Lock, WifiOff, ArrowRight, Check,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const screens = [
  {
    icon: Zap,
    titleKey: 'onboarding_screen1_title' as const,
    descKey: 'onboarding_screen1_desc' as const,
    color: 'bg-amber-500',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Lock,
    titleKey: 'onboarding_screen2_title' as const,
    descKey: 'onboarding_screen2_desc' as const,
    color: 'bg-emerald-500',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: WifiOff,
    titleKey: 'onboarding_screen3_title' as const,
    descKey: 'onboarding_screen3_desc' as const,
    color: 'bg-primary-500',
    iconBg: 'bg-blue-100 text-primary-600',
  },
];

const textContent: Record<string, { title: string; desc: string }[]> = {
  id: [
    { title: 'Catat Keuangan dalam 3 Detik', desc: 'Tap + → ketik jumlah → pilih kategori → selesai. Cuma butuh 3 detik untuk catat transaksi harian.' },
    { title: 'Data Tetap di HP Kamu', desc: 'Tidak perlu login. Tidak ada yang lihat data keuangan kamu. Privacy first, selalu.' },
    { title: 'Bisa Dipakai Offline', desc: 'Di angkot, di basement, di gunung — tetap bisa nyatet. Internet bukan penghalang.' },
  ],
  en: [
    { title: 'Track Finances in 3 Seconds', desc: 'Tap + → type amount → select category → done. Only takes 3 seconds to log daily transactions.' },
    { title: 'Your Data Stays on Your Phone', desc: 'No login required. Nobody sees your financial data. Privacy first, always.' },
    { title: 'Works Offline', desc: 'On the bus, in the basement, on a mountain — keep tracking. Internet not required.' },
  ],
};

const allCategoryIds = [
  'cat-food', 'cat-transport', 'cat-shopping', 'cat-entertainment',
  'cat-bills', 'cat-health', 'cat-education', 'cat-other-expense',
  'cat-salary', 'cat-freelance', 'cat-investment', 'cat-other-income',
];

const categoryLabelsId: { id: string; label: string }[] = [
  { id: 'cat-food', label: 'Makan & Minum' },
  { id: 'cat-transport', label: 'Transport' },
  { id: 'cat-shopping', label: 'Belanja' },
  { id: 'cat-entertainment', label: 'Hiburan' },
  { id: 'cat-bills', label: 'Tagihan' },
  { id: 'cat-health', label: 'Kesehatan' },
  { id: 'cat-education', label: 'Pendidikan' },
  { id: 'cat-other-expense', label: 'Lainnya (Pengeluaran)' },
  { id: 'cat-salary', label: 'Gaji' },
  { id: 'cat-freelance', label: 'Freelance' },
  { id: 'cat-investment', label: 'Investasi' },
  { id: 'cat-other-income', label: 'Lainnya (Pemasukan)' },
];

const categoryLabelsEn: { id: string; label: string }[] = [
  { id: 'cat-food', label: 'Food & Drinks' },
  { id: 'cat-transport', label: 'Transport' },
  { id: 'cat-shopping', label: 'Shopping' },
  { id: 'cat-entertainment', label: 'Entertainment' },
  { id: 'cat-bills', label: 'Bills' },
  { id: 'cat-health', label: 'Health' },
  { id: 'cat-education', label: 'Education' },
  { id: 'cat-other-expense', label: 'Other (Expense)' },
  { id: 'cat-salary', label: 'Salary' },
  { id: 'cat-freelance', label: 'Freelance' },
  { id: 'cat-investment', label: 'Investment' },
  { id: 'cat-other-income', label: 'Other (Income)' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const { complete } = useOnboarding();
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [accountName, setAccountName] = useState('Cash');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(allCategoryIds));
  const [reminderHour, setReminderHour] = useState(20);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [loading, setLoading] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const texts = textContent[lang]!;
  const catLabels = lang === 'id' ? categoryLabelsId : categoryLabelsEn;

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0]!.clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0]!.clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && step < (screens.length)) goNext();
      if (diff < 0 && step > 0) setStep((s) => s - 1);
    }
  };

  const goNext = useCallback(() => {
    if (step < screens.length) setStep((s) => s + 1);
  }, [step]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  async function handleFinish() {
    setLoading(true);
    try {
      await db.settings.put({ key: 'language', value: lang });
      await db.settings.put({ key: 'reminder_time', value: `${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}` });
      await setupOnboardingAccount(accountName);
      await archiveUnusedCategories(Array.from(selectedCategories));
      await complete();
      showToast('Selamat datang di NyatetDuwit!', 'success');
      navigate('/', { replace: true });
    } catch {
      showToast('Gagal menyimpan pengaturan', 'error');
    }
    setLoading(false);
  }

  function handleSkip() {
    complete().then(() => {
      navigate('/', { replace: true });
    });
  }

  const totalSteps = screens.length + 1;

  if (step <= screens.length - 1) {
    const s = screens[step]!;
    const t = texts[step]!;
    return (
      <div
        className="flex h-dvh flex-col bg-white dark:bg-neutral-900"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between px-6 pt-4">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={cn('h-1.5 rounded-full transition-all', i === step ? 'w-6 bg-primary-500' : 'w-1.5 bg-neutral-200 dark:bg-neutral-600')}
              />
            ))}
          </div>
          <button onClick={handleSkip} className="text-xs font-medium text-neutral-400">Lewati</button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-8">
          <div className={cn('mb-8 flex h-24 w-24 items-center justify-center rounded-2xl', s.iconBg)}>
            <s.icon className="h-10 w-10" />
          </div>
          <h1 className="mb-3 text-center text-2xl font-bold text-neutral-900 dark:text-neutral-50">{t.title}</h1>
          <p className="text-center text-sm leading-relaxed text-neutral-500">{t.desc}</p>
        </div>

        <div className="px-6 pb-10">
          <button
            onClick={goNext}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 text-base font-semibold text-white shadow-lg shadow-primary-200 transition-all hover:bg-primary-700 active:scale-[0.98] dark:shadow-primary-900"
          >
            Lanjut
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between px-6 pt-4">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn('h-1.5 rounded-full transition-all', i === step ? 'w-6 bg-primary-500' : 'w-1.5 bg-neutral-200 dark:bg-neutral-600')}
            />
          ))}
        </div>
        <button onClick={handleSkip} className="text-xs font-medium text-neutral-400">Lewati</button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <h1 className="mb-6 text-xl font-bold text-neutral-900 dark:text-neutral-50">Setup Cepat</h1>

        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium text-neutral-500">Bahasa / Language</label>
          <div className="flex gap-2">
            <button
              onClick={() => setLang('id')}
              className={cn('flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all', lang === 'id' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300')}
            >
              Indonesia
            </button>
            <button
              onClick={() => setLang('en')}
              className={cn('flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all', lang === 'en' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300')}
            >
              English
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium text-neutral-500">Nama Akun Utama</label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition-all focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="Cash"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium text-neutral-500">Pilih Kategori</label>
          <p className="mb-3 text-xs text-neutral-400">Pilih kategori yang relevan untuk kamu. Yang tidak dipilih akan disembunyikan.</p>
          <div className="flex flex-wrap gap-2">
            {catLabels.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  selectedCategories.has(cat.id)
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-700',
                )}
              >
                {selectedCategories.has(cat.id) && <Check className="h-3 w-3" />}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium text-neutral-500">Pengingat Harian</label>
          <p className="mb-2 text-xs text-neutral-400">Kami akan ingatkan kamu setiap hari untuk catat pengeluaran.</p>
          <div className="flex items-center gap-2">
            <select
              value={reminderHour}
              onChange={(e) => setReminderHour(parseInt(e.target.value, 10))}
              className="h-10 flex-1 rounded-xl border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-sm text-neutral-400">:</span>
            <select
              value={reminderMinute}
              onChange={(e) => setReminderMinute(parseInt(e.target.value, 10))}
              className="h-10 flex-1 rounded-xl border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            >
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="px-6 pb-10">
        <button
          onClick={handleFinish}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 text-base font-semibold text-white shadow-lg shadow-primary-200 transition-all hover:bg-primary-700 active:scale-[0.98] disabled:opacity-60 dark:shadow-primary-900"
        >
          {loading ? 'Menyimpan...' : 'Mulai Mencatat'}
          {!loading && <Check className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
