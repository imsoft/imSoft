-- =============================================================================
-- Seed: 6 servicios de marketing — imSoft
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- PRERREQUISITO: ejecutar add-services-category.sql primero
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. GESTIÓN DE REDES SOCIALES
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, category, benefits_es, benefits_en)
VALUES (
  'gestion-de-redes-sociales',
  'Gestión de Redes Sociales',
  'Social Media Management',
  'Nos encargamos de planificar, crear y administrar contenido estratégico que fortalezca la presencia digital de tu marca, aumenta el engagement y conecte con la audiencia adecuada. Nuestro objetivo no es solo publicar contenido, sino desarrollar una estrategia que genere resultados medibles.',
  'We plan, create, and manage strategic content that strengthens your brand''s digital presence, increases engagement, and connects with the right audience. Our goal is not just to post content, but to develop a strategy that generates measurable results.',
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
  '📱',
  'marketing',
  '["Estrategia de contenido personalizada para cada red social", "Calendario editorial mensual con aprobación previa", "Diseño gráfico profesional para cada publicación", "Community management y respuesta a comentarios", "Copywriting estratégico orientado a conversión", "Reportes mensuales de crecimiento y engagement"]'::jsonb,
  '["Custom content strategy for each social network", "Monthly editorial calendar with prior approval", "Professional graphic design for each post", "Community management and comment response", "Strategic copywriting focused on conversion", "Monthly growth and engagement reports"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  category       = EXCLUDED.category,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- -----------------------------------------------------------------------------
-- 2. PRODUCCIÓN AUDIOVISUAL
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, category, benefits_es, benefits_en)
VALUES (
  'produccion-audiovisual',
  'Producción Audiovisual',
  'Audiovisual Production',
  'Transformamos ideas en contenido visual que conecta con tu audiencia y genera resultados. Desde sesiones de foto y video hasta producción de reels, stories y contenido para campañas publicitarias. Creamos piezas audiovisuales que refuerzan tu identidad de marca y capturan la atención en cada plataforma.',
  'We transform ideas into visual content that connects with your audience and generates results. From photo and video sessions to reel production, stories, and content for advertising campaigns. We create audiovisual pieces that reinforce your brand identity and capture attention on every platform.',
  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop',
  '🎬',
  'marketing',
  '["Producción de video profesional (reels, stories, ads)", "Sesiones fotográficas de producto y lifestyle", "Edición y postproducción con identidad de marca", "Guiones y storyboards estratégicos", "Contenido optimizado por plataforma (IG, TikTok, YouTube)", "Banco de contenido mensual listo para publicar"]'::jsonb,
  '["Professional video production (reels, stories, ads)", "Product and lifestyle photo sessions", "Editing and post-production with brand identity", "Strategic scripts and storyboards", "Platform-optimized content (IG, TikTok, YouTube)", "Monthly content bank ready to publish"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  category       = EXCLUDED.category,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- -----------------------------------------------------------------------------
-- 3. REPORTES Y ANALÍTICA DE REDES SOCIALES
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, category, benefits_es, benefits_en)
VALUES (
  'reportes-y-analitica-de-redes-sociales',
  'Reportes y Analítica de Redes Sociales',
  'Social Media Reports & Analytics',
  'Dashboards de desempeño mensual: alcance, engagement y conversión — visibilidad total. Analizamos los datos de tus redes sociales para identificar qué funciona, qué ajustar y cómo optimizar tu estrategia digital para maximizar el retorno de inversión.',
  'Monthly performance dashboards: reach, engagement, and conversion — total visibility. We analyze your social media data to identify what works, what to adjust, and how to optimize your digital strategy to maximize return on investment.',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
  '📊',
  'marketing',
  '["Dashboards interactivos de desempeño mensual", "Métricas clave: alcance, engagement, conversión y ROI", "Análisis comparativo con competencia (benchmarking)", "Identificación de contenido de mejor rendimiento", "Recomendaciones accionables basadas en datos", "Informes ejecutivos mensuales listos para presentar"]'::jsonb,
  '["Interactive monthly performance dashboards", "Key metrics: reach, engagement, conversion, and ROI", "Competitive analysis (benchmarking)", "Top-performing content identification", "Actionable data-driven recommendations", "Monthly executive reports ready to present"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  category       = EXCLUDED.category,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- -----------------------------------------------------------------------------
-- 4. PAID MEDIA
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, category, benefits_es, benefits_en)
VALUES (
  'paid-media',
  'Paid Media',
  'Paid Media',
  'Creamos, administramos y optimizamos campañas de publicidad digital enfocadas en alcanzar tus objetivos de negocio, ya sea aumentar ventas, generar prospectos, incrementar el reconocimiento de marca o atraer tráfico a tu sitio web. Maximizamos cada peso invertido en pauta digital.',
  'We create, manage, and optimize digital advertising campaigns focused on achieving your business objectives, whether it''s increasing sales, generating leads, building brand awareness, or driving traffic to your website. We maximize every peso invested in digital ads.',
  'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop',
  '💰',
  'marketing',
  '["Campañas en Meta Ads (Facebook e Instagram)", "Google Ads: Search, Display y YouTube", "TikTok Ads y LinkedIn Ads", "Segmentación avanzada por audiencia e intereses", "A/B testing y optimización continua de creativos", "Reportes de ROI y costo por adquisición transparentes"]'::jsonb,
  '["Meta Ads campaigns (Facebook and Instagram)", "Google Ads: Search, Display, and YouTube", "TikTok Ads and LinkedIn Ads", "Advanced targeting by audience and interests", "A/B testing and continuous creative optimization", "Transparent ROI and cost-per-acquisition reports"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  category       = EXCLUDED.category,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- -----------------------------------------------------------------------------
-- 5. CONSULTORÍA DE MARKETING
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, category, benefits_es, benefits_en)
VALUES (
  'consultoria-de-marketing',
  'Consultoría de Marketing',
  'Marketing Consulting',
  'Analizamos la presencia digital de tu marca para identificar oportunidades de mejora y diseñar un plan de acción alineado con tus objetivos comerciales. Desde la auditoría de canales actuales hasta la definición de estrategia integral, te acompañamos para que cada decisión de marketing genere impacto real.',
  'We analyze your brand''s digital presence to identify improvement opportunities and design an action plan aligned with your business objectives. From auditing your current channels to defining a comprehensive strategy, we guide you so every marketing decision generates real impact.',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
  '🎯',
  'marketing',
  '["Auditoría completa de presencia digital actual", "Análisis de competencia y posicionamiento de marca", "Definición de buyer personas y customer journey", "Plan de marketing digital con KPIs medibles", "Estrategia de contenido y calendario editorial", "Acompañamiento mensual para ajustar según resultados"]'::jsonb,
  '["Complete audit of current digital presence", "Competitive analysis and brand positioning", "Buyer persona and customer journey definition", "Digital marketing plan with measurable KPIs", "Content strategy and editorial calendar", "Monthly follow-up to adjust based on results"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  category       = EXCLUDED.category,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- -----------------------------------------------------------------------------
-- 6. INFLUENCER MARKETING
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, category, benefits_es, benefits_en)
VALUES (
  'influencer-marketing',
  'Influencer Marketing',
  'Influencer Marketing',
  'Diseñamos y gestionamos campañas de influencer marketing enfocadas en generar confianza, alcance y conversiones. Nos encargamos de todo el proceso, desde la selección de perfiles hasta el seguimiento de resultados, asegurando colaboraciones auténticas y alineadas con los objetivos de tu marca.',
  'We design and manage influencer marketing campaigns focused on building trust, reach, and conversions. We handle the entire process, from profile selection to results tracking, ensuring authentic collaborations aligned with your brand''s objectives.',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
  '🤝',
  'marketing',
  '["Selección estratégica de influencers por nicho y audiencia", "Negociación y gestión de contratos y entregas", "Briefing creativo alineado con tu identidad de marca", "Coordinación de contenido y calendario de publicaciones", "Seguimiento de métricas: alcance, engagement y conversiones", "Reportes de campaña con ROI y aprendizajes clave"]'::jsonb,
  '["Strategic influencer selection by niche and audience", "Negotiation and management of contracts and deliverables", "Creative briefing aligned with your brand identity", "Content coordination and publishing calendar", "Metrics tracking: reach, engagement, and conversions", "Campaign reports with ROI and key learnings"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  category       = EXCLUDED.category,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- =============================================================================
-- Verificación: muestra todos los servicios agrupados por categoría
-- =============================================================================
SELECT category, slug, title_es, icon, updated_at
FROM public.services
ORDER BY category, created_at ASC;
