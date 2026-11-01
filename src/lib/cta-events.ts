/**
 * Which analytics event a click or a submission maps to. Pure logic: the
 * CtaTracker component wires it to the DOM and sends it to GA4 and Vercel Analytics.
 *
 * Without this GA only recorded page views: there was no way to know which button
 * converts. The names are stable because they become reports in GA.
 */

export interface CtaEvent {
  name: 'contact_whatsapp' | 'contact_phone' | 'contact_email' | 'cta_contact_page' | 'contact_form_sent';
  params: Record<string, string>;
}

const WA_HOSTS = ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'];

function cleanText(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim().slice(0, 60);
}

/** Event for a link, or null if the link isn't a contact one. */
export function ctaEventFor(input: { href: string; text?: string | null; pathname: string }): CtaEvent | null {
  const href = (input.href ?? '').trim();
  if (!href) return null;
  const params = { page: input.pathname, cta_text: cleanText(input.text) };

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

/** The contact form fires this DOM event when the submission succeeded. */
export const LEAD_EVENT = 'imsoft:lead';

export function leadEvent(pathname: string): CtaEvent {
  return { name: 'contact_form_sent', params: { page: pathname, cta_text: 'form' } };
}
