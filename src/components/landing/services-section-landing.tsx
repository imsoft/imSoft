'use client';

import SpotlightCard from '@/components/ui/spotlight-card';
import { AnimatedGroup } from '@/components/animations/animated-group';

interface Service {
  title: string;
  description: string;
  icon: string;
}

interface ServicesSectionLandingProps {
  title: string;
  description: string;
  services: Service[];
}

export function ServicesSectionLanding({
  title,
  description,
  services,
}: ServicesSectionLandingProps) {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <AnimatedGroup preset="fade" className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {description}
          </p>
        </AnimatedGroup>

        <AnimatedGroup preset="blur-slide" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <SpotlightCard
              key={index}
              spotlightColor="rgba(168, 85, 247, 0.15)"
              className="h-full"
            >
              <div className="p-8 h-full flex flex-col">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-xl md:text-2xl font-bold mb-4">
                  {service.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </div>
            </SpotlightCard>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  );
}
