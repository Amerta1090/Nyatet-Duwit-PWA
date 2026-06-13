import { create } from 'zustand';
import { db } from '@/db/schema';
import { isEncryptionAvailable, generateEncryptionKey, exportKey, importKey } from '@/utils/encryption';

const LS_KEY_SALT = 'nyatetduwit_enc_salt';
const LS_KEY_EXPORTED = 'nyatetduwit_enc_key';

interface EncryptionState {
  enabled: boolean;
  key: CryptoKey | null;
  keyExported: string | null;
  loading: boolean;
  isAvailable: boolean;
  init: () => Promise<void>;
  enable: (usePin?: boolean) => Promise<void>;
  disable: () => Promise<void>;
  reEncryptAll: (oldKey: CryptoKey | null, newKey: CryptoKey) => Promise<void>;
  setKey: (key: CryptoKey | null) => void;
}

export const useEncryptionStore = create<EncryptionState>((set, get) => ({
  enabled: false,
  key: null,
  keyExported: null,
  loading: true,
  isAvailable: isEncryptionAvailable(),

  init: async () => {
    try {
      const setting = await db.settings.get('encryption_enabled');
      const enabled = setting?.value === 'true';
      let key: CryptoKey | null = null;
      let keyExported: string | null = null;

      if (enabled) {
        const saved = localStorage.getItem(LS_KEY_EXPORTED);
        if (saved) {
          try {
            key = await importKey(saved);
            keyExported = saved;
          } catch {
            key = null;
            keyExported = null;
          }
        }
      }

      set({ enabled, key, keyExported, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  enable: async (usePin?: boolean) => {
    const key = await generateEncryptionKey();
    const keyExported = await exportKey(key);

    localStorage.setItem(LS_KEY_EXPORTED, keyExported);
    if (usePin) {
      localStorage.setItem(LS_KEY_SALT, 'pin_derived');
    } else {
      localStorage.removeItem(LS_KEY_SALT);
    }
    await db.settings.put({ key: 'encryption_enabled', value: 'true' });
    set({ enabled: true, key, keyExported });
  },

  disable: async () => {
    localStorage.removeItem(LS_KEY_EXPORTED);
    localStorage.removeItem(LS_KEY_SALT);
    await db.settings.put({ key: 'encryption_enabled', value: 'false' });
    set({ enabled: false, key: null, keyExported: null });
  },

  reEncryptAll: async (oldKey, newKey) => {
    const { enabled } = get();
    if (!enabled || !newKey) return;

    const txs = await db.transactions.toArray();
    for (const tx of txs) {
      const update: Record<string, string | number | undefined> = {};
      if (tx._encAmount && oldKey) {
        const decrypted = tx._encAmount ? await import('@/utils/encryption').then((m) => m.decryptNumber(tx._encAmount!, oldKey)) : tx.amount;
      }
    }
  },

  setKey: (key) => set({ key }),
}));
