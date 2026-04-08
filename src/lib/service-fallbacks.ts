/**
 * Contenido por defecto cuando la fila no existe en `services` (p. ej. seed no aplicado en producción).
 * Debe coincidir con `scripts/seed-services.sql`.
 */
export type ServiceFallback = {
  slug: string;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  image_url: string;
  benefits_es: string[];
  benefits_en: string[];
};

const FALLBACKS: ServiceFallback[] = [
  {
    slug: 'aplicaciones-web',
    title_es: 'Aplicaciones Web',
    title_en: 'Web Applications',
    description_es:
      'Desarrollamos aplicaciones web modernas, escalables y de alto rendimiento que transforman tu negocio. Utilizamos las últimas tecnologías como React, Next.js y Node.js para crear experiencias web excepcionales que tus usuarios amarán.',
    description_en:
      'We develop modern, scalable, and high-performance web applications that transform your business. We use the latest technologies like React, Next.js, and Node.js to create exceptional web experiences that your users will love.',
    image_url:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    benefits_es: [
      'Desarrollo con tecnologías de última generación',
      'Diseño responsive para todos los dispositivos',
      'Optimización SEO y rendimiento',
      'Integración con APIs y servicios externos',
      'Arquitectura escalable y mantenible',
      'Soporte y mantenimiento continuo',
    ],
    benefits_en: [
      'Development with cutting-edge technologies',
      'Responsive design for all devices',
      'SEO and performance optimization',
      'Integration with APIs and external services',
      'Scalable and maintainable architecture',
      'Continuous support and maintenance',
    ],
  },
  {
    slug: 'aplicaciones-moviles',
    title_es: 'Aplicaciones Móviles',
    title_en: 'Mobile Applications',
    description_es:
      'Creamos aplicaciones móviles nativas y multiplataforma para iOS y Android. Desde apps de e-commerce hasta soluciones empresariales, desarrollamos aplicaciones móviles que ofrecen experiencias fluidas y funcionalidad robusta.',
    description_en:
      'We create native and cross-platform mobile applications for iOS and Android. From e-commerce apps to enterprise solutions, we develop mobile applications that offer smooth experiences and robust functionality.',
    image_url:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
    benefits_es: [
      'Desarrollo nativo (iOS/Android) y multiplataforma (React Native)',
      'Interfaz intuitiva y experiencia de usuario optimizada',
      'Integración con servicios en la nube',
      'Notificaciones push y mensajería en tiempo real',
      'Sincronización offline y almacenamiento local',
      'Publicación en App Store y Google Play',
    ],
    benefits_en: [
      'Native (iOS/Android) and cross-platform development (React Native)',
      'Intuitive interface and optimized user experience',
      'Cloud services integration',
      'Push notifications and real-time messaging',
      'Offline sync and local storage',
      'Publication on App Store and Google Play',
    ],
  },
  {
    slug: 'consultoria-tecnologica',
    title_es: 'Consultoría Tecnológica',
    title_en: 'Technology Consulting',
    description_es:
      'Asesoramos a empresas en la transformación digital y la adopción de nuevas tecnologías. Ayudamos a definir estrategias tecnológicas, optimizar procesos y seleccionar las mejores herramientas para alcanzar tus objetivos de negocio.',
    description_en:
      'We advise companies on digital transformation and adoption of new technologies. We help define technology strategies, optimize processes, and select the best tools to achieve your business objectives.',
    image_url:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
    benefits_es: [
      'Análisis y auditoría de infraestructura tecnológica',
      'Definición de roadmap tecnológico',
      'Selección de tecnologías y herramientas',
      'Optimización de procesos de desarrollo',
      'Capacitación y formación de equipos',
      'Asesoría en arquitectura de software',
    ],
    benefits_en: [
      'Analysis and audit of technological infrastructure',
      'Definition of technology roadmap',
      'Selection of technologies and tools',
      'Development process optimization',
      'Team training and education',
      'Software architecture consulting',
    ],
  },
];

const bySlug = new Map(FALLBACKS.map((s) => [s.slug, s]));

export function getServiceFallback(slug: string): ServiceFallback | undefined {
  return bySlug.get(slug);
}

/** Forma mínima que usa `services/[slug]/page.tsx` (fila Supabase o fallback). */
export type ResolvedServiceContent = {
  title?: string | null;
  title_es?: string | null;
  title_en?: string | null;
  description?: string | null;
  description_es?: string | null;
  description_en?: string | null;
  image_url?: string | null;
  benefits_es?: string[] | null;
  benefits_en?: string[] | null;
};

export function resolveServiceContent(
  slug: string,
  row: ResolvedServiceContent | null
): ResolvedServiceContent | null {
  if (row) return row;
  const fb = getServiceFallback(slug);
  if (!fb) return null;
  return {
    title_es: fb.title_es,
    title_en: fb.title_en,
    description_es: fb.description_es,
    description_en: fb.description_en,
    benefits_es: fb.benefits_es,
    benefits_en: fb.benefits_en,
    image_url: fb.image_url,
  };
}
