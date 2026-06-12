import type { ReactNode } from 'react';
import { useAppLock } from '@/hooks/useAppLock';
import { LockScreen } from './LockScreen';

export const appLockRef = {
  _hook: null as ReturnType<typeof useAppLock> | null,
};

interface Props {
  children: ReactNode;
}

export function AppLockProvider({ children }: Props) {
  const hook = useAppLock();
  appLockRef._hook = hook;

  return (
    <>
      {hook.isLocked && (
        <LockScreen
          onUnlock={hook.unlock}
          biometricEnabled={hook.biometricEnabled}
        />
      )}
      {children}
    </>
  );
}
