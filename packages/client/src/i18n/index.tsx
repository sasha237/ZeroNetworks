import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en, ru, type Language, type TranslationKey } from './messages';

export type { Language } from './messages';

type Values = Record<string, string | number>;
type Translate = (key: TranslationKey, values?: Values) => string;

interface I18nValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translate;
}

const I18nContext = createContext<I18nValue | null>(null);

function initialLanguage(): Language {
  try {
    return window.localStorage.getItem('zero-networks-language') === 'ru' ? 'ru' : 'en';
  } catch {
    return 'en';
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem('zero-networks-language', language);
    } catch {
      return;
    }
  }, [language]);

  const value = useMemo<I18nValue>(() => ({
    language,
    setLanguage,
    t: (key, values = {}) => {
      const dictionary = language === 'ru' ? ru : en;
      return Object.entries(values).reduce(
        (text, [name, replacement]) => text.replaceAll(`{${name}}`, String(replacement)),
        dictionary[key] as string,
      );
    },
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}
