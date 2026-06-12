import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const LS_KEY_PIN_HASH = 'nyatetduwit_pin_hash';
const LS_KEY_LOCK_TIMER = 'nyatetduwit_lock_timer';
const LS_KEY_BIOMETRIC = 'nyatetduwit_biometric';

const EXEMPT_ROUTES = ['/onboarding'];

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'nyatetduwit_salt');
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }
  // Simple fallback hash
  let hash = 0;
  const str = pin + 'nyatetduwit_salt';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export interface LockState {
  locked: boolean;
  hasPin: boolean;
  pinHash: string | null;
  lockTimer: number; // milliseconds
  biometricEnabled: boolean;
}

export function useAppLock() {
  const location = useLocation();
  const lastActive = useRef(Date.now());
  const [state, setState] = useState<LockState>(() => ({
    locked: false,
    hasPin: !!localStorage.getItem(LS_KEY_PIN_HASH),
    pinHash: localStorage.getItem(LS_KEY_PIN_HASH),
    lockTimer: parseInt(localStorage.getItem(LS_KEY_LOCK_TIMER) ?? '0', 10),
    biometricEnabled: localStorage.getItem(LS_KEY_BIOMETRIC) === 'true',
  }));
  const [settingsOpen, setSettingsOpen] = useState(false);

  const refreshState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hasPin: !!localStorage.getItem(LS_KEY_PIN_HASH),
      pinHash: localStorage.getItem(LS_KEY_PIN_HASH),
      lockTimer: parseInt(localStorage.getItem(LS_KEY_LOCK_TIMER) ?? '0', 10),
      biometricEnabled: localStorage.getItem(LS_KEY_BIOMETRIC) === 'true',
    }));
  }, []);

  const checkLock = useCallback(() => {
    const hash = localStorage.getItem(LS_KEY_PIN_HASH);
    if (!hash) return;

    const timer = parseInt(localStorage.getItem(LS_KEY_LOCK_TIMER) ?? '0', 10);
    if (timer <= 0) return;

    const elapsed = Date.now() - lastActive.current;
    if (elapsed >= timer) {
      setState((prev) => ({ ...prev, locked: true }));
    }
  }, []);

  useEffect(() => {
    const handleActivity = () => {
      lastActive.current = Date.now();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        lastActive.current = Date.now();
      } else {
        checkLock();
      }
    };

    const handlePageHide = () => {
      lastActive.current = Date.now();
    };

    window.addEventListener('focus', handleActivity);
    window.addEventListener('blur', () => { lastActive.current = Date.now(); });
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('focus', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [checkLock]);

  // Unlock when visiting exempt routes
  useEffect(() => {
    if (EXEMPT_ROUTES.includes(location.pathname)) {
      setState((prev) => ({ ...prev, locked: false }));
    }
  }, [location.pathname]);

  const lock = useCallback(() => {
    if (!state.hasPin) return;
    setState((prev) => ({ ...prev, locked: true }));
  }, [state.hasPin]);

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    const hash = localStorage.getItem(LS_KEY_PIN_HASH);
    if (!hash) {
      setState((prev) => ({ ...prev, locked: false }));
      return true;
    }
    const pinHash = await hashPin(pin);
    if (pinHash === hash) {
      setState((prev) => ({ ...prev, locked: false }));
      lastActive.current = Date.now();
      return true;
    }
    return false;
  }, []);

  const setPin = useCallback(async (pin: string): Promise<void> => {
    const pinHash = await hashPin(pin);
    localStorage.setItem(LS_KEY_PIN_HASH, pinHash);
    refreshState();
  }, [refreshState]);

  const removePin = useCallback(() => {
    localStorage.removeItem(LS_KEY_PIN_HASH);
    setState((prev) => ({ ...prev, locked: false }));
    refreshState();
  }, [refreshState]);

  const setLockTimer = useCallback((minutes: number) => {
    const ms = minutes <= 0 ? 0 : minutes * 60 * 1000;
    localStorage.setItem(LS_KEY_LOCK_TIMER, String(ms));
    refreshState();
  }, [refreshState]);

  const setBiometricEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem(LS_KEY_BIOMETRIC, String(enabled));
    refreshState();
  }, [refreshState]);

  const isLocked = state.locked && state.hasPin && !EXEMPT_ROUTES.includes(location.pathname);

  return {
    isLocked,
    hasPin: state.hasPin,
    lockTimer: state.lockTimer,
    biometricEnabled: state.biometricEnabled,
    lock,
    unlock,
    setPin,
    removePin,
    setLockTimer,
    setBiometricEnabled,
    settingsOpen,
    setSettingsOpen,
    refreshState,
  };
}
