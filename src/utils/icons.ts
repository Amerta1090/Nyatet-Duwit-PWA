import {
  Utensils, Car, ShoppingBag, Gamepad2, Receipt, HeartPulse,
  GraduationCap, Ellipsis, Banknote, Laptop, TrendingUp, Wallet,
  PiggyBank, Landmark, type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  'shopping-bag': ShoppingBag,
  'gamepad-2': Gamepad2,
  receipt: Receipt,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  ellipsis: Ellipsis,
  banknote: Banknote,
  laptop: Laptop,
  'trending-up': TrendingUp,
  wallet: Wallet,
  piggybank: PiggyBank,
  landmark: Landmark,
};

export function getCategoryIcon(iconName: string): LucideIcon {
  return iconMap[iconName] ?? Ellipsis;
}
