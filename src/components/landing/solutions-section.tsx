'use client';

import SpotlightCard from '@/components/ui/spotlight-card';
import { AnimatedGroup } from '@/components/animations/animated-group';
import { CheckCircle2 } from 'lucide-react';

interface Solution {
  title: string;
  description: string;
}

interface SolutionsSectionProps {
  title: string;
  solutions: Solution[];
}

export function SolutionsSection({ title, solutions }: SolutionsSectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <AnimatedGroup preset="fade">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {title}
          </h2>
        </AnimatedGroup>

        <AnimatedGroup preset="blur-slide" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((solution, index) => (
            <SpotlightCard
              key={index}
              spotlightColor="rgba(59, 130, 246, 0.15)"
              className="h-full"
            >
              <div className="p-8 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                      <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold">
                    {solution.title}
                  </h3>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  {solution.description}
                </p>
              </div>
            </SpotlightCard>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  );
}
