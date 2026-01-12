'use client';

import { Analytics } from '@vercel/analytics/next';
import { useCookieStore } from '@/stores/cookie-store';

/**
 * Componente que carga Vercel Analytics solo si el usuario ha aceptado cookies analíticas
 */
export function ConditionalAnalytics() {
  const { consent, hasConsent } = useCookieStore();

  // Solo cargar analytics si el usuario ha dado consentimiento y ha aceptado cookies analíticas
  if (!hasConsent || !consent.analytics) {
    return null;
  }

  return <Analytics />;
}
