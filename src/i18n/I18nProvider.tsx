'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { getTranslations } from './config';

interface I18nContextType {
  locale: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

interface I18nProviderProps {
  locale: string;
  children: ReactNode;
}

export function I18nProvider({ locale, children }: I18nProviderProps) {
  const translations = getTranslations(locale);

  // Function to get a translation by key with optional parameters
  const t = (key: string, params?: Record<string, string | number>) => {
    // Split the key by dots to access nested properties
    const keys = key.split('.');
    let value = translations;

    // Navigate through the nested properties
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return the key itself if not found
      }
    }

    // If the value is not a string, return the key
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string for key: ${key}`);
      return key;
    }

    // Replace parameters in the string if provided
    if (params) {
      return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
        return acc.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      }, value);
    }

    return value;
  };

  return <I18nContext.Provider value={{ locale, t }}>{children}</I18nContext.Provider>;
}
