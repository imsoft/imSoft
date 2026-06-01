import { getDictionary, hasLocale } from '../dictionaries';
import { notFound } from 'next/navigation';
import { HeroHeader, Logo } from "@/components/blocks/hero-section";
import { FooterSection } from "@/components/blocks/footer-section";
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preferencias de correo — imSoft',
  robots: { index: false, follow: false },
};

type Status = 'success' | 'invalid' | 'error';

const COPY = {
  es: {
    success: {
      title: 'Te has dado de baja',
      body: 'Ya no recibirás correos sobre nuevos artículos del blog. Seguirás recibiendo notificaciones importantes sobre tus proyectos.',
    },
    invalid: {
      title: 'Enlace no válido',
      body: 'Este enlace de baja no es válido o ha caducado. Si quieres dejar de recibir correos, escríbenos y lo gestionamos.',
    },
    error: {
      title: 'Algo salió mal',
      body: 'No pudimos procesar tu baja en este momento. Inténtalo de nuevo más tarde o contáctanos.',
    },
    home: 'Volver al inicio',
  },
  en: {
    success: {
      title: 'You have unsubscribed',
      body: 'You will no longer receive emails about new blog articles. You will still receive important notifications about your projects.',
    },
    invalid: {
      title: 'Invalid link',
      body: 'This unsubscribe link is invalid or has expired. If you want to stop receiving emails, contact us and we will take care of it.',
    },
    error: {
      title: 'Something went wrong',
      body: 'We could not process your request right now. Please try again later or contact us.',
    },
    home: 'Back to home',
  },
} as const;

export default async function UnsubscribePage({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const { status } = await searchParams;
  const safeStatus: Status =
    status === 'success' || status === 'invalid' ? status : status === 'error' ? 'error' : 'invalid';

  const dict = await getDictionary(lang);
  const copy = COPY[lang === 'en' ? 'en' : 'es'];
  const message = copy[safeStatus];

  const supabase = await createClient();
  const { data: contactData } = await supabase
    .from('contact')
    .select('*')
    .limit(1)
    .maybeSingle();

  return (
    <div>
      <HeroHeader dict={dict} lang={lang} />
      <main className="pt-24">
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
            <div className="mx-auto flex justify-center">
              <Logo />
            </div>
            <h2 className="mt-10 text-2xl font-bold tracking-tight text-foreground">
              {message.title}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {message.body}
            </p>
            <div className="mt-8">
              <Link
                href={`/${lang}`}
                className="font-semibold text-primary hover:text-primary/80"
              >
                {copy.home}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
  );
}
