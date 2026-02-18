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
  const url = `${SITE_URL}/${lang}/terms-and-conditions`;

  const dict = await getDictionary(lang as 'es' | 'en');
  return generateSEOMetadata({
    title: dict.legal?.terms?.title ?? 'Terms and Conditions',
    description: dict.legal?.terms?.metaDescription ?? '',
    url,
    type: 'website',
    noindex: true,
  }, lang);
}

export default async function TermsAndConditionsPage({ params }: {
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

  const t = dict.legal?.terms as Record<string, string | undefined> | undefined;

  return (
    <div>
      <HeroHeader dict={dict} lang={lang} />
      <main className="pt-24">
        <article className="py-16 md:py-24 bg-background">
          <div className="mx-auto max-w-4xl px-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">{t?.title ?? 'Terms and Conditions'}</h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-8 leading-relaxed">{t?.intro ?? ''}</p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s1Title}</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li><strong className="text-foreground">{t?.s1ServicesLabel}</strong> {t?.s1ServicesText}</li>
                  <li><strong className="text-foreground">{t?.s1ContentLabel}</strong> {t?.s1ContentText}</li>
                  <li><strong className="text-foreground">{t?.s1UserLabel}</strong> {t?.s1UserText}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s2Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{t?.s2Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{t?.s2Item1}</li><li>{t?.s2Item2}</li><li>{t?.s2Item3}</li><li>{t?.s2Item4}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s3Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{t?.s3Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{t?.s3Item1}</li><li>{t?.s3Item2}</li><li>{t?.s3Item3}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s4Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{t?.s4Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{t?.s4Item1}</li><li>{t?.s4Item2}</li><li>{t?.s4Item3}</li><li>{t?.s4Item4}</li><li>{t?.s4Item5}</li><li>{t?.s4Item6}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s5Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{t?.s5P1}</p>
                <p className="text-muted-foreground leading-relaxed mb-4">{t?.s5P2}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{t?.s5Item1}</li><li>{t?.s5Item2}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s6Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{t?.s6Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{t?.s6Item1}</li><li>{t?.s6Item2}</li><li>{t?.s6Item3}</li><li>{t?.s6Item4}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s7Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{t?.s7Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{t?.s7Item1}</li><li>{t?.s7Item2}</li><li>{t?.s7Item3}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s8Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{t?.s8Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{t?.s8Item1}</li><li>{t?.s8Item2}</li><li>{t?.s8Item3}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s9Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t?.s9P}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s10Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t?.s10P}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s11Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{t?.s11Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{t?.s11Item1}</li><li>{t?.s11Item2}</li><li>{t?.s11Item3}</li><li>{t?.s11Item4}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s12Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t?.s12P}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s13Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t?.s13P}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s14Title}</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{t?.s14Item1}</li><li>{t?.s14Item2}</li><li>{t?.s14Item3}</li><li>{t?.s14Item4}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t?.s15Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{t?.s15P}</p>
              </section>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{t?.lastUpdated}</p>
              </div>
            </div>
          </div>
        </article>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
  );
}
