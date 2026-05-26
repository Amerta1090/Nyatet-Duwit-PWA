import { cn } from '@/utils/cn';
import {
  Utensils, Car, ShoppingBag, Gamepad2, Receipt, HeartPulse,
  GraduationCap, Ellipsis, Banknote, Laptop, TrendingUp, Wallet,
  PiggyBank, Landmark, Home, Zap, Gift, Coffee, Shirt, BookOpen,
  Dumbbell, Plane, Smartphone, Music, Camera, Monitor, Dog,
  type LucideIcon,
} from 'lucide-react';

const ICONS: { name: string; icon: LucideIcon }[] = [
  { name: 'utensils', icon: Utensils },
  { name: 'car', icon: Car },
  { name: 'shopping-bag', icon: ShoppingBag },
  { name: 'gamepad-2', icon: Gamepad2 },
  { name: 'receipt', icon: Receipt },
  { name: 'heart-pulse', icon: HeartPulse },
  { name: 'graduation-cap', icon: GraduationCap },
  { name: 'ellipsis', icon: Ellipsis },
  { name: 'banknote', icon: Banknote },
  { name: 'laptop', icon: Laptop },
  { name: 'trending-up', icon: TrendingUp },
  { name: 'wallet', icon: Wallet },
  { name: 'piggybank', icon: PiggyBank },
  { name: 'landmark', icon: Landmark },
  { name: 'home', icon: Home },
  { name: 'zap', icon: Zap },
  { name: 'gift', icon: Gift },
  { name: 'coffee', icon: Coffee },
  { name: 'shirt', icon: Shirt },
  { name: 'book-open', icon: BookOpen },
  { name: 'dumbbell', icon: Dumbbell },
  { name: 'plane', icon: Plane },
  { name: 'smartphone', icon: Smartphone },
  { name: 'music', icon: Music },
  { name: 'camera', icon: Camera },
  { name: 'monitor', icon: Monitor },
  { name: 'dog', icon: Dog },
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {ICONS.map(({ name, icon: Icon }) => (
        <button
          key={name}
          onClick={() => onChange(name)}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
            value === name
              ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-500 dark:bg-primary-500/20'
              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300',
          )}
          aria-label={name}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}
