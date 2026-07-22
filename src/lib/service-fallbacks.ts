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
  category: string;
};

const FALLBACKS: ServiceFallback[] = [
  {
    slug: 'aplicaciones-web',
    title_es: 'Aplicaciones Web',
    title_en: 'Web Applications',
    description_es:
      'Desarrollamos aplicaciones web modernas, escalables y de alto rendimiento que transforman tu negocio. Creamos experiencias digitales excepcionales que tus usuarios amarán, con entregas incrementales y código 100% tuyo.',
    description_en:
      'We develop modern, scalable, and high-performance web applications that transform your business. We create exceptional digital experiences your users will love, with incremental deliveries and code that is 100% yours.',
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
    category: 'technology',
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
    category: 'technology',
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
    category: 'technology',
  },
  // ── Marketing Services ──
  {
    slug: 'gestion-de-redes-sociales',
    title_es: 'Gestión de Redes Sociales',
    title_en: 'Social Media Management',
    description_es:
      'Nos encargamos de planificar, crear y administrar contenido estratégico que fortalezca la presencia digital de tu marca, aumenta el engagement y conecte con la audiencia adecuada. Nuestro objetivo no es solo publicar contenido, sino desarrollar una estrategia que genere resultados medibles.',
    description_en:
      'We plan, create, and manage strategic content that strengthens your brand\'s digital presence, increases engagement, and connects with the right audience. Our goal is not just to post content, but to develop a strategy that generates measurable results.',
    image_url:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
    benefits_es: [
      'Estrategia de contenido personalizada para cada red social',
      'Calendario editorial mensual con aprobación previa',
      'Diseño gráfico profesional para cada publicación',
      'Community management y respuesta a comentarios',
      'Copywriting estratégico orientado a conversión',
      'Reportes mensuales de crecimiento y engagement',
    ],
    benefits_en: [
      'Custom content strategy for each social network',
      'Monthly editorial calendar with prior approval',
      'Professional graphic design for each post',
      'Community management and comment response',
      'Strategic copywriting focused on conversion',
      'Monthly growth and engagement reports',
    ],
    category: 'marketing',
  },
  {
    slug: 'produccion-audiovisual',
    title_es: 'Producción Audiovisual',
    title_en: 'Audiovisual Production',
    description_es:
      'Transformamos ideas en contenido visual que conecta con tu audiencia y genera resultados. Desde sesiones de foto y video hasta producción de reels, stories y contenido para campañas publicitarias.',
    description_en:
      'We transform ideas into visual content that connects with your audience and generates results. From photo and video sessions to reel production, stories, and content for advertising campaigns.',
    image_url:
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop',
    benefits_es: [
      'Producción de video profesional (reels, stories, ads)',
      'Sesiones fotográficas de producto y lifestyle',
      'Edición y postproducción con identidad de marca',
      'Guiones y storyboards estratégicos',
      'Contenido optimizado por plataforma (IG, TikTok, YouTube)',
      'Banco de contenido mensual listo para publicar',
    ],
    benefits_en: [
      'Professional video production (reels, stories, ads)',
      'Product and lifestyle photo sessions',
      'Editing and post-production with brand identity',
      'Strategic scripts and storyboards',
      'Platform-optimized content (IG, TikTok, YouTube)',
      'Monthly content bank ready to publish',
    ],
    category: 'marketing',
  },
  {
    slug: 'reportes-y-analitica-de-redes-sociales',
    title_es: 'Reportes y Analítica de Redes Sociales',
    title_en: 'Social Media Reports & Analytics',
    description_es:
      'Dashboards de desempeño mensual: alcance, engagement y conversión — visibilidad total. Analizamos los datos de tus redes sociales para identificar qué funciona, qué ajustar y cómo optimizar tu estrategia digital.',
    description_en:
      'Monthly performance dashboards: reach, engagement, and conversion — total visibility. We analyze your social media data to identify what works, what to adjust, and how to optimize your digital strategy.',
    image_url:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    benefits_es: [
      'Dashboards interactivos de desempeño mensual',
      'Métricas clave: alcance, engagement, conversión y ROI',
      'Análisis comparativo con competencia (benchmarking)',
      'Identificación de contenido de mejor rendimiento',
      'Recomendaciones accionables basadas en datos',
      'Informes ejecutivos mensuales listos para presentar',
    ],
    benefits_en: [
      'Interactive monthly performance dashboards',
      'Key metrics: reach, engagement, conversion, and ROI',
      'Competitive analysis (benchmarking)',
      'Top-performing content identification',
      'Actionable data-driven recommendations',
      'Monthly executive reports ready to present',
    ],
    category: 'marketing',
  },
  {
    slug: 'paid-media',
    title_es: 'Paid Media',
    title_en: 'Paid Media',
    description_es:
      'Creamos, administramos y optimizamos campañas de publicidad digital enfocadas en alcanzar tus objetivos de negocio, ya sea aumentar ventas, generar prospectos, incrementar el reconocimiento de marca o atraer tráfico a tu sitio web.',
    description_en:
      'We create, manage, and optimize digital advertising campaigns focused on achieving your business objectives, whether it\'s increasing sales, generating leads, building brand awareness, or driving traffic to your website.',
    image_url:
      'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop',
    benefits_es: [
      'Campañas en Meta Ads (Facebook e Instagram)',
      'Google Ads: Search, Display y YouTube',
      'TikTok Ads y LinkedIn Ads',
      'Segmentación avanzada por audiencia e intereses',
      'A/B testing y optimización continua de creativos',
      'Reportes de ROI y costo por adquisición transparentes',
    ],
    benefits_en: [
      'Meta Ads campaigns (Facebook and Instagram)',
      'Google Ads: Search, Display, and YouTube',
      'TikTok Ads and LinkedIn Ads',
      'Advanced targeting by audience and interests',
      'A/B testing and continuous creative optimization',
      'Transparent ROI and cost-per-acquisition reports',
    ],
    category: 'marketing',
  },
  {
    slug: 'consultoria-de-marketing',
    title_es: 'Consultoría de Marketing',
    title_en: 'Marketing Consulting',
    description_es:
      'Analizamos la presencia digital de tu marca para identificar oportunidades de mejora y diseñar un plan de acción alineado con tus objetivos comerciales.',
    description_en:
      'We analyze your brand\'s digital presence to identify improvement opportunities and design an action plan aligned with your business objectives.',
    image_url:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    benefits_es: [
      'Auditoría completa de presencia digital actual',
      'Análisis de competencia y posicionamiento de marca',
      'Definición de buyer personas y customer journey',
      'Plan de marketing digital con KPIs medibles',
      'Estrategia de contenido y calendario editorial',
      'Acompañamiento mensual para ajustar según resultados',
    ],
    benefits_en: [
      'Complete audit of current digital presence',
      'Competitive analysis and brand positioning',
      'Buyer persona and customer journey definition',
      'Digital marketing plan with measurable KPIs',
      'Content strategy and editorial calendar',
      'Monthly follow-up to adjust based on results',
    ],
    category: 'marketing',
  },
  {
    slug: 'influencer-marketing',
    title_es: 'Influencer Marketing',
    title_en: 'Influencer Marketing',
    description_es:
      'Diseñamos y gestionamos campañas de influencer marketing enfocadas en generar confianza, alcance y conversiones. Nos encargamos de todo el proceso, desde la selección de perfiles hasta el seguimiento de resultados.',
    description_en:
      'We design and manage influencer marketing campaigns focused on building trust, reach, and conversions. We handle the entire process, from profile selection to results tracking.',
    image_url:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
    benefits_es: [
      'Selección estratégica de influencers por nicho y audiencia',
      'Negociación y gestión de contratos y entregas',
      'Briefing creativo alineado con tu identidad de marca',
      'Coordinación de contenido y calendario de publicaciones',
      'Seguimiento de métricas: alcance, engagement y conversiones',
      'Reportes de campaña con ROI y aprendizajes clave',
    ],
    benefits_en: [
      'Strategic influencer selection by niche and audience',
      'Negotiation and management of contracts and deliverables',
      'Creative briefing aligned with your brand identity',
      'Content coordination and publishing calendar',
      'Metrics tracking: reach, engagement, and conversions',
      'Campaign reports with ROI and key learnings',
    ],
    category: 'marketing',
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
