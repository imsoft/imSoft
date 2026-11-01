'use client';

import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { usePathname } from 'next/navigation';
import { whatsAppMessage } from '@/lib/whatsapp-message';

const WHATSAPP_NUMBER = '523325365558';

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  lang: string;
}

/**
 * WhatsApp link with the message prefilled for the page (like the floating
 * button). Works as the `asChild` of <Button>: the header and hero CTAs go
 * here, the channel we answer, instead of to the form.
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
