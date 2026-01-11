export type CookieCategory = 'essential' | 'functional' | 'analytics' | 'marketing';

export interface CookieConsent {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookiePreferences {
  consent: CookieConsent;
  timestamp: number;
  version: string; // Para manejar actualizaciones de política
}

export const defaultConsent: CookieConsent = {
  essential: true, // Siempre true, no se puede desactivar
  functional: false,
  analytics: false,
  marketing: false,
};

export const COOKIE_CONSENT_KEY = 'imsoft_cookie_consent';
export const COOKIE_VERSION = '1.0.0';
