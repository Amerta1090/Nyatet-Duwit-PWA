const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function getWebCrypto(): Crypto | null {
  if (typeof crypto !== 'undefined' && crypto.subtle) return crypto;
  return null;
}

export function isEncryptionAvailable(): boolean {
  return getWebCrypto() !== null;
}

export async function generateEncryptionKey(): Promise<CryptoKey> {
  const c = getWebCrypto();
  if (!c) throw new Error('Web Crypto API not available');
  return c.subtle.generateKey({ name: ALGORITHM, length: KEY_LENGTH }, true, ['encrypt', 'decrypt']);
}

export async function deriveKeyFromPin(pin: string, salt?: Uint8Array): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  const c = getWebCrypto();
  if (!c) throw new Error('Web Crypto API not available');
  const saltBytes = salt ?? c.getRandomValues(new Uint8Array(SALT_LENGTH));
  const encoder = new TextEncoder();
  const keyMaterial = await c.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, ['deriveKey']);
  const key = await c.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes.buffer as ArrayBuffer, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
  return { key, salt: saltBytes };
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const c = getWebCrypto();
  if (!c) throw new Error('Web Crypto API not available');
  const raw = await c.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

export async function importKey(keyBase64: string): Promise<CryptoKey> {
  const c = getWebCrypto();
  if (!c) throw new Error('Web Crypto API not available');
  const raw = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
  return c.subtle.importKey('raw', raw, { name: ALGORITHM, length: KEY_LENGTH }, false, ['encrypt', 'decrypt']);
}

export async function encryptString(plaintext: string, key: CryptoKey): Promise<string> {
  const c = getWebCrypto();
  if (!c) throw new Error('Web Crypto API not available');
  const iv = c.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoder = new TextEncoder();
  const encrypted = await c.subtle.encrypt({ name: ALGORITHM, iv }, key, encoder.encode(plaintext));
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptString(ciphertext: string, key: CryptoKey): Promise<string> {
  const c = getWebCrypto();
  if (!c) throw new Error('Web Crypto API not available');
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, IV_LENGTH);
  const data = combined.slice(IV_LENGTH);
  const decrypted = await c.subtle.decrypt({ name: ALGORITHM, iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

export async function encryptNumber(value: number, key: CryptoKey): Promise<string> {
  return encryptString(String(value), key);
}

export async function decryptNumber(ciphertext: string, key: CryptoKey): Promise<number> {
  const str = await decryptString(ciphertext, key);
  return Number(str);
}
