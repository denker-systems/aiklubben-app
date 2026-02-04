import React, { createContext, useContext, useState } from 'react';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  en: {
    welcome: 'Welcome to AI Klubben',
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
  },
  sv: {
    welcome: 'Välkommen till AI Klubben',
    login: 'Logga in',
    signup: 'Bli medlem',
    email: 'E-post',
    password: 'Lösenord',
  },
};

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.locale = Localization.getLocales()[0].languageCode ?? 'sv';

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState(i18n.locale);

  const setLocale = (newLocale: string) => {
    i18n.locale = newLocale;
    setLocaleState(newLocale);
  };

  const t = (key: string, options?: any) => i18n.t(key, options);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
