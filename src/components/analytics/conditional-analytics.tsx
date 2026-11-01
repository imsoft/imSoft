'use client';

import { Analytics } from '@vercel/analytics/next';
import { useCookieStore } from '@/stores/cookie-store';

/**
 * Loads Vercel Analytics only if the user accepted analytics cookies
 */
export function ConditionalAnalytics() {
  const { consent, hasConsent } = useCookieStore();

  // Only load analytics if the user gave consent and accepted analytics cookies
  if (!hasConsent || !consent.analytics) {
    return null;
  }

  return <Analytics />;
}
