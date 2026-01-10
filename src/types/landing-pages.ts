/**
 * Tipos para las landing pages de ciudad + industria
 */

export type City = 'guadalajara' | 'cdmx' | 'monterrey';

export type Industry =
  | 'software-para-inmobiliarias'
  | 'software-para-constructoras'
  | 'software-para-restaurantes'
  | 'software-para-clinicas'
  | 'software-para-logistica';

export interface LandingPageData {
  seoTitle: string;
  seoDescription: string;
  h1: string;
  heroSubtitle: string;
  problems: {
    title: string;
    items: string[];
  };
  solutions: {
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  imSoftServices: {
    title: string;
    description: string;
    services: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  cta: {
    title: string;
    description: string;
    buttonText: string;
  };
}

export type LandingPageConfig = {
  [K in City]: {
    [I in Industry]: LandingPageData;
  };
};
