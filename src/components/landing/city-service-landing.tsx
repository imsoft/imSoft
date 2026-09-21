import Link from 'next/link';
import { BreadcrumbNav } from '@/components/seo/breadcrumb-nav';
import { WhatsAppCtaLink } from '@/components/ui/whatsapp-cta-link';
import type { CityServiceContent } from '@/config/city-services';

interface Props {
  lang: string;
  content: CityServiceContent;
  breadcrumb: Array<{ name: string; href?: string }>;
  /** Enlaces a otras landings de la misma ciudad o servicio, al pie. */
  related?: Array<{ name: string; href: string }>;
  /** Articulos del blog ya publicados que responden lo que busca quien llega. */
  posts?: Array<{ title: string; href: string }>;
}

/**
 * Cuerpo de una landing de ciudad + servicio (y de la de Zapopan, que comparte diseño).
 * Sin hero ni footer: los pone la pagina, que es quien conoce el idioma y los datos de contacto.
 */
export function CityServiceLanding({ lang, content, breadcrumb, related = [], posts = [] }: Props) {
  const c = content;
  return (
    <main className="pt-24">
      <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <BreadcrumbNav className="mb-6" items={breadcrumb} />
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">{c.h1}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">{c.heroSubtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/${lang}/contact`} className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90">
            {c.cta.buttonText}
          </Link>
          <WhatsAppCtaLink lang={lang} className="inline-flex items-center rounded-lg border px-6 py-3 font-medium hover:bg-accent">
            WhatsApp
          </WhatsAppCtaLink>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-3xl font-bold mb-10">{c.audience.title}</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {c.audience.items.map((item) => (
              <div key={item.title}>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-3xl font-bold mb-8">{c.problems.title}</h2>
          <ul className="space-y-3">
            {c.problems.items.map((item) => (
              <li key={item} className="flex gap-3 text-muted-foreground">
                <span aria-hidden className="text-primary mt-1">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-3xl font-bold mb-10">{c.solutions.title}</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {c.solutions.items.map((item) => (
              <div key={item.title}>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {c.pricing && (
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="text-3xl font-bold mb-3">{c.pricing.title}</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">{c.pricing.description}</p>
            <div className="grid gap-6 sm:grid-cols-2">
              {c.pricing.items.map((item) => (
                <div key={item.name} className="rounded-lg border bg-background p-6">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-2xl font-bold text-primary mt-1 mb-3">{item.price}</p>
                  <p className="text-sm text-muted-foreground">{item.includes}</p>
                </div>
              ))}
            </div>
            {c.pricing.note && <p className="text-sm text-muted-foreground mt-6 max-w-2xl">{c.pricing.note}</p>}
          </div>
        </section>
      )}

      <section className={`border-t ${c.pricing ? '' : 'bg-muted/30'}`}>
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-3xl font-bold mb-3">{c.proof.title}</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">{c.proof.description}</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {c.proof.items.map((item) => {
              const inner = (
                <>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </>
              );
              return item.slug ? (
                <Link key={item.name} href={`/${lang}/portfolio/${item.slug}`} className="rounded-lg border bg-background p-5 hover:border-primary transition-colors">
                  {inner}
                </Link>
              ) : (
                <div key={item.name} className="rounded-lg border bg-background p-5">{inner}</div>
              );
            })}
          </div>
          <Link href={`/${lang}/portfolio`} className="inline-block mt-8 text-primary hover:underline">
            Ver el portafolio completo
          </Link>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-3xl font-bold mb-8">{c.faq.title}</h2>
          <dl className="space-y-6">
            {c.faq.items.map((f) => (
              <div key={f.question}>
                <dt className="text-lg font-semibold mb-2">{f.question}</dt>
                <dd className="text-muted-foreground">{f.answer}</dd>
              </div>
            ))}
          </dl>
          {posts.length > 0 && (
            <div className="mt-10 rounded-lg border bg-muted/30 p-5">
              <p className="font-semibold mb-2">Lecturas útiles antes de cotizar</p>
              <ul className="space-y-1">
                {posts.map((p) => (
                  <li key={p.href}>
                    <Link href={p.href} className="text-primary hover:underline">{p.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{c.cta.title}</h2>
          <p className="text-muted-foreground mb-8">{c.cta.description}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`/${lang}/contact`} className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90">
              {c.cta.buttonText}
            </Link>
            <WhatsAppCtaLink lang={lang} className="inline-flex items-center rounded-lg border bg-background px-6 py-3 font-medium hover:bg-accent">
              Escribir por WhatsApp
            </WhatsAppCtaLink>
          </div>
          {related.length > 0 && (
            <p className="mt-10 text-sm text-muted-foreground">
              También:{' '}
              {related.map((r, i) => (
                <span key={r.href}>
                  {i > 0 && ' · '}
                  <Link href={r.href} className="text-primary hover:underline">{r.name}</Link>
                </span>
              ))}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
