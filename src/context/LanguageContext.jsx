import { createContext, useContext, useMemo, useState } from 'react';
import id from '../i18n/id';
import en from '../i18n/en';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem('gemasuara-language') || 'id');
  const setLanguage = (value) => {
    localStorage.setItem('gemasuara-language', value);
    document.documentElement.lang = value;
    setLanguageState(value);
  };
  const value = useMemo(() => ({ language, setLanguage, t: language === 'id' ? id : en }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
