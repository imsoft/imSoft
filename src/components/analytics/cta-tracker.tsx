'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@vercel/analytics';
import { ctaEventFor, leadEvent, LEAD_EVENT, type CtaEvent } from '@/lib/cta-events';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function sendEvent(event: CtaEvent) {
  try {
    window.gtag?.('event', event.name, event.params);
  } catch {
    // GA blocked by the browser: no reason to break the click.
  }
  try {
    track(event.name, event.params);
  } catch {
    // same
  }
}

/**
 * Logs WhatsApp, phone, email and "Agenda una llamada" clicks, plus successful
 * form submissions, to GA4 and Vercel Analytics. A single listener on the
 * document: no need to touch each button.
 */
export function CtaTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]');
      if (!a) return;
      const event = ctaEventFor({
        href: a.getAttribute('href') ?? '',
        text: a.getAttribute('aria-label') || a.textContent,
        pathname,
      });
      if (event) sendEvent(event);
    };
    const onLead = () => sendEvent(leadEvent(pathname));

    document.addEventListener('click', onClick, { capture: true });
    window.addEventListener(LEAD_EVENT, onLead);
    return () => {
      document.removeEventListener('click', onClick, { capture: true });
      window.removeEventListener(LEAD_EVENT, onLead);
    };
  }, [pathname]);

  return null;
}
