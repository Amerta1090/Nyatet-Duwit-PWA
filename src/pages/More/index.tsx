import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Tags, Landmark, ArrowLeftRight, Settings, Shield, Database, FileDown, ChevronRight, Heart, ExternalLink, Target, ShieldAlert, HandCoins } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

const SAWERIA_URL = 'http://saweria.co/abdulmajidr708';

const menuItems = [
  { icon: Wallet, label: 'Akun', path: '/more/accounts', color: 'text-primary-500' },
  { icon: Tags, label: 'Kategori', path: '/more/categories', color: 'text-accent-500' },
  { icon: Landmark, label: 'Anggaran', path: '/more/budgets', color: 'text-amber-500' },
  { icon: Target, label: 'Goals', path: '/more/goals', color: 'text-rose-500' },
  { icon: ShieldAlert, label: 'Dana Darurat', path: '/more/emergency-fund', color: 'text-blue-500' },
  { icon: HandCoins, label: 'Utang & Piutang', path: '/more/debt', color: 'text-purple-500' },
  { icon: ArrowLeftRight, label: 'Transaksi Berulang', path: '/more/recurring', color: 'text-purple-500' },
  { icon: FileDown, label: 'Export Data', path: '/more/export', color: 'text-emerald-500' },
  { icon: Settings, label: 'Pengaturan', path: '/more/settings', color: 'text-neutral-500' },
  { icon: Shield, label: 'Backup & Restore', path: '/more/backup', color: 'text-rose-500' },
  { icon: Database, label: 'Reconcile Saldo', path: '/more/reconcile', color: 'text-cyan-500' },
  { icon: Heart, label: 'Support Me', path: SAWERIA_URL, color: 'text-red-500' },
];

export default function MorePage() {
  const navigate = useNavigate();
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 py-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">Menu</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => {
                if (item.label === 'Support Me') {
                  setSupportOpen(true);
                } else {
                  navigate(item.path);
                }
              }}
              className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5 text-left transition-all hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
                {Icon && <Icon className={`h-5 w-5 ${item.color}`} />}
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-300" />
            </button>
          );
        })}
      </div>

      <Modal open={supportOpen} onClose={() => setSupportOpen(false)} title="Support Me">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/saweria-support-me.png"
            alt="Scan QR untuk donasi"
            className="w-48 h-48 object-contain"
          />
          <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
            Scan QR di atas atau klik tombol di bawah untuk mendukung pengembang melalui Saweria.
          </p>
          <a
            href={SAWERIA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600"
          >
            <ExternalLink className="h-4 w-4" />
            Buka Saweria
          </a>
        </div>
      </Modal>
    </>
  );
}
