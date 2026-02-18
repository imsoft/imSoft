import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../dictionaries';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
  const url = `${SITE_URL}/${lang}/cookie-policy`;

  if (!hasLocale(lang)) return { title: 'Cookie Policy', description: '' };
  const dict = await getDictionary(lang);
  const c = dict.legal?.cookiePolicy as { metaTitle?: string; metaDescription?: string } | undefined;
  return generateSEOMetadata({
    title: c?.metaTitle ?? 'Cookie Policy',
    description: c?.metaDescription ?? 'imSoft cookie policy. Learn about the cookies we use and how you can manage them.',
    url,
    type: 'website',
    noindex: true,
  }, lang);
}

export default async function CookiePolicyPage({ params }: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const supabase = await createClient();

  const { data: contactData } = await supabase
    .from('contact')
    .select('*')
    .limit(1)
    .maybeSingle();

  const c = dict.legal?.cookiePolicy as Record<string, string | undefined> | undefined;

  return (
    <div>
      <HeroHeader dict={dict} lang={lang} />
      <main className="pt-24">
        <article className="py-16 md:py-24 bg-background">
          <div className="mx-auto max-w-4xl px-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              {c?.title ?? 'Cookie Policy'}
            </h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-8 leading-relaxed">{c?.intro}</p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{c?.s1Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{c?.s1P}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{c?.s2Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{c?.s2Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{c?.s2_1}</li>
                  <li>{c?.s2_2}</li>
                  <li>{c?.s2_3}</li>
                  <li>{c?.s2_4}</li>
                  <li>{c?.s2_5}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{c?.s3Title}</h2>
                <div className="space-y-6">
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="text-xl font-semibold mb-2">{c?.s3_1Title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-2">{c?.s3_1P}</p>
                    <p className="text-sm text-muted-foreground"><strong>{c?.s3_1Examples}</strong></p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                      <li><strong>supabase-auth-token:</strong> {c?.s3_1_supabase}</li>
                      <li><strong>imsoft_cookie_consent:</strong> {c?.s3_1_consent}</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-xl font-semibold mb-2">{c?.s3_2Title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-2">{c?.s3_2P}</p>
                    <p className="text-sm text-muted-foreground"><strong>{c?.s3_2Examples}</strong></p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                      <li><strong>theme:</strong> {c?.s3_2_theme}</li>
                      <li><strong>language:</strong> {c?.s3_2_lang}</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="text-xl font-semibold mb-2">{c?.s3_3Title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-2">{c?.s3_3P}</p>
                    <p className="text-sm text-muted-foreground"><strong>{c?.s3_3Services}</strong></p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                      <li><strong>Vercel Analytics:</strong> {c?.s3_3_vercel}</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="text-xl font-semibold mb-2">{c?.s3_4Title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-2">{c?.s3_4P}</p>
                    <p className="text-sm font-semibold text-muted-foreground">⚠️ {c?.s3_4Note}</p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{c?.s4Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{c?.s4Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li><strong className="text-foreground">{c?.s4_1Label}</strong> {c?.s4_1Text}</li>
                  <li><strong className="text-foreground">{c?.s4_2Label}</strong> {c?.s4_2Text}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{c?.s5Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{c?.s5Intro}</p>
                <h3 className="text-xl font-semibold mb-3">{c?.s5_1Title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{c?.s5_1P}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-4">
                  <li>{c?.s5_1_1}</li>
                  <li>{c?.s5_1_2}</li>
                  <li>{c?.s5_1_3}</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">{c?.s5_1Footer}</p>
                <h3 className="text-xl font-semibold mb-3">{c?.s5_2Title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{c?.s5_2P}</p>
                <p className="text-sm text-muted-foreground"><strong>{c?.s5_2Instructions}</strong></p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                  <li>{c?.s5_2_chrome}</li>
                  <li>{c?.s5_2_firefox}</li>
                  <li>{c?.s5_2_safari}</li>
                  <li>{c?.s5_2_edge}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{c?.s6Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{c?.s6P}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mt-4">
                  <li><strong className="text-foreground">Supabase:</strong> {c?.s6_supabase}</li>
                  <li><strong className="text-foreground">Vercel Analytics:</strong> {c?.s6_vercel}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{c?.s7Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{c?.s7P}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{c?.s8Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{c?.s8P}</p>
              </section>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{c?.lastUpdated}</p>
              </div>
            </div>
          </div>
        </article>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
  );
}
