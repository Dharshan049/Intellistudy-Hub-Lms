'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translations
import en from './translations/en';
import te from './translations/te';
import ta from './translations/ta';
import ml from './translations/ml';

const resources = {
  en: { translation: en },
  te: { translation: te },
  ta: { translation: ta },
  ml: { translation: ml },
};

const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang && resources[savedLang]) {
      return savedLang;
    }
  }
  return 'en';
};

// Initialize i18next only if it hasn't been initialized yet
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: getInitialLanguage(),
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
    });

  // Add a language change listener to update all components
  i18n.on('languageChanged', (lng) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', lng);
      document.documentElement.lang = lng;
      // Force update all components that use translations
      window.dispatchEvent(new Event('languageChanged'));
    }
  });
}

// Function to change language without page reload
export const changeLanguage = async (lng) => {
  if (typeof window !== 'undefined' && resources[lng]) {
    try {
      await i18n.changeLanguage(lng);
      return true;
    } catch (error) {
      console.error('Language change error:', error);
      return false;
    }
  }
  return false;
};

export default i18n; 