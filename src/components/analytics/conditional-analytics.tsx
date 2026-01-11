'use client';

import { Analytics } from '@vercel/analytics/next';
import { useCookieConsent } from '@/contexts/cookie-context';

/**
 * Componente que carga Vercel Analytics solo si el usuario ha aceptado cookies analíticas
 */
export function ConditionalAnalytics() {
  const { consent, hasConsent } = useCookieConsent();

  // Solo cargar analytics si el usuario ha dado consentimiento y ha aceptado cookies analíticas
  if (!hasConsent || !consent.analytics) {
    return null;
  }

  return <Analytics />;
}
