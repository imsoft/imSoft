import Link from 'next/link';

interface HeroSectionLandingProps {
  h1: string;
  subtitle: string;
  lang: string;
}

export function HeroSectionLanding({ h1, subtitle, lang }: HeroSectionLandingProps) {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
            {h1}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {lang === 'es' ? 'Solicitar Cotización' : 'Request Quote'}
            </Link>
            <Link
              href={`/${lang}/${lang === 'es' ? 'servicios' : 'services'}`}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg border-2 border-gray-200 dark:border-gray-700"
            >
              {lang === 'es' ? 'Conocer Servicios' : 'View Services'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
