import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sv, en } from '@/lib/i18n';
import type { Translations } from '@/lib/i18n';

export type Locale = 'sv' | 'en';

const STORAGE_KEY = '@aiklubben_locale';

const translationMap: Record<Locale, Translations> = { sv, en };

// Get device language, default to 'sv'
const getDeviceLocale = (): Locale => {
  const deviceLang = Localization.getLocales()[0]?.languageCode;
  return deviceLang === 'en' ? 'en' : 'sv';
};

// Simple interpolation: replaces {{key}} with values
const interpolate = (text: string, params?: Record<string, string | number>): string => {
  if (!params) return text;
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value)),
    text,
  );
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  // Helper for interpolated strings
  ti: (text: string, params?: Record<string, string | number>) => string;
  // Helper for localized DB fields: l(item, 'title') → item.title_en or item.title
  l: (item: any, field: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(getDeviceLocale());

  // Load saved locale on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'sv' || saved === 'en') {
        setLocaleState(saved);
      }
    });
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    AsyncStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = useMemo(() => translationMap[locale], [locale]);

  const ti = useCallback(
    (text: string, params?: Record<string, string | number>) => interpolate(text, params),
    [],
  );

  const l = useCallback(
    (item: any, field: string) => {
      if (!item) return '';
      if (locale === 'en') return item[`${field}_en`] || item[field] || '';
      return item[field] || '';
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t, ti, l }), [locale, setLocale, t, ti, l]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
