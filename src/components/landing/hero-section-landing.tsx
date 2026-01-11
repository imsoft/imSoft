'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Magnet from '@/components/ui/magnet';
import { AnimatedGroup } from '@/components/animations/animated-group';

interface HeroSectionLandingProps {
  h1: string;
  subtitle: string;
  lang: string;
}

export function HeroSectionLanding({ h1, subtitle, lang }: HeroSectionLandingProps) {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16 md:py-24">
      {/* Background gradients - mismo estilo que el home */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-gradient-radial from-primary/20 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-gradient-radial from-purple-500/20 via-purple-500/5 to-transparent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl">
        <AnimatedGroup preset="blur-slide" className="space-y-8 text-center">
          {/* H1 Principal */}
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl xl:text-7xl">
            {h1}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl lg:text-2xl">
            {subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Magnet>
              <Button asChild size="lg" className="min-w-[200px] text-base">
                <Link href={`/${lang}/contact`}>
                  {lang === 'es' ? 'Solicitar Cotización' : 'Request Quote'}
                </Link>
              </Button>
            </Magnet>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-w-[200px] text-base"
            >
              <Link href={`/${lang}/${lang === 'es' ? 'servicios' : 'services'}`}>
                {lang === 'es' ? 'Conocer Servicios' : 'View Services'}
              </Link>
            </Button>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
