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

function enviar(evento: CtaEvent) {
  try {
    window.gtag?.('event', evento.name, evento.params);
  } catch {
    // GA bloqueado por el navegador: no es motivo para romper el clic.
  }
  try {
    track(evento.name, evento.params);
  } catch {
    // idem
  }
}

/**
 * Registra en GA4 y Vercel Analytics los clics en WhatsApp, telefono, correo y
 * "Agenda una llamada", y los envios exitosos del formulario. Un solo listener en
 * el documento: no hay que tocar cada boton.
 */
export function CtaTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]');
      if (!a) return;
      const evento = ctaEventFor({
        href: a.getAttribute('href') ?? '',
        text: a.getAttribute('aria-label') || a.textContent,
        pathname,
      });
      if (evento) enviar(evento);
    };
    const onLead = () => enviar(leadEvent(pathname));

    document.addEventListener('click', onClick, { capture: true });
    window.addEventListener(LEAD_EVENT, onLead);
    return () => {
      document.removeEventListener('click', onClick, { capture: true });
      window.removeEventListener(LEAD_EVENT, onLead);
    };
  }, [pathname]);

  return null;
}
