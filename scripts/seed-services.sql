-- Insertar servicios iniciales
INSERT INTO public.services (slug, title_es, title_en, description_es, description_en, image_url, icon, benefits_es, benefits_en) VALUES

-- Aplicaciones Web
('aplicaciones-web',
 'Aplicaciones Web',
 'Web Applications',
 'Desarrollamos aplicaciones web modernas, escalables y de alto rendimiento que transforman tu negocio. Utilizamos las últimas tecnologías como React, Next.js y Node.js para crear experiencias web excepcionales que tus usuarios amarán.',
 'We develop modern, scalable, and high-performance web applications that transform your business. We use the latest technologies like React, Next.js, and Node.js to create exceptional web experiences that your users will love.',
 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
 '💻',
 '["Desarrollo con tecnologías de última generación", "Diseño responsive para todos los dispositivos", "Optimización SEO y rendimiento", "Integración con APIs y servicios externos", "Arquitectura escalable y mantenible", "Soporte y mantenimiento continuo"]'::jsonb,
 '["Development with cutting-edge technologies", "Responsive design for all devices", "SEO and performance optimization", "Integration with APIs and external services", "Scalable and maintainable architecture", "Continuous support and maintenance"]'::jsonb),

-- Aplicaciones Móviles
('aplicaciones-moviles',
 'Aplicaciones Móviles',
 'Mobile Applications',
 'Creamos aplicaciones móviles nativas y multiplataforma para iOS y Android. Desde apps de e-commerce hasta soluciones empresariales, desarrollamos aplicaciones móviles que ofrecen experiencias fluidas y funcionalidad robusta.',
 'We create native and cross-platform mobile applications for iOS and Android. From e-commerce apps to enterprise solutions, we develop mobile applications that offer smooth experiences and robust functionality.',
 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
 '📱',
 '["Desarrollo nativo (iOS/Android) y multiplataforma (React Native)", "Interfaz intuitiva y experiencia de usuario optimizada", "Integración con servicios en la nube", "Notificaciones push y mensajería en tiempo real", "Sincronización offline y almacenamiento local", "Publicación en App Store y Google Play"]'::jsonb,
 '["Native (iOS/Android) and cross-platform development (React Native)", "Intuitive interface and optimized user experience", "Cloud services integration", "Push notifications and real-time messaging", "Offline sync and local storage", "Publication on App Store and Google Play"]'::jsonb),

-- Consultoría Tecnológica
('consultoria-tecnologica',
 'Consultoría Tecnológica',
 'Technology Consulting',
 'Asesoramos a empresas en la transformación digital y la adopción de nuevas tecnologías. Ayudamos a definir estrategias tecnológicas, optimizar procesos y seleccionar las mejores herramientas para alcanzar tus objetivos de negocio.',
 'We advise companies on digital transformation and adoption of new technologies. We help define technology strategies, optimize processes, and select the best tools to achieve your business objectives.',
 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
 '🎯',
 '["Análisis y auditoría de infraestructura tecnológica", "Definición de roadmap tecnológico", "Selección de tecnologías y herramientas", "Optimización de procesos de desarrollo", "Capacitación y formación de equipos", "Asesoría en arquitectura de software"]'::jsonb,
 '["Analysis and audit of technological infrastructure", "Definition of technology roadmap", "Selection of technologies and tools", "Development process optimization", "Team training and education", "Software architecture consulting"]'::jsonb)

ON CONFLICT (slug) DO UPDATE SET
  title_es = EXCLUDED.title_es,
  title_en = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  benefits_es = EXCLUDED.benefits_es,
  benefits_en = EXCLUDED.benefits_en,
  updated_at = NOW();
