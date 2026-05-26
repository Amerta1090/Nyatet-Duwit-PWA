export const colors = {
  primary: { 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#1E40AF', 700: '#1D4ED8', 900: '#1E3A8A' },
  accent: { 50: '#ECFDF5', 500: '#10B981', 600: '#059669' },
  danger: { 50: '#FEF2F2', 500: '#EF4444', 600: '#DC2626' },
  neutral: { 50: '#F8FAFC', 100: '#F1F5F9', 500: '#64748B', 700: '#334155', 900: '#0F172A' },
} as const;

export const spacing = {
  4: '4px', 8: '8px', 12: '12px', 16: '16px', 20: '20px', 24: '24px', 32: '32px', 48: '48px',
} as const;

export const radius = {
  sm: '6px', md: '10px', lg: '16px', full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
} as const;
