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
  const url = `${SITE_URL}/${lang}/privacy-policy`;

  const dict = await getDictionary(lang as 'es' | 'en');
  return generateSEOMetadata({
    title: dict.legal?.privacy?.title ?? 'Privacy Policy',
    description: dict.legal?.privacy?.metaDescription ?? '',
    url,
    type: 'website',
    noindex: true,
  }, lang);
}

export default async function PrivacyPolicyPage({ params }: {
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

  const p = dict.legal?.privacy;

  return (
    <div>
      <HeroHeader dict={dict} lang={lang} />
      <main className="pt-24">
        <article className="py-16 md:py-24 bg-background">
          <div className="mx-auto max-w-4xl px-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">{p?.title ?? 'Privacy Policy'}</h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-8 leading-relaxed">{p?.intro ?? ''}</p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s1Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{p?.s1P}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s2Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{p?.s2Intro}</p>
                <h3 className="text-xl font-semibold mb-3 mt-4">{p?.s2_1Title}</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{p?.s2_1_1}</li><li>{p?.s2_1_2}</li><li>{p?.s2_1_3}</li><li>{p?.s2_1_4}</li><li>{p?.s2_1_5}</li><li>{p?.s2_1_6}</li>
                </ul>
                <h3 className="text-xl font-semibold mb-3 mt-4">{p?.s2_2Title}</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{p?.s2_2_1}</li><li>{p?.s2_2_2}</li><li>{p?.s2_2_3}</li><li>{p?.s2_2_4}</li>
                </ul>
                <h3 className="text-xl font-semibold mb-3 mt-4">{p?.s2_3Title}</h3>
                <p className="text-muted-foreground leading-relaxed">{p?.s2_3P}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s3Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{p?.s3Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li><strong className="text-foreground">{p?.s3_1Label}</strong> {p?.s3_1Text}</li>
                  <li><strong className="text-foreground">{p?.s3_2Label}</strong> {p?.s3_2Text}</li>
                  <li><strong className="text-foreground">{p?.s3_3Label}</strong> {p?.s3_3Text}</li>
                  <li><strong className="text-foreground">{p?.s3_4Label}</strong> {p?.s3_4Text}</li>
                  <li><strong className="text-foreground">{p?.s3_5Label}</strong> {p?.s3_5Text}</li>
                  <li><strong className="text-foreground">{p?.s3_6Label}</strong> {p?.s3_6Text}</li>
                  <li><strong className="text-foreground">{p?.s3_7Label}</strong> {p?.s3_7Text}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s4Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{p?.s4Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{p?.s4_1}</li><li>{p?.s4_2}</li><li>{p?.s4_3}</li><li>{p?.s4_4}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s5Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{p?.s5Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li><strong className="text-foreground">{p?.s5_1Label}</strong> {p?.s5_1Text}</li>
                  <li><strong className="text-foreground">{p?.s5_2Label}</strong> {p?.s5_2Text}</li>
                  <li><strong className="text-foreground">{p?.s5_3Label}</strong> {p?.s5_3Text}</li>
                  <li><strong className="text-foreground">{p?.s5_4Label}</strong> {p?.s5_4Text}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s6Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{p?.s6P}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s7Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{p?.s7Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{p?.s7_1}</li><li>{p?.s7_2}</li><li>{p?.s7_3}</li><li>{p?.s7_4}</li><li>{p?.s7_5}</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">{p?.s7Caveat}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s8Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{p?.s8P}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s9Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{p?.s9Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li><strong className="text-foreground">{p?.s9_1Label}</strong> {p?.s9_1Text}</li>
                  <li><strong className="text-foreground">{p?.s9_2Label}</strong> {p?.s9_2Text}</li>
                  <li><strong className="text-foreground">{p?.s9_3Label}</strong> {p?.s9_3Text}</li>
                  <li><strong className="text-foreground">{p?.s9_4Label}</strong> {p?.s9_4Text}</li>
                  <li><strong className="text-foreground">{p?.s9_5Label}</strong> {p?.s9_5Text}</li>
                  <li><strong className="text-foreground">{p?.s9_6Label}</strong> {p?.s9_6Text}</li>
                  <li><strong className="text-foreground">{p?.s9_7Label}</strong> {p?.s9_7Text}</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">{p?.s9Footer}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s10Title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{p?.s10Intro}</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li><strong className="text-foreground">{p?.s10_1Label}</strong> {p?.s10_1Text}</li>
                  <li><strong className="text-foreground">{p?.s10_2Label}</strong> {p?.s10_2Text}</li>
                  <li><strong className="text-foreground">{p?.s10_3Label}</strong> {p?.s10_3Text}</li>
                  <li><strong className="text-foreground">{p?.s10_4Label}</strong> {p?.s10_4Text}</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">{p?.s10Footer}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s11Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{p?.s11P}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s12Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{p?.s12P}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s13Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{p?.s13P}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s14Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{p?.s14P}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{p?.s15Title}</h2>
                <p className="text-muted-foreground leading-relaxed">{p?.s15P}</p>
              </section>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{p?.lastUpdated}</p>
              </div>
            </div>
          </div>
        </article>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
  );
}
