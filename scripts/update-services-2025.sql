-- =============================================================================
-- Actualización de servicios imSoft — 2025
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =============================================================================
-- 1. Asigna iconos a servicios legacy (slugs en inglés, icon = NULL)
-- 2. Renombra "aplicaciones-web" → "software-a-medida" (mejor posicionamiento)
-- 3. Actualiza descripción y beneficios de servicios existentes
-- 4. Inserta 5 servicios nuevos: IA, Automatización, E-commerce,
--    Mantenimiento y Soporte, Integraciones de Sistemas
-- 5. Inserta 2 servicios nuevos: Diseño UX/UI, Desarrollo Seguro
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 0. ELIMINAR DUPLICADOS LEGACY (slugs en inglés que tienen equivalente nuevo)
-- -----------------------------------------------------------------------------
-- Estos registros fueron reemplazados por versiones con slug en español
-- y contenido actualizado. Se eliminan para evitar duplicados en el catálogo.
DELETE FROM public.services WHERE slug = 'web-applications';    -- → software-a-medida
DELETE FROM public.services WHERE slug = 'mobile-applications'; -- → aplicaciones-moviles
DELETE FROM public.services WHERE slug = 'technology-consulting'; -- → consultoria-tecnologica
DELETE FROM public.services WHERE slug = 'online-store';        -- → tiendas-en-linea

-- Páginas Web y Análisis de datos no tienen equivalente nuevo — se actualizan
-- con iconos y contenido mejorado para mantenerlos en el catálogo.
UPDATE public.services SET
  title_es       = 'Páginas Web',
  title_en       = 'Web Pages',
  description_es = 'Creamos páginas web profesionales, rápidas y optimizadas para Google. Ideal para negocios que necesitan presencia digital sin la complejidad de un sistema a medida: sitios corporativos, landings de campaña, portafolios y micrositios con diseño atractivo y carga ultrarrápida.',
  description_en = 'We create professional, fast, and Google-optimized web pages. Ideal for businesses that need a digital presence without the complexity of a custom system: corporate sites, campaign landing pages, portfolios, and microsites with attractive design and ultra-fast loading.',
  image_url      = 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop',
  icon           = '🖥️',
  benefits_es    = '["Diseño responsive adaptado a todos los dispositivos", "Carga en menos de 2 segundos (Core Web Vitals)", "SEO técnico incluido desde el primer día", "Dominio, hosting y SSL configurados", "Integración con Google Analytics y Search Console", "Fácil de actualizar sin conocimientos técnicos"]'::jsonb,
  benefits_en    = '["Responsive design adapted to all devices", "Loads in under 2 seconds (Core Web Vitals)", "Technical SEO included from day one", "Domain, hosting, and SSL configured", "Google Analytics and Search Console integration", "Easy to update without technical knowledge"]'::jsonb,
  updated_at     = NOW()
WHERE slug = 'web-pages';

UPDATE public.services SET
  title_es       = 'Análisis de Datos',
  title_en       = 'Data Analysis',
  description_es = 'Convertimos los datos de tu negocio en decisiones inteligentes. Conectamos tus fuentes de información (CRM, ERP, e-commerce, redes sociales) y construimos dashboards interactivos que muestran en tiempo real qué está funcionando, qué no, y dónde están las oportunidades de crecimiento.',
  description_en = 'We turn your business data into smart decisions. We connect your information sources (CRM, ERP, e-commerce, social media) and build interactive dashboards that show in real time what''s working, what''s not, and where the growth opportunities are.',
  image_url      = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
  icon           = '📊',
  benefits_es    = '["Dashboards interactivos en tiempo real (Power BI, Metabase)", "Conexión con más de 50 fuentes de datos", "KPIs y métricas personalizadas para tu industria", "Reportes automáticos periódicos por email", "Análisis de cohortes, embudos y retención", "Capacitación para que tu equipo lea los datos solo"]'::jsonb,
  benefits_en    = '["Real-time interactive dashboards (Power BI, Metabase)", "Connection to over 50 data sources", "Custom KPIs and metrics for your industry", "Automatic periodic reports via email", "Cohort, funnel, and retention analysis", "Training so your team can read the data on their own"]'::jsonb,
  updated_at     = NOW()
WHERE slug = 'data-analysis';


-- -----------------------------------------------------------------------------
-- 1. SOFTWARE A MEDIDA
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, benefits_es, benefits_en)
VALUES (
  'software-a-medida',
  'Software a Medida',
  'Custom Software',
  'Deja de adaptar tu negocio al software que existe — construimos el que tu operación realmente necesita. Usamos Next.js, TypeScript y arquitecturas modernas para entregar plataformas web, portales internos y sistemas de gestión que tus equipos adoptan desde el primer día, porque fueron diseñados exactamente para ellos.',
  'Stop adapting your business to existing software — we build what your operation actually needs. We use Next.js, TypeScript, and modern architectures to deliver web platforms, internal portals, and management systems that your teams adopt from day one, because they were designed exactly for them.',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
  '💻',
  '["El código es tuyo — sin licencias ni dependencia de proveedores", "Stack moderno: Next.js 16, TypeScript, Supabase, Tailwind", "Panel de administración incluido para que gestiones tu contenido", "IA integrada donde tenga sentido: búsqueda, resúmenes, asistentes", "Entregas incrementales: ves avances desde la primera semana", "Arquitectura lista para escalar sin reescribir desde cero"]'::jsonb,
  '["The code is yours — no licenses or vendor dependency", "Modern stack: Next.js 16, TypeScript, Supabase, Tailwind", "Admin panel included so you manage your own content", "AI integrated where it makes sense: search, summaries, assistants", "Incremental delivery: you see progress from week one", "Architecture ready to scale without rewriting from scratch"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- -----------------------------------------------------------------------------
-- 2. APLICACIONES MÓVILES
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, benefits_es, benefits_en)
VALUES (
  'aplicaciones-moviles',
  'Aplicaciones Móviles',
  'Mobile Applications',
  'Tu negocio en el bolsillo de tus clientes — y funcionando sin internet. Desarrollamos apps con React Native y Expo que se sienten nativas en iOS y Android, con pagos integrados, notificaciones push, geolocalización y la capacidad de trabajar offline. Sin dos equipos de desarrollo, sin el doble de presupuesto.',
  'Your business in your customers'' pocket — and working without internet. We develop apps with React Native and Expo that feel native on iOS and Android, with integrated payments, push notifications, geolocation, and the ability to work offline. No two development teams, no double the budget.',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
  '📱',
  '["iOS y Android desde una sola base de código (React Native + Expo)", "Pagos en México: Mercado Pago, Clip, Stripe, OXXO", "Notificaciones push segmentadas por comportamiento del usuario", "Modo offline real: la app funciona sin señal y sincroniza después", "Publicación en App Store y Google Play gestionada por nosotros", "Acceso a cámara, GPS, biometría y sensores del dispositivo"]'::jsonb,
  '["iOS and Android from a single codebase (React Native + Expo)", "Payments in Mexico: Mercado Pago, Clip, Stripe, OXXO", "Push notifications segmented by user behavior", "True offline mode: the app works without signal and syncs later", "App Store and Google Play publishing managed by us", "Access to camera, GPS, biometrics, and device sensors"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- -----------------------------------------------------------------------------
-- 3. CONSULTORÍA TECNOLÓGICA
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, benefits_es, benefits_en)
VALUES (
  'consultoria-tecnologica',
  'Consultoría Tecnológica',
  'Technology Consulting',
  'Antes de gastar en tecnología, entiende qué tecnología necesitas. Analizamos tu operación completa — desde los Excel que sostienen procesos críticos hasta los sistemas que nadie ya sabe cómo funcionan — y te entregamos un plan concreto: qué automatizar, qué comprar, qué construir y en qué orden para que cada peso invertido genere retorno real.',
  'Before spending on technology, understand what technology you need. We analyze your entire operation — from the spreadsheets holding up critical processes to the systems nobody knows how they work anymore — and deliver a concrete plan: what to automate, what to buy, what to build, and in what order so every peso invested generates real return.',
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop',
  '🎯',
  '["Diagnóstico de madurez digital: dónde estás vs dónde deberías estar", "Mapa de procesos con identificación de cuellos de botella reales", "Evaluación de IA: qué tareas de tu equipo puede hacer un modelo", "Comparativa objetiva: comprar software vs desarrollar a medida", "Roadmap de 90 días con entregables concretos y responsables", "Acompañamiento mensual para ajustar el plan según resultados"]'::jsonb,
  '["Digital maturity diagnosis: where you are vs where you should be", "Process map with identification of real bottlenecks", "AI assessment: which of your team''s tasks a model can handle", "Objective comparison: buy software vs build custom", "90-day roadmap with concrete deliverables and owners", "Monthly follow-up to adjust the plan based on results"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- -----------------------------------------------------------------------------
-- 4. INTELIGENCIA ARTIFICIAL (NUEVO — servicio estrella)
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, benefits_es, benefits_en)
VALUES (
  'inteligencia-artificial',
  'Inteligencia Artificial',
  'Artificial Intelligence',
  'Integramos IA en tu negocio para que trabaje más inteligente, no más duro. Desde chatbots que atienden clientes 24/7 y sistemas que generan reportes automáticos, hasta motores de recomendación y análisis predictivo. Hacemos que la IA sea práctica, accesible y con retorno de inversión medible.',
  'We integrate AI into your business so it works smarter, not harder. From chatbots that serve customers 24/7 and systems that generate automatic reports, to recommendation engines and predictive analytics. We make AI practical, accessible, and with measurable ROI.',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=600&fit=crop',
  '🤖',
  '["Chatbots inteligentes con IA para atención al cliente", "Automatización de documentos y reportes con IA", "Análisis predictivo y detección de patrones", "Integración con OpenAI, Claude y modelos open source", "Búsqueda semántica en tus propios datos (RAG)", "Soluciones a medida sin necesidad de conocer IA"]'::jsonb,
  '["Intelligent AI chatbots for customer service", "AI-powered document and report automation", "Predictive analytics and pattern detection", "Integration with OpenAI, Claude, and open source models", "Semantic search on your own data (RAG)", "Custom solutions without needing AI expertise"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- -----------------------------------------------------------------------------
-- 5. AUTOMATIZACIÓN DE PROCESOS (NUEVO)
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, benefits_es, benefits_en)
VALUES (
  'automatizacion-de-procesos',
  'Automatización de Procesos',
  'Process Automation',
  'Eliminamos el trabajo manual repetitivo de tu operación. Automatizamos cotizaciones, facturación electrónica, envío de correos, actualizaciones de inventario, reportes periódicos y cualquier flujo de trabajo que hoy consume tiempo de tu equipo. Resultado: menos errores, más velocidad y tu equipo enfocado en lo que importa.',
  'We eliminate repetitive manual work from your operation. We automate quotes, electronic invoicing, email sending, inventory updates, periodic reports, and any workflow that currently consumes your team''s time. Result: fewer errors, more speed, and your team focused on what matters.',
  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=600&fit=crop',
  '⚙️',
  '["Automatización de flujos de trabajo completos", "Integración con WhatsApp Business, Gmail y Slack", "Facturación electrónica CFDI automática (SAT)", "Reportes y dashboards que se generan solos", "Notificaciones y alertas en tiempo real", "Compatible con tus sistemas actuales"]'::jsonb,
  '["Full workflow automation", "Integration with WhatsApp Business, Gmail, and Slack", "Automatic electronic invoicing CFDI (SAT)", "Reports and dashboards that generate themselves", "Real-time notifications and alerts", "Compatible with your current systems"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- -----------------------------------------------------------------------------
-- 6. TIENDAS EN LÍNEA / E-COMMERCE (NUEVO)
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, benefits_es, benefits_en)
VALUES (
  'tiendas-en-linea',
  'Tiendas en Línea',
  'E-commerce',
  'Llevamos tu negocio a internet con una tienda online que vende de verdad. Diseñamos y desarrollamos e-commerce a medida o sobre Shopify, con catálogo de productos, carrito de compras, pasarelas de pago mexicanas, gestión de pedidos y todo lo que necesitas para vender en línea desde el primer día.',
  'We take your business online with an e-commerce store that actually sells. We design and develop custom e-commerce or on Shopify, with product catalog, shopping cart, Mexican payment gateways, order management, and everything you need to sell online from day one.',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
  '🛒',
  '["Tienda personalizada o sobre Shopify según tu presupuesto", "Pasarelas de pago: Mercado Pago, Clip, Stripe, PayPal", "Gestión de inventario y pedidos en tiempo real", "Envíos integrados: Fedex, DHL, Estafeta", "Optimización SEO para aparecer en Google Shopping", "Panel de administración fácil de usar sin conocimientos técnicos"]'::jsonb,
  '["Custom store or Shopify depending on your budget", "Payment gateways: Mercado Pago, Clip, Stripe, PayPal", "Real-time inventory and order management", "Integrated shipping: Fedex, DHL, Estafeta", "SEO optimization to appear on Google Shopping", "Easy-to-use admin panel without technical knowledge"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- -----------------------------------------------------------------------------
-- 7. MANTENIMIENTO Y SOPORTE (NUEVO)
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, benefits_es, benefits_en)
VALUES (
  'mantenimiento-y-soporte',
  'Mantenimiento y Soporte',
  'Maintenance & Support',
  'Tu software necesita cuidado constante para seguir funcionando perfecto. Ofrecemos planes de mantenimiento mensual que incluyen actualizaciones de seguridad, corrección de bugs, mejoras de rendimiento, copias de seguridad y soporte prioritario. Para que tú te olvides de los problemas técnicos y te enfoques en tu negocio.',
  'Your software needs constant care to keep working perfectly. We offer monthly maintenance plans that include security updates, bug fixes, performance improvements, backups, and priority support. So you can forget about technical problems and focus on your business.',
  'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=800&h=600&fit=crop',
  '🛡️',
  '["Monitoreo 24/7 de disponibilidad y rendimiento", "Actualizaciones de seguridad y dependencias", "Corrección de bugs con tiempo de respuesta garantizado", "Copias de seguridad automáticas diarias", "Reportes mensuales del estado de tu plataforma", "Soporte técnico por WhatsApp, email y videollamada"]'::jsonb,
  '["24/7 availability and performance monitoring", "Security and dependency updates", "Bug fixes with guaranteed response time", "Automatic daily backups", "Monthly platform status reports", "Technical support via WhatsApp, email, and video call"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- -----------------------------------------------------------------------------
-- 8. INTEGRACIONES DE SISTEMAS (NUEVO)
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, benefits_es, benefits_en)
VALUES (
  'integraciones-de-sistemas',
  'Integraciones de Sistemas',
  'System Integrations',
  'Conectamos todas las herramientas de tu negocio para que hablen entre sí. Tu CRM con tu sistema de facturación. Tu tienda en línea con tu inventario. Tu WhatsApp con tu base de datos de clientes. Eliminamos la captura manual de datos entre sistemas y creamos un ecosistema digital donde todo fluye automáticamente.',
  'We connect all your business tools so they talk to each other. Your CRM with your billing system. Your online store with your inventory. Your WhatsApp with your customer database. We eliminate manual data entry between systems and create a digital ecosystem where everything flows automatically.',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
  '🔗',
  '["Integración con más de 100 plataformas y APIs", "Conectamos SAP, Salesforce, HubSpot, Zoho y más", "Sincronización con facturación electrónica SAT/CFDI", "APIs REST y Webhooks para conectar cualquier sistema", "Migración de datos sin pérdida de información", "Documentación técnica completa de cada integración"]'::jsonb,
  '["Integration with over 100 platforms and APIs", "We connect SAP, Salesforce, HubSpot, Zoho and more", "Sync with SAT/CFDI electronic invoicing", "REST APIs and Webhooks to connect any system", "Data migration without information loss", "Complete technical documentation for each integration"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- -----------------------------------------------------------------------------
-- 9. DISEÑO UX/UI (NUEVO)
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, benefits_es, benefits_en)
VALUES (
  'diseno-ux-ui',
  'Diseño UX/UI',
  'UX/UI Design',
  'Diseñamos interfaces que enamoran a tus usuarios y los convierten en clientes. Creamos la arquitectura de información, prototipos interactivos y el diseño visual de tu producto digital antes de escribir una sola línea de código. Reducimos re-trabajos, acortamos ciclos de desarrollo y entregamos experiencias que la gente quiere usar.',
  'We design interfaces that delight your users and turn them into customers. We create the information architecture, interactive prototypes, and visual design of your digital product before writing a single line of code. We reduce rework, shorten development cycles, and deliver experiences people want to use.',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
  '🎨',
  '["Research y análisis de usuarios objetivo", "Arquitectura de información y flujos de usuario", "Prototipado interactivo en Figma", "Sistema de diseño reutilizable (Design System)", "Pruebas de usabilidad con usuarios reales", "Entrega de assets listos para desarrollo"]'::jsonb,
  '["Research and target user analysis", "Information architecture and user flows", "Interactive prototyping in Figma", "Reusable design system", "Usability testing with real users", "Dev-ready asset delivery"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- -----------------------------------------------------------------------------
-- 10. DESARROLLO SEGURO (NUEVO)
-- -----------------------------------------------------------------------------
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, benefits_es, benefits_en)
VALUES (
  'desarrollo-seguro',
  'Desarrollo Seguro',
  'Secure Development',
  'Construimos software que resiste ataques desde el primer commit. Aplicamos las prácticas OWASP Top 10 en cada proyecto: autenticación robusta, cifrado de datos, validación de entradas, manejo seguro de secretos y revisión de dependencias. Si ya tienes una aplicación, la auditamos y reforzamos antes de que sea demasiado tarde.',
  'We build software that resists attacks from the very first commit. We apply OWASP Top 10 practices in every project: robust authentication, data encryption, input validation, secure secrets management, and dependency review. If you already have an application, we audit and harden it before it''s too late.',
  'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=600&fit=crop',
  '🔒',
  '["Auditoría de seguridad de aplicaciones web existentes", "Implementación de OWASP Top 10 en proyectos nuevos", "Autenticación segura: OAuth2, MFA, sesiones cifradas", "Revisión y actualización de dependencias vulnerables", "Manejo seguro de secretos y variables de entorno", "Reporte ejecutivo con hallazgos y plan de remediación"]'::jsonb,
  '["Security audit of existing web applications", "OWASP Top 10 implementation in new projects", "Secure authentication: OAuth2, MFA, encrypted sessions", "Vulnerable dependency review and updates", "Secure secrets and environment variable management", "Executive report with findings and remediation plan"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title_es       = EXCLUDED.title_es,
  title_en       = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url      = EXCLUDED.image_url,
  icon           = EXCLUDED.icon,
  benefits_es    = EXCLUDED.benefits_es,
  benefits_en    = EXCLUDED.benefits_en,
  updated_at     = NOW();


-- =============================================================================
-- Verificación: muestra los servicios resultantes ordenados por fecha
-- =============================================================================
SELECT slug, title_es, icon, updated_at
FROM public.services
ORDER BY created_at ASC;
