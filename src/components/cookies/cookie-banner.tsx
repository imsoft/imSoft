'use client';

import { useCookieStore } from '@/stores/cookie-store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CookieBannerProps {
  lang: 'es' | 'en';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

/**
 * Una sola linea al pie. La version anterior era una tarjeta que en movil tapaba mas
 * de media pantalla, el CTA del hero y el boton de WhatsApp, en cada pagina. En
 * Mexico basta con el aviso de privacidad; las preferencias detalladas siguen en el
 * pie ("Configuracion de cookies") y aqui con "Preferencias".
 */
export function CookieBanner({ lang, dict }: CookieBannerProps) {
  const { hasConsent, acceptAll, openPreferences } = useCookieStore();
  const pathname = usePathname();
  // En una cotizacion o contrato el cliente no tiene que lidiar con cookies.
  if (hasConsent || /\/(cotizacion|contrato)\//.test(pathname)) return null;

  const b = dict.cookies?.banner ?? {};
  const isEs = lang === 'es';

  return (
    <div
      role="region"
      aria-label={b.title || (isEs ? 'Aviso de cookies' : 'Cookie notice')}
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur px-4 py-2 pr-24 md:pr-4"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground md:text-sm">
        <p className="grow">
          {b.short || (isEs ? 'Usamos cookies para medir visitas.' : 'We use cookies to measure visits.')}{' '}
          <Link href={`/${lang}/cookie-policy`} className="underline underline-offset-4 hover:text-foreground">
            {b.learnMore || (isEs ? 'Más información' : 'Learn more')}
          </Link>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openPreferences}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {b.customize || (isEs ? 'Preferencias' : 'Preferences')}
          </button>
          <Button onClick={acceptAll} size="sm" className="h-7 px-3 text-xs">
            {b.ok || (isEs ? 'Entendido' : 'Got it')}
          </Button>
        </div>
      </div>
    </div>
  );
}
