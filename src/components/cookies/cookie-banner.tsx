'use client';

import { useCookieStore } from '@/stores/cookie-store';
import { Button } from '@/components/ui/button';
import { Cookie, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

interface CookieBannerProps {
  lang: 'es' | 'en';
  dict: any;
}

export function CookieBanner({ lang, dict }: CookieBannerProps) {
  const { hasConsent, acceptAll, rejectAll, openPreferences } = useCookieStore();

  // Solo mostrar el banner si el usuario NO ha dado consentimiento
  if (hasConsent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-2xl border bg-background/95 p-6 shadow-2xl backdrop-blur-lg md:p-8">
            {/* Decorative Cookie Icon */}
            <div className="absolute -top-4 left-6 flex h-12 w-12 items-center justify-center rounded-full border bg-background shadow-lg">
              <Cookie className="h-6 w-6 text-primary" />
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              {/* Content */}
              <div className="space-y-3 pt-2 md:pt-0">
                <h3 className="text-xl font-bold">
                  {dict.cookies?.banner?.title || 'Utilizamos cookies'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {dict.cookies?.banner?.description ||
                    'Utilizamos cookies esenciales para el funcionamiento del sitio y cookies opcionales para mejorar tu experiencia. Puedes personalizar tus preferencias en cualquier momento.'}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Link
                    href={`/${lang}/cookie-policy`}
                    className="underline underline-offset-4 hover:text-foreground transition-colors"
                  >
                    {dict.cookies?.banner?.learnMore || 'Más información'}
                  </Link>
                  <span>•</span>
                  <Link
                    href={`/${lang}/privacy-policy`}
                    className="underline underline-offset-4 hover:text-foreground transition-colors"
                  >
                    {dict.cookies?.banner?.privacyPolicy || 'Aviso de Privacidad'}
                  </Link>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
                <Button
                  onClick={acceptAll}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {dict.cookies?.banner?.acceptAll || 'Aceptar todo'}
                </Button>
                <Button
                  onClick={openPreferences}
                  size="sm"
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {dict.cookies?.banner?.customize || 'Personalizar'}
                </Button>
                <Button
                  onClick={rejectAll}
                  size="sm"
                  variant="ghost"
                  className="whitespace-nowrap"
                >
                  {dict.cookies?.banner?.rejectAll || 'Rechazar todo'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
