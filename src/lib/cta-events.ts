/**
 * Que evento de analitica corresponde a un clic o a un envio. Logica pura: el
 * componente CtaTracker la conecta al DOM y la manda a GA4 y a Vercel Analytics.
 *
 * Sin esto GA solo registraba paginas vistas: no habia forma de saber que boton
 * convierte. Los nombres son estables porque se vuelven informes en GA.
 */

export interface CtaEvent {
  name: 'contact_whatsapp' | 'contact_phone' | 'contact_email' | 'cta_contact_page' | 'contact_form_sent';
  params: Record<string, string>;
}

const WA_HOSTS = ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'];

function limpiar(texto: string | null | undefined): string {
  return (texto ?? '').replace(/\s+/g, ' ').trim().slice(0, 60);
}

/** Evento para un enlace, o null si el enlace no es de contacto. */
export function ctaEventFor(input: { href: string; text?: string | null; pathname: string }): CtaEvent | null {
  const href = (input.href ?? '').trim();
  if (!href) return null;
  const params = { page: input.pathname, cta_text: limpiar(input.text) };

  if (/^tel:/i.test(href)) return { name: 'contact_phone', params };
  if (/^mailto:/i.test(href)) return { name: 'contact_email', params };

  let host = '';
  let path = href;
  try {
    const u = new URL(href, 'https://www.imsoft.io');
    host = u.hostname.replace(/^www\./, '');
    path = u.pathname;
  } catch {
    return null;
  }
  if (WA_HOSTS.includes(host)) return { name: 'contact_whatsapp', params };
  if (host === 'imsoft.io' && /^\/(es|en)\/contact\/?$/.test(path)) return { name: 'cta_contact_page', params };
  return null;
}

/** El formulario de contacto avisa con este evento del DOM cuando el envio tuvo exito. */
export const LEAD_EVENT = 'imsoft:lead';

export function leadEvent(pathname: string): CtaEvent {
  return { name: 'contact_form_sent', params: { page: pathname, cta_text: 'form' } };
}
