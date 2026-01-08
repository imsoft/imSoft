import { getDictionary, hasLocale } from '../dictionaries';
import { notFound } from 'next/navigation';
import { HeroHeader } from "@/components/blocks/hero-section";
import { FooterSection } from "@/components/blocks/footer-section";
import SignupForm from './signup-form';
import { Logo } from "@/components/blocks/hero-section";
import { createClient } from '@/lib/supabase/server';

export default async function SignupPage({ params }: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const supabase = await createClient();
  
  // Obtener datos de contacto
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
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <div className="mx-auto flex justify-center">
              <Logo />
            </div>
            <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-foreground">
              {dict.auth.signup.title}
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <SignupForm dict={dict} lang={lang} />
          </div>
        </div>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
  );
}

