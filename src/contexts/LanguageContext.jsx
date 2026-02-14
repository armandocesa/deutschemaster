import React, { createContext, useContext, useState, useEffect } from 'react';
import it from '../i18n/it.json';
import en from '../i18n/en.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

const translations = { it, en };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('dm_ui_language') || 'it';
    } catch {
      return 'it';
    }
  });

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      try {
        localStorage.setItem('dm_ui_language', lang);
      } catch {
        if (import.meta.env.DEV) console.warn('Could not save language preference to localStorage');
      }
    }
  };

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
      current = translations['it'];
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
