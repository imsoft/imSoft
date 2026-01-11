'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  CookieConsent,
  CookiePreferences,
  CookieCategory
} from '@/types/cookies';
import {
  defaultConsent,
  COOKIE_CONSENT_KEY,
  COOKIE_VERSION
} from '@/types/cookies';

interface CookieContextType {
  consent: CookieConsent;
  hasConsent: boolean;
  showBanner: boolean;
  showPreferences: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  updateConsent: (category: CookieCategory, value: boolean) => void;
  savePreferences: () => void;
  openPreferences: () => void;
  closePreferences: () => void;
  resetConsent: () => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);
  const [hasConsent, setHasConsent] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Cargar preferencias guardadas al montar
  useEffect(() => {
    const loadSavedPreferences = () => {
      try {
        const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (saved) {
          const preferences: CookiePreferences = JSON.parse(saved);

          // Verificar si la versión es diferente (nueva política)
          if (preferences.version === COOKIE_VERSION) {
            setConsent(preferences.consent);
            setHasConsent(true);
            setShowBanner(false);
          } else {
            // Nueva versión de política, mostrar banner nuevamente
            setShowBanner(true);
            setHasConsent(false);
          }
        } else {
          // No hay preferencias guardadas, mostrar banner
          setShowBanner(true);
        }
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
        setShowBanner(true);
      }
    };

    loadSavedPreferences();
  }, []);

  const saveToLocalStorage = useCallback((newConsent: CookieConsent) => {
    const preferences: CookiePreferences = {
      consent: newConsent,
      timestamp: Date.now(),
      version: COOKIE_VERSION,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
  }, []);

  const acceptAll = useCallback(() => {
    const allAccepted: CookieConsent = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setConsent(allAccepted);
    saveToLocalStorage(allAccepted);
    setHasConsent(true);
    setShowBanner(false);
    setShowPreferences(false);
  }, [saveToLocalStorage]);

  const rejectAll = useCallback(() => {
    const allRejected: CookieConsent = {
      essential: true, // Essential cookies siempre activas
      functional: false,
      analytics: false,
      marketing: false,
    };
    setConsent(allRejected);
    saveToLocalStorage(allRejected);
    setHasConsent(true);
    setShowBanner(false);
    setShowPreferences(false);
  }, [saveToLocalStorage]);

  const updateConsent = useCallback((category: CookieCategory, value: boolean) => {
    // No permitir desactivar cookies esenciales
    if (category === 'essential') return;

    setConsent(prev => ({
      ...prev,
      [category]: value,
    }));
  }, []);

  const savePreferences = useCallback(() => {
    saveToLocalStorage(consent);
    setHasConsent(true);
    setShowBanner(false);
    setShowPreferences(false);
  }, [consent, saveToLocalStorage]);

  const openPreferences = useCallback(() => {
    setShowPreferences(true);
  }, []);

  const closePreferences = useCallback(() => {
    setShowPreferences(false);
  }, []);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    setConsent(defaultConsent);
    setHasConsent(false);
    setShowBanner(true);
  }, []);

  return (
    <CookieContext.Provider
      value={{
        consent,
        hasConsent,
        showBanner,
        showPreferences,
        acceptAll,
        rejectAll,
        updateConsent,
        savePreferences,
        openPreferences,
        closePreferences,
        resetConsent,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieProvider');
  }
  return context;
}
