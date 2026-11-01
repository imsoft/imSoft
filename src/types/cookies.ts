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
  version: string; // To handle policy updates
}

export const defaultConsent: CookieConsent = {
  essential: true, // Always true, can't be disabled
  functional: false,
  analytics: false,
  marketing: false,
};

export const COOKIE_CONSENT_KEY = 'imsoft_cookie_consent';
export const COOKIE_VERSION = 1; // Version number for Zustand persist
