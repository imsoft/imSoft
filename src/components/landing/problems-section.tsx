'use client';

import SpotlightCard from '@/components/ui/spotlight-card';
import { AnimatedGroup } from '@/components/animations/animated-group';
import { AlertCircle } from 'lucide-react';

interface ProblemsSectionProps {
  title: string;
  problems: string[];
}

export function ProblemsSection({ title, problems }: ProblemsSectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <AnimatedGroup preset="fade">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {title}
          </h2>
        </AnimatedGroup>

        <AnimatedGroup preset="blur-slide" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((problem, index) => (
            <SpotlightCard
              key={index}
              spotlightColor="rgba(239, 68, 68, 0.15)"
              className="h-full"
            >
              <div className="flex items-start gap-4 p-6 h-full">
                <div className="shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 dark:bg-red-600">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="leading-relaxed text-foreground/90">
                  {problem}
                </p>
              </div>
            </SpotlightCard>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  );
}
