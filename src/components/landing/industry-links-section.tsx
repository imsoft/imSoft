import Link from 'next/link';
import {
  LANDING_CITIES,
  LANDING_INDUSTRIES,
  CITY_LABELS,
  INDUSTRY_LABELS,
  landingHref,
  landingLinkText,
} from '@/config/landing-pages-index';

/**
 * Indice de las landings ciudad + industria.
 *
 * Es la unica ruta de enlaces internos hacia esas 30 paginas: sin esto Google las
 * descubre por el sitemap pero no las rastrea.
 */
export function IndustryLinksSection({ lang }: { lang: string }) {
  const l = lang === 'en' ? 'en' : 'es';

  return (
    <section className="py-16 md:py-24 border-t">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          {l === 'es' ? 'Software especializado por industria' : 'Specialized software by industry'}
        </h2>
        <p className="text-muted-foreground max-w-3xl mb-12">
          {l === 'es'
            ? 'Conocemos los procesos de tu sector. Elige tu industria y tu ciudad para ver cómo trabajamos con empresas como la tuya.'
            : 'We know your sector’s processes. Pick your industry and city to see how we work with companies like yours.'}
        </p>

        {l === 'es' && (
          <p className="text-muted-foreground max-w-3xl mb-10">
            ¿Buscas solo un sitio web?{' '}
            <Link href="/es/zapopan/paginas-web" className="text-foreground underline underline-offset-4">
              Páginas web en Zapopan
            </Link>{' '}
            y{' '}
            <Link href="/es/services/web-pages" className="text-foreground underline underline-offset-4">
              en Guadalajara
            </Link>
            .
          </p>
        )}

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_CITIES.map((city) => (
            <div key={city}>
              <h3 className="font-semibold text-lg mb-4">{CITY_LABELS[city][l]}</h3>
              <ul className="space-y-3">
                {LANDING_INDUSTRIES.map((industry) => (
                  <li key={industry}>
                    <Link
                      href={landingHref(lang, city, industry)}
                      title={landingLinkText(lang, city, industry)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l === 'es'
                        ? `Software para ${INDUSTRY_LABELS[industry][l]}`
                        : `Software for ${INDUSTRY_LABELS[industry][l]}`}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
