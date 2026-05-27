import { useState, useEffect, useCallback } from 'react';

const VERSION_URL = '/version.json';
const CHECK_INTERVAL = 1000 * 60 * 60;

interface VersionInfo {
  version: string;
  buildTime: string;
}

let cachedVersion: VersionInfo | null = null;

async function fetchVersion(): Promise<VersionInfo | null> {
  try {
    const res = await fetch(`${VERSION_URL}?t=${Date.now()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function useUpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const check = useCallback(async () => {
    const latest = await fetchVersion();
    if (!latest || !cachedVersion) {
      cachedVersion = latest;
      return;
    }
    if (latest.version !== cachedVersion.version) {
      setUpdateAvailable(true);
    }
    cachedVersion = latest;
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [check]);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  const dismiss = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return { updateAvailable, reload, dismiss };
}
