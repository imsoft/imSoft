'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Magnet from '@/components/ui/magnet';
import { AnimatedGroup } from '@/components/animations/animated-group';
import { Check } from 'lucide-react';

interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
  lang: string;
}

export function CTASection({ title, description, buttonText, lang }: CTASectionProps) {
  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-purple-700">
      {/* Background effect */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-4xl">
        <AnimatedGroup preset="blur-slide" className="text-center space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Magnet>
              <Button asChild size="lg" variant="secondary" className="min-w-[200px]">
                <Link href={`/${lang}/contact`}>
                  {buttonText}
                </Link>
              </Button>
            </Magnet>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-[200px] border-white text-white hover:bg-white/10"
            >
              <Link href={`/${lang}/portfolio`}>
                {lang === 'es' ? 'Ver Portafolio' : 'View Portfolio'}
              </Link>
            </Button>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-8 justify-center items-center text-white">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span className="text-sm">
                {lang === 'es' ? 'Soluciones empresariales' : 'Enterprise solutions'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span className="text-sm">
                {lang === 'es' ? 'Desarrollo a la medida' : 'Custom development'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span className="text-sm">
                {lang === 'es' ? 'Soporte técnico dedicado' : 'Dedicated technical support'}
              </span>
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
