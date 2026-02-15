import React, { createContext, useContext, useState, useEffect } from 'react';
import it from '../i18n/it.json';
import en from '../i18n/en.json';
import de from '../i18n/de.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

const translations = { it, en, de };

const detectLanguage = () => {
  try {
    const saved = localStorage.getItem('dm_ui_language');
    if (saved && translations[saved]) return saved;
  } catch {}
  // Auto-detect from browser locale
  const browserLang = (navigator.language || navigator.userLanguage || '').split('-')[0];
  return translations[browserLang] ? browserLang : 'en';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(detectLanguage);

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      // Update html lang attribute for accessibility
      document.documentElement.lang = lang;
      try {
        localStorage.setItem('dm_ui_language', lang);
      } catch {
        if (import.meta.env.DEV) console.warn('Could not save language preference to localStorage');
      }
    }
  };

  // Set initial html lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const t = (key) => {
    const keys = key.split('.');
    let current = translations[language];

    for (const k of keys) {
      if (current && typeof current === 'object') {
        current = current[k];
      } else {
        current = undefined;
        break;
      }
    }

    if (current === undefined) {
      current = translations['en'];
      for (const k of keys) {
        if (current && typeof current === 'object') {
          current = current[k];
        } else {
          return key;
        }
      }
    }

    return typeof current === 'string' ? current : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
