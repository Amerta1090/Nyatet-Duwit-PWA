import { useState, useEffect, useCallback } from 'react';

const VERSION_URL = '/version.json';
const CHECK_INTERVAL = 1000 * 60 * 60;
const LS_KEY_LAST_SEEN_VERSION = 'nyatetduwit_last_seen_version';
const LS_KEY_WHATS_NEW_DISMISSED = 'nyatetduwit_whatsnew_dismissed';

export interface VersionInfo {
  version: string;
  buildTime: string;
  changelog?: string;
  forceUpdate?: boolean;
  downloadUrl?: string;
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
  const [latestVersion, setLatestVersion] = useState<VersionInfo | null>(null);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [whatsNewContent, setWhatsNewContent] = useState<string>('');

  const check = useCallback(async () => {
    const latest = await fetchVersion();
    if (!latest) return;

    if (!cachedVersion) {
      cachedVersion = latest;
      // Check "What's New" on first load
      const lastSeen = localStorage.getItem(LS_KEY_LAST_SEEN_VERSION);
      const dismissed = localStorage.getItem(LS_KEY_WHATS_NEW_DISMISSED);
      if (lastSeen && lastSeen !== latest.version && latest.changelog && dismissed !== latest.version) {
        setWhatsNewContent(latest.changelog);
        setShowWhatsNew(true);
      }
      localStorage.setItem(LS_KEY_LAST_SEEN_VERSION, latest.version);
      return;
    }

    if (latest.version !== cachedVersion.version) {
      setUpdateAvailable(true);
      setLatestVersion(latest);
      setWhatsNewContent(latest.changelog ?? '');
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

  const dismissWhatsNew = useCallback(() => {
    setShowWhatsNew(false);
    if (cachedVersion) {
      localStorage.setItem(LS_KEY_WHATS_NEW_DISMISSED, cachedVersion.version);
    }
  }, []);

  return {
    updateAvailable,
    latestVersion,
    showWhatsNew,
    whatsNewContent,
    reload,
    dismiss,
    dismissWhatsNew,
  };
}
