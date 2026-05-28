import { useEffect } from 'react';
import { db } from '@/db/schema';
import { useAppStore } from '@/stores/appStore';
import { translations } from '@/constants/i18n';

export function useI18n() {
  const lang = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const t = translations[lang];

  useEffect(() => {
    db.settings.get('language').then((s) => {
      if (s && (s.value === 'id' || s.value === 'en')) {
        setLanguage(s.value);
      }
    });
  }, [setLanguage]);

  return { t, lang, setLanguage };
}
