import { useEffect, useState, useCallback } from 'react';
import { runDailyBackupIfNeeded, runBackupNow } from '@/db/backup';

export function useAutoBackup(enabled: boolean) {
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    runDailyBackupIfNeeded().then((result) => {
      if (!cancelled && result.needsBanner) setBannerVisible(true);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const backupNow = useCallback(async (): Promise<boolean> => runBackupNow(), []);

  const dismissBanner = useCallback(() => setBannerVisible(false), []);

  return { bannerVisible, backupNow, dismissBanner };
}
