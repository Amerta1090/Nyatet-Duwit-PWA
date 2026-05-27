import { useNavigate } from 'react-router-dom';
import { Wallet, Tags, Landmark, ArrowLeftRight, Settings, Shield, Database, ChevronRight } from 'lucide-react';

const menuItems = [
  { icon: Wallet, label: 'Akun', path: '/more/accounts', color: 'text-primary-500' },
  { icon: Tags, label: 'Kategori', path: '/more/categories', color: 'text-accent-500' },
  { icon: Landmark, label: 'Anggaran', path: '/more/budgets', color: 'text-amber-500' },
  { icon: ArrowLeftRight, label: 'Transaksi Berulang', path: '/more/recurring', color: 'text-purple-500' },
  { icon: Settings, label: 'Pengaturan', path: '/more/settings', color: 'text-neutral-500', disabled: true },
  { icon: Shield, label: 'Backup & Restore', path: '/more/backup', color: 'text-rose-500', disabled: true },
  { icon: Database, label: 'Reconcile Saldo', path: '/more/reconcile', color: 'text-cyan-500', disabled: true },
];

export default function MorePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2 py-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">Menu</p>
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => {
              if (!item.disabled) navigate(item.path);
            }}
            disabled={item.disabled}
            className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5 text-left transition-all hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
              <Icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{item.label}</span>
              {item.disabled && <span className="ml-2 text-[10px] text-neutral-400">(Sprint 6-8)</span>}
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
          </button>
        );
      })}
    </div>
  );
}
