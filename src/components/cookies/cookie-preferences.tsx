'use client';

import { useCookieStore } from '@/stores/cookie-store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { X, Shield, Palette, BarChart3, Megaphone, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CookieCategory } from '@/types/cookies';

interface CookiePreferencesProps {
  lang: 'es' | 'en';
  dict: any;
}

const categoryIcons = {
  essential: Shield,
  functional: Palette,
  analytics: BarChart3,
  marketing: Megaphone,
};

export function CookiePreferences({ lang, dict }: CookiePreferencesProps) {
  const {
    showPreferences,
    consent,
    updateConsent,
    savePreferences,
    closePreferences,
    acceptAll,
    rejectAll,
  } = useCookieStore();

  if (!showPreferences) return null;

  const categories: {
    id: CookieCategory;
    titleKey: string;
    descriptionKey: string;
    disabled?: boolean;
  }[] = [
    {
      id: 'essential',
      titleKey: 'essential',
      descriptionKey: 'essentialDesc',
      disabled: true,
    },
    {
      id: 'functional',
      titleKey: 'functional',
      descriptionKey: 'functionalDesc',
    },
    {
      id: 'analytics',
      titleKey: 'analytics',
      descriptionKey: 'analyticsDesc',
    },
    {
      id: 'marketing',
      titleKey: 'marketing',
      descriptionKey: 'marketingDesc',
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={closePreferences}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-2xl border bg-background shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {dict.cookies?.preferences?.title || 'Preferencias de Cookies'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {dict.cookies?.preferences?.subtitle ||
                    'Personaliza qué cookies quieres aceptar'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closePreferences}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] space-y-1 overflow-y-auto p-6">
              {categories.map((category) => {
                const Icon = categoryIcons[category.id];
                const isEnabled = consent[category.id];

                return (
                  <div
                    key={category.id}
                    className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              isEnabled
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {dict.cookies?.categories?.[category.titleKey] ||
                                category.titleKey}
                            </h3>
                            {category.disabled && (
                              <span className="text-xs text-muted-foreground">
                                {dict.cookies?.preferences?.alwaysActive || 'Siempre activas'}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {dict.cookies?.categories?.[category.descriptionKey] ||
                            category.descriptionKey}
                        </p>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) =>
                          updateConsent(category.id, checked)
                        }
                        disabled={category.disabled}
                        className="mt-2"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Info Box */}
              <div className="mt-4 flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {dict.cookies?.preferences?.info ||
                    'Puedes cambiar tus preferencias en cualquier momento desde el pie de página de nuestro sitio web.'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-2 border-t p-6 sm:flex-row sm:justify-between">
              <div className="flex gap-2">
                <Button onClick={acceptAll} size="sm" variant="outline">
                  {dict.cookies?.preferences?.acceptAll || 'Aceptar todo'}
                </Button>
                <Button onClick={rejectAll} size="sm" variant="outline">
                  {dict.cookies?.preferences?.rejectAll || 'Rechazar todo'}
                </Button>
              </div>
              <Button onClick={savePreferences} size="sm">
                {dict.cookies?.preferences?.save || 'Guardar preferencias'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
