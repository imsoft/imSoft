import Link from 'next/link';

interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
}

export function CTASection({ title, description, buttonText }: CTASectionProps) {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700">
      <div className="container mx-auto max-w-4xl text-center space-y-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
          {title}
        </h2>
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-blue-700 bg-white rounded-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            {buttonText}
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-white bg-transparent rounded-lg hover:bg-white/10 transition-all border-2 border-white"
          >
            Ver Portafolio
          </Link>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row gap-8 justify-center items-center text-white">
          <div className="flex items-center gap-2">
            <span className="text-3xl">✓</span>
            <span className="text-sm">Soluciones empresariales</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">✓</span>
            <span className="text-sm">Desarrollo a la medida</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">✓</span>
            <span className="text-sm">Soporte técnico dedicado</span>
          </div>
        </div>
      </div>
    </section>
  );
}
