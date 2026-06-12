import { useState, useCallback, useEffect, useRef } from 'react';
import { Lock, Delete } from 'lucide-react';

interface LockScreenProps {
  onUnlock: (pin: string) => Promise<boolean>;
  biometricEnabled: boolean;
}

export function LockScreen({ onUnlock, biometricEnabled }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const pinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ('PublicKeyCredential' in window) {
      setBiometricSupported(true);
    }
    pinRef.current?.focus();
  }, []);

  const handleDigit = useCallback((digit: string) => {
    if (pin.length >= 6) return;
    setError(false);
    setPin((prev) => prev + digit);
  }, [pin]);

  const handleDelete = useCallback(() => {
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const handleBiometric = useCallback(async () => {
    if (!biometricSupported) return;
    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          rpId: window.location.hostname,
          allowCredentials: [],
          userVerification: 'required',
        },
      });
      if (credential) {
        // If we get here, WebAuthn verified the user
        setPin('');
        setError(false);
      }
    } catch {
      setError(true);
    }
  }, [biometricSupported]);

  useEffect(() => {
    if (pin.length === 6) {
      onUnlock(pin).then((ok) => {
        if (ok) {
          setPin('');
          setError(false);
          setAttempts(0);
        } else {
          setError(true);
          setPin('');
          setAttempts((a) => a + 1);
        }
      });
    }
  }, [pin, onUnlock]);

  const buttons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'del'],
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white px-8 dark:bg-neutral-900">
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
        <Lock className="h-8 w-8 text-primary-500" />
      </div>

      <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-50">Aplikasi Terkunci</h2>
      <p className="mb-6 text-sm text-neutral-500">Masukkan PIN untuk membuka</p>

      <div className="mb-6 flex gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full transition-colors ${
              i < pin.length
                ? 'bg-primary-500'
                : error
                  ? 'bg-danger-500'
                  : 'bg-neutral-300 dark:bg-neutral-600'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="mb-4 text-sm text-danger-500">
          PIN salah. {attempts >= 3 ? 'Silakan coba lagi.' : ''}
        </p>
      )}

      <input
        ref={pinRef}
        type="password"
        value={pin}
        onChange={() => {}}
        className="sr-only"
        autoFocus
        readOnly
      />

      <div className="grid w-full max-w-xs grid-cols-3 gap-3">
        {buttons.map((row, ri) =>
          row.map((digit, di) => {
            if (digit === '') {
              return <div key={`${ri}-${di}`} />;
            }
            if (digit === 'del') {
              return (
                <button
                  key={`${ri}-${di}`}
                  onClick={handleDelete}
                  className="flex h-14 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  <Delete className="h-5 w-5" />
                </button>
              );
            }
            return (
              <button
                key={`${ri}-${di}`}
                onClick={() => handleDigit(digit)}
                className="h-14 rounded-xl bg-neutral-100 text-lg font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              >
                {digit}
              </button>
            );
          }),
        )}
      </div>

      {biometricSupported && biometricEnabled && (
        <button
          onClick={handleBiometric}
          className="mt-6 flex items-center gap-2 text-sm text-primary-500"
        >
          <Lock className="h-4 w-4" />
          Buka dengan sidik jari
        </button>
      )}
    </div>
  );
}
