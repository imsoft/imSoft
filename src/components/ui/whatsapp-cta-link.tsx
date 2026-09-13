'use client';

import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { usePathname } from 'next/navigation';
import { whatsAppMessage } from '@/lib/whatsapp-message';

const WHATSAPP_NUMBER = '523325365558';

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  lang: string;
}

/**
 * Enlace a WhatsApp con el mensaje precargado segun la pagina (como el boton
 * flotante). Sirve como `asChild` de <Button>: los CTAs de cabecera y hero van
 * aqui, que es el canal que se atiende, en vez de al formulario.
 */
export const WhatsAppCtaLink = forwardRef<HTMLAnchorElement, Props>(function WhatsAppCtaLink(
  { lang, children, ...rest },
  ref,
) {
  const pathname = usePathname();
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsAppMessage(pathname, lang))}`;
  return (
    <a ref={ref} href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
});
