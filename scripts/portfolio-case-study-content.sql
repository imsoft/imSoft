-- Contenido de caso de estudio para todos los proyectos del portafolio
-- Ejecutar en Supabase SQL Editor

-- 1. Tuxcacuesco (gobierno municipal)
UPDATE portfolio SET
  year = 2023,
  challenge_es = 'El municipio no tenía presencia digital. Los ciudadanos tenían que acudir en persona o llamar por teléfono para obtener información sobre trámites, eventos y noticias del gobierno municipal. La comunicación era lenta, limitada y costosa para la administración.',
  challenge_en = 'The municipality had no digital presence. Citizens had to go in person or call to get information about government services, events and news. Communication was slow, limited and costly for the administration.',
  results_es = ARRAY[
    'Ciudadanos con acceso a información oficial las 24 horas, los 7 días',
    'Reducción de visitas presenciales para consultas básicas',
    'Canal de comunicación digital moderno y de bajo costo para el municipio',
    'Imagen institucional profesional y confiable ante la ciudadanía'
  ],
  results_en = ARRAY[
    'Citizens with access to official information 24/7',
    'Reduction in in-person visits for basic inquiries',
    'Modern and low-cost digital communication channel for the municipality',
    'Professional and trustworthy institutional image for citizens'
  ],
  client_quote_es = 'Ahora los ciudadanos pueden encontrar toda la información del municipio desde su celular. Ha mejorado mucho la comunicación con la comunidad.',
  client_quote_en = 'Now citizens can find all municipal information from their phone. It has greatly improved communication with the community.'
WHERE id = '0a15d020-12a3-416e-a175-50bd5c993d7a';

-- 2. Oro Nacional (joyería e-commerce)
UPDATE portfolio SET
  year = 2023,
  challenge_es = 'Oro Nacional vendía exclusivamente en su tienda física, limitando sus ventas a clientes locales. No tenían forma de mostrar su catálogo de joyería ni de recibir pedidos fuera de su horario de atención. Perdían clientes potenciales que buscaban joyería en línea.',
  challenge_en = 'Oro Nacional sold exclusively in their physical store, limiting sales to local customers. They had no way to showcase their jewelry catalog or receive orders outside business hours. They were losing potential customers searching for jewelry online.',
  results_es = ARRAY[
    'Canal de ventas en línea activo las 24 horas todos los días',
    'Catálogo de productos visible a compradores en todo el país',
    'Imagen premium que genera confianza antes de la primera compra',
    'Nuevas ventas de clientes que jamás hubieran llegado a la tienda física'
  ],
  results_en = ARRAY[
    'Online sales channel active 24/7 every day',
    'Product catalog visible to buyers nationwide',
    'Premium image that builds trust before the first purchase',
    'New sales from customers who would never have visited the physical store'
  ],
  client_quote_es = 'Empezamos a recibir pedidos de clientes de otras ciudades que nunca hubiéramos alcanzado con la tienda sola. Fue un cambio enorme para el negocio.',
  client_quote_en = 'We started receiving orders from customers in other cities we would never have reached with just the store. It was a huge change for the business.'
WHERE id = '13b80a6e-9921-4d7e-8d93-e5d615687fdc';

-- 3. Ortiz y Cia
UPDATE portfolio SET
  year = 2023,
  challenge_es = 'Ortiz y Cía dependía completamente del boca a boca para conseguir nuevos clientes. No tenían presencia digital y los clientes potenciales no podían verificar su credibilidad ni encontrar sus servicios al buscar en internet.',
  challenge_en = 'Ortiz y Cía relied entirely on word of mouth to get new clients. They had no digital presence and potential clients could not verify their credibility or find their services when searching online.',
  results_es = ARRAY[
    'Presencia profesional en línea que genera confianza desde el primer clic',
    'Nuevos clientes los encontraron a través de búsquedas en Google',
    'Presentación clara de servicios, experiencia y diferenciadores',
    'Aumento en solicitudes de contacto y cotizaciones'
  ],
  results_en = ARRAY[
    'Professional online presence that builds trust from the first click',
    'New clients found them through Google searches',
    'Clear presentation of services, experience and differentiators',
    'Increase in contact requests and quote inquiries'
  ],
  client_quote_es = 'Antes teníamos que explicarle a cada cliente qué hacíamos. Ahora simplemente les mandamos el sitio y ellos ya llegan con la decisión casi tomada.',
  client_quote_en = 'Before we had to explain to every client what we did. Now we just send them the website and they already arrive almost ready to decide.'
WHERE id = '1a0388ff-f0d5-4d61-b8b5-3ed2081ac731';

-- 4. Omnitria (plataforma inmobiliaria)
UPDATE portfolio SET
  year = 2024,
  challenge_es = 'Las inmobiliarias y agentes independientes no contaban con una plataforma propia y moderna para publicar y gestionar propiedades. Dependían de portales genéricos que no les permitían diferenciarse ni construir marca propia.',
  challenge_en = 'Real estate agencies and independent agents had no modern dedicated platform to publish and manage properties. They relied on generic portals that offered no brand differentiation.',
  results_es = ARRAY[
    'Plataforma inmobiliaria propia con gestión profesional de propiedades',
    'Experiencia de búsqueda moderna y diferenciada para compradores',
    'Sistema escalable que soporta múltiples agencias y miles de propiedades',
    'Marca digital propia que compite con los grandes portales del mercado'
  ],
  results_en = ARRAY[
    'Dedicated real estate platform with professional property management',
    'Modern and differentiated search experience for property buyers',
    'Scalable system supporting multiple agencies and thousands of properties',
    'Own digital brand that competes with major market portals'
  ],
  client_quote_es = 'Necesitábamos algo nuestro, no depender de plataformas de terceros. imSoft nos entregó exactamente eso: una plataforma que es 100% nuestra.',
  client_quote_en = 'We needed something of our own, not to depend on third-party platforms. imSoft delivered exactly that: a platform that is 100% ours.'
WHERE id = '3ca8af0f-fde2-4ee6-9ea7-d50f4680e210';

-- 5. Infinito Empresarial y Aduanero
UPDATE portfolio SET
  year = 2023,
  challenge_es = 'Sus servicios de logística y aduanas eran difíciles de encontrar en línea. Perdían clientes corporativos que no podían verificar su experiencia ni encontrar su información de contacto rápidamente al buscar en internet.',
  challenge_en = 'Their logistics and customs services were hard to find online. They lost corporate clients who could not verify their expertise or find contact information quickly when searching online.',
  results_es = ARRAY[
    'Sitio corporativo que los posiciona como expertos en logística y aduanas',
    'Nuevos clientes empresariales los encontraron a través de Google',
    'Presentación clara y profesional de todos sus servicios especializados',
    'Aumento en solicitudes de cotización de empresas importadoras y exportadoras'
  ],
  results_en = ARRAY[
    'Corporate website positioning them as logistics and customs experts',
    'New business clients found them through Google',
    'Clear and professional presentation of all their specialized services',
    'Increase in quote requests from import and export companies'
  ],
  client_quote_es = 'Ahora cuando un cliente busca servicios aduaneros en Jalisco, nos puede encontrar y ver todo lo que ofrecemos antes de llamarnos. Eso hace toda la diferencia.',
  client_quote_en = 'Now when a client searches for customs services in Jalisco, they can find us and see everything we offer before calling. That makes all the difference.'
WHERE id = '3f679682-3a32-4359-99bd-45f1dcf084b8';

-- 6. La Casa Del Paste (gestión interna)
UPDATE portfolio SET
  year = 2024,
  challenge_es = 'Gestionaban sus operaciones de forma manual con hojas de cálculo y notas en papel. Esto generaba errores frecuentes, retrasos en los pedidos y falta de visibilidad sobre el desempeño real del negocio.',
  challenge_en = 'They managed their operations manually with spreadsheets and paper notes. This caused frequent errors, order delays and lack of visibility into the actual business performance.',
  results_es = ARRAY[
    'Sistema digital centralizado para gestión de operaciones y pedidos',
    'Eliminación de hojas de cálculo manuales y errores de captura',
    'Visibilidad en tiempo real del desempeño del negocio',
    'Operaciones más rápidas y equipo trabajando con mayor orden'
  ],
  results_en = ARRAY[
    'Centralized digital system for operations and order management',
    'Elimination of manual spreadsheets and data entry errors',
    'Real-time visibility into business performance',
    'Faster operations and team working with greater organization'
  ],
  client_quote_es = 'Antes perdíamos tiempo buscando información en papeles y hojas de Excel. Ahora todo está en un solo lugar y el equipo trabaja mucho más ordenado.',
  client_quote_en = 'Before we wasted time searching through papers and Excel sheets. Now everything is in one place and the team works much more organized.'
WHERE id = '51e402f2-5b88-4485-9d96-2ab31d605f84';

-- 7. Steridental - Generador de pedidos
UPDATE portfolio SET
  year = 2024,
  challenge_es = 'Los clientes tenían que llamar o mandar mensajes para hacer pedidos, generando un proceso caótico y propenso a errores para el equipo de ventas. Cada pedido requería intervención manual, lo que consumía tiempo valioso del personal.',
  challenge_en = 'Customers had to call or send messages to place orders, creating a chaotic and error-prone process for the sales team. Each order required manual intervention, consuming valuable staff time.',
  results_es = ARRAY[
    'Clientes generan sus propios pedidos de forma autónoma en línea',
    'Reducción drástica de errores en captura de pedidos',
    'Equipo de ventas liberado de toma de pedidos manuales',
    'Experiencia profesional y moderna para los clientes de Steridental'
  ],
  results_en = ARRAY[
    'Customers generate their own orders autonomously online',
    'Drastic reduction in order entry errors',
    'Sales team freed from manual order taking',
    'Professional and modern experience for Steridental clients'
  ],
  client_quote_es = 'Nuestros clientes ahora hacen sus pedidos solos sin necesidad de llamarnos. Nos ahorra muchísimo tiempo y los errores casi desaparecieron.',
  client_quote_en = 'Our clients now place their orders on their own without needing to call us. It saves us a lot of time and errors have almost disappeared.'
WHERE id = '5fccba7e-1f8d-4f00-8056-f23fd1c539d0';

-- 8. Brangarciaramos (marca personal)
UPDATE portfolio SET
  year = 2024,
  challenge_es = 'No existía un hub digital central para presentar habilidades, proyectos y servicios. Los clientes potenciales no tenían un lugar profesional donde conocer la propuesta de valor y hacer contacto de forma directa.',
  challenge_en = 'There was no central digital hub to showcase skills, projects and services. Potential clients had no professional place to learn about the value proposition and make direct contact.',
  results_es = ARRAY[
    'Marca personal profesional establecida con presencia digital sólida',
    'Vitrina centralizada de trabajo y servicios disponible las 24 horas',
    'Conversión mejorada de visitantes de redes sociales a clientes',
    'Credibilidad y confianza generada antes del primer contacto'
  ],
  results_en = ARRAY[
    'Professional personal brand established with a solid digital presence',
    'Centralized showcase of work and services available 24/7',
    'Improved conversion of social media visitors to clients',
    'Credibility and trust built before the first contact'
  ]
WHERE id = '6163153e-ba21-4c7a-95bb-abd81f69aeef';

-- 9. Santa Maria Del Oro Jalisco (sitio turístico)
UPDATE portfolio SET
  year = 2023,
  challenge_es = 'El municipio no tenía presencia digital para atraer turistas. Los visitantes potenciales no tenían forma de descubrir en línea los atractivos, eventos y servicios del lugar, perdiendo oportunidades de turismo frente a destinos mejor posicionados.',
  challenge_en = 'The municipality had no digital presence to attract tourists. Potential visitors had no way to discover online the attractions, events and services of the area, losing tourism opportunities to better-positioned destinations.',
  results_es = ARRAY[
    'Promoción turística digital activa las 24 horas, los 7 días',
    'Atractivos y puntos de interés del municipio descubribles en Google',
    'Aumento en el interés y consultas de visitantes potenciales',
    'Imagen profesional del municipio que compite con otros destinos turísticos'
  ],
  results_en = ARRAY[
    'Active digital tourism promotion 24/7',
    'Municipal attractions and points of interest discoverable on Google',
    'Increase in interest and inquiries from potential visitors',
    'Professional municipal image that competes with other tourist destinations'
  ],
  client_quote_es = 'Ahora los turistas pueden encontrar información de Santa María del Oro en internet antes de visitar. Eso nos pone en el mapa junto a destinos mucho más grandes.',
  client_quote_en = 'Now tourists can find information about Santa María del Oro online before visiting. That puts us on the map alongside much larger destinations.'
WHERE id = '6beda0cb-68be-4df8-9656-5153d13eee4e';

-- 10. Cursumi (plataforma de cursos)
UPDATE portfolio SET
  year = 2023,
  challenge_es = 'No tenían una plataforma propia para vender cursos y gestionar contenido educativo. Dependían de plataformas de terceros que cobraban altas comisiones, limitaban la personalización y no les permitían construir su propia base de alumnos.',
  challenge_en = 'They had no dedicated platform to sell courses and manage educational content. They relied on third-party platforms that charged high commissions, limited customization and prevented them from building their own student base.',
  results_es = ARRAY[
    'Plataforma propia con 0% de comisiones sobre cada venta de curso',
    'Control total sobre el contenido, la experiencia y los datos de alumnos',
    'Sistema escalable para agregar nuevos cursos e instructores',
    'Experiencia de estudiante mejorada que aumenta la retención y referidos'
  ],
  results_en = ARRAY[
    'Own platform with 0% commissions on every course sale',
    'Full control over content, experience and student data',
    'Scalable system to add new courses and instructors',
    'Improved student experience that increases retention and referrals'
  ],
  client_quote_es = 'Con nuestra plataforma propia dejamos de regalarle comisiones a terceros y empezamos a construir nuestra propia comunidad de alumnos. Fue la mejor decisión.',
  client_quote_en = 'With our own platform we stopped giving commissions to third parties and started building our own student community. It was the best decision.'
WHERE id = '734c5e2f-fd5e-4a62-832e-13e075f9b72a';

-- 11. JTP Logistics (sitio web)
UPDATE portfolio SET
  year = 2022,
  challenge_es = 'JTP no tenía sitio web y dependía del boca a boca para conseguir nuevos clientes. En el sector logístico, la credibilidad digital es clave para ganar contratos corporativos, y sin presencia en línea perdían frente a competidores con sitios profesionales.',
  challenge_en = 'JTP had no website and relied on word of mouth to get new clients. In the logistics sector, digital credibility is key to winning corporate contracts, and without an online presence they lost to competitors with professional websites.',
  results_es = ARRAY[
    'Sitio web profesional que posiciona a JTP como socio logístico confiable',
    'Nuevos clientes corporativos los encontraron a través de Google',
    'Presentación clara de servicios para tomadores de decisiones B2B',
    'Aumento en solicitudes de cotización de empresas medianas y grandes'
  ],
  results_en = ARRAY[
    'Professional website positioning JTP as a reliable logistics partner',
    'New corporate clients found them through Google',
    'Clear service presentation for B2B decision-makers',
    'Increase in quote requests from mid-size and large companies'
  ],
  client_quote_es = 'Antes teníamos que conseguir clientes solo por contactos. Ahora el sitio trabaja por nosotros y recibimos solicitudes de empresas que nunca hubiéramos contactado.',
  client_quote_en = 'Before we had to get clients only through contacts. Now the website works for us and we receive inquiries from companies we would never have reached out to.'
WHERE id = '758479dc-dc3e-48fb-8342-acf25768f6bb';

-- 12. Bemästra Dental (clínica dental)
UPDATE portfolio SET
  year = 2023,
  challenge_es = 'La clínica dependía únicamente de los referidos de pacientes existentes para crecer. Los nuevos pacientes buscaban dentistas en Google pero no podían encontrar a Bemästra, perdiendo frente a clínicas con presencia digital.',
  challenge_en = 'The clinic depended solely on referrals from existing patients to grow. New patients searched for dentists on Google but could not find Bemästra, losing to clinics with digital presence.',
  results_es = ARRAY[
    'La clínica aparece en búsquedas locales de Google cuando pacientes buscan dentista',
    'Nuevos pacientes llegan al consultorio habiendo visto el sitio web primero',
    'Imagen profesional que genera confianza antes de la primera visita',
    'Aumento en consultas y citas agendadas de pacientes nuevos'
  ],
  results_en = ARRAY[
    'Clinic appears in local Google searches when patients look for a dentist',
    'New patients arrive at the office having seen the website first',
    'Professional image that builds trust before the first visit',
    'Increase in inquiries and appointments from new patients'
  ],
  client_quote_es = 'Pacientes nos dicen que nos buscaron en Google y que el sitio les dio confianza para agendar. Eso antes simplemente no pasaba porque no existíamos en internet.',
  client_quote_en = 'Patients tell us they searched on Google and the website gave them confidence to book. That simply didn''t happen before because we didn''t exist online.'
WHERE id = '7fdc3672-2668-4c73-917d-55574af8f068';

-- 13. Starfilters - Generador de reportes
UPDATE portfolio SET
  year = 2024,
  challenge_es = 'Los reportes para clientes se generaban manualmente en Excel, un proceso lento y propenso a errores que consumía horas del equipo cada semana. La calidad y consistencia de los reportes variaba dependiendo de quién los hiciera.',
  challenge_en = 'Client reports were generated manually in Excel, a slow and error-prone process that consumed hours of staff time each week. Report quality and consistency varied depending on who created them.',
  results_es = ARRAY[
    'Generación automática de reportes dinámicos en segundos',
    'Reducción drástica del tiempo dedicado a preparación de reportes',
    'Reportes consistentes y profesionales entregados a todos los clientes',
    'Equipo liberado para enfocarse en tareas de mayor valor'
  ],
  results_en = ARRAY[
    'Automatic generation of dynamic reports in seconds',
    'Drastic reduction in time spent on report preparation',
    'Consistent and professional reports delivered to all clients',
    'Team freed to focus on higher-value tasks'
  ],
  client_quote_es = 'Lo que antes nos tomaba horas de trabajo en Excel ahora lo hacemos en segundos. El sistema fue una inversión que se pagó sola muy rápido.',
  client_quote_en = 'What used to take us hours of Excel work now takes seconds. The system was an investment that paid for itself very quickly.'
WHERE id = '86cb8704-94bd-4053-b144-d21d1702e7c5';

-- 14. Profibra (empresa industrial)
UPDATE portfolio SET
  year = 2022,
  challenge_es = 'A pesar de años en el mercado, Profibra no tenía presencia en línea. Empresas que buscaban productos industriales de fibra no podían encontrarlos en internet, perdiendo negocios frente a competidores que sí tenían sitio web.',
  challenge_en = 'Despite years in the market, Profibra had no online presence. Companies searching for industrial fiber products could not find them online, losing business to competitors who had websites.',
  results_es = ARRAY[
    'Catálogo completo de productos industriales visible en internet',
    'Nuevos clientes empresariales los descubrieron a través de Google',
    'Imagen profesional que compite con empresas más grandes del sector',
    'Aumento en consultas y solicitudes de cotización B2B'
  ],
  results_en = ARRAY[
    'Full industrial product catalog now visible online',
    'New business clients discovered them through Google',
    'Professional image competing with larger companies in the sector',
    'Increase in B2B inquiries and quote requests'
  ],
  client_quote_es = 'Clientes que estaban buscando proveedores en internet nos encontraron y contactaron directamente. Sin el sitio web eso jamás hubiera pasado.',
  client_quote_en = 'Clients who were searching for suppliers online found us and contacted us directly. Without the website that would never have happened.'
WHERE id = '95fe7e70-eb73-479b-8240-7b31193d281e';

-- 15. Wellpoint (SaaS salud)
UPDATE portfolio SET
  year = 2024,
  challenge_es = 'Los centros de salud y bienestar gestionaban sus servicios, profesionales y citas en hojas de cálculo y grupos de WhatsApp desconectados. No existía un sistema centralizado que les diera visibilidad y control real sobre su operación.',
  challenge_en = 'Health and wellness centers managed their services, professionals and appointments in disconnected spreadsheets and WhatsApp groups. There was no centralized system giving them real visibility and control over their operations.',
  results_es = ARRAY[
    'Plataforma SaaS centralizada para gestionar servicios y profesionales de salud',
    'Eliminación de hojas de cálculo y comunicación dispersa por WhatsApp',
    'Acceso desde cualquier dispositivo en tiempo real',
    'Experiencia digital profesional para los usuarios finales del centro'
  ],
  results_en = ARRAY[
    'Centralized SaaS platform to manage health services and professionals',
    'Elimination of spreadsheets and dispersed WhatsApp communication',
    'Access from any device in real time',
    'Professional digital experience for the center''s end users'
  ],
  client_quote_es = 'Pasamos de manejar todo en WhatsApp y Excel a tener una plataforma real. La operación se profesionalizó completamente y los clientes lo notan.',
  client_quote_en = 'We went from managing everything on WhatsApp and Excel to having a real platform. The operation became fully professionalized and clients notice it.'
WHERE id = '9b773430-a7c8-4fec-8aa6-5eac9f381d43';

-- 16. Ferreacabados Jalisco
UPDATE portfolio SET
  year = 2022,
  challenge_es = 'Ferrejalisco tenía una base de clientes locales pero no podía llegar a compradores fuera de su zona. Sin catálogo en línea, los clientes potenciales no podían conocer su inventario antes de visitar la tienda, reduciendo las visitas de compradores nuevos.',
  challenge_en = 'Ferrejalisco had a loyal local customer base but could not reach buyers outside their area. Without an online catalog, potential clients could not browse their inventory before visiting, reducing new buyer visits.',
  results_es = ARRAY[
    'Catálogo de productos de ferretería disponible en línea las 24 horas',
    'Nuevos clientes descubrieron la ferretería digitalmente',
    'Imagen profesional que genera confianza frente a la competencia',
    'Aumento en visitas y consultas de compradores que vieron el catálogo online'
  ],
  results_en = ARRAY[
    'Hardware product catalog available online 24/7',
    'New customers discovered the store digitally',
    'Professional image that builds trust against the competition',
    'Increase in visits and inquiries from buyers who saw the online catalog'
  ],
  client_quote_es = 'Antes solo nos conocían los que pasaban por la tienda. Ahora clientes de otras colonias nos buscan porque vieron nuestros productos en internet.',
  client_quote_en = 'Before only people who walked by the store knew us. Now clients from other areas seek us out because they saw our products online.'
WHERE id = 'b82863af-1276-458c-9a09-cbc486a1f52a';

-- 17. JTP Logistics - Inventario
UPDATE portfolio SET
  year = 2023,
  challenge_es = 'El control de inventario en JTP se hacía en hojas de cálculo, causando discrepancias, pérdida de artículos y falta de visibilidad en tiempo real sobre los niveles de stock. El equipo perdía horas semanales conciliando datos manualmente.',
  challenge_en = 'Inventory management at JTP was done in spreadsheets, causing discrepancies, lost items and lack of real-time visibility into stock levels. The team lost hours weekly reconciling data manually.',
  results_es = ARRAY[
    'Sistema digital de control de inventario en tiempo real',
    'Eliminación de discrepancias y pérdidas causadas por hojas de cálculo',
    'Visibilidad instantánea del stock disponible para todo el equipo',
    'Reducción significativa del tiempo dedicado a conciliación de inventario'
  ],
  results_en = ARRAY[
    'Real-time digital inventory control system',
    'Elimination of discrepancies and losses caused by spreadsheets',
    'Instant stock visibility for the entire team',
    'Significant reduction in time spent on inventory reconciliation'
  ],
  client_quote_es = 'Ya no perdemos tiempo buscando qué hay en el almacén o corrigiendo errores de conteo. El sistema nos da el control que necesitábamos desde hace mucho.',
  client_quote_en = 'We no longer waste time searching for what''s in the warehouse or correcting count errors. The system gives us the control we''ve needed for a long time.'
WHERE id = 'b9e7990e-2619-4d48-953c-90e03bf403c3';

-- 18. Holistia (plataforma salud holística)
UPDATE portfolio SET
  year = 2024,
  challenge_es = 'Los profesionales de salud holística no tenían una plataforma centralizada para ofrecer sus servicios y conectar con clientes. Los usuarios tenían que buscar en múltiples canales para encontrar profesionales confiables, y los especialistas no tenían visibilidad digital.',
  challenge_en = 'Holistic health professionals had no centralized platform to offer their services and connect with clients. Users had to search across multiple channels to find reliable professionals, and specialists had no digital visibility.',
  results_es = ARRAY[
    'Plataforma que conecta profesionales de salud holística con usuarios en un solo lugar',
    'Especialistas con perfil digital profesional visible para clientes potenciales',
    'Proceso simplificado de búsqueda y contacto de profesionales',
    'Comunidad creciente de profesionales y usuarios dentro de la plataforma'
  ],
  results_en = ARRAY[
    'Platform connecting holistic health professionals with users in one place',
    'Professionals with a professional digital profile visible to potential clients',
    'Simplified process for finding and contacting professionals',
    'Growing community of professionals and users within the platform'
  ],
  client_quote_es = 'Holistia le dio a nuestros profesionales una presencia digital que de otra forma no hubieran podido tener. La plataforma se convirtió en el corazón del negocio.',
  client_quote_en = 'Holistia gave our professionals a digital presence they otherwise wouldn''t have had. The platform became the heart of the business.'
WHERE id = 'e331f18e-dfbf-46fb-ba27-cd460b4be4e0';

-- 19. RM Constructora
UPDATE portfolio SET
  year = 2023,
  challenge_es = 'RM Constructora ganaba proyectos principalmente a través de contactos personales. Sin un sitio web profesional, no podían presentar de forma creíble su portafolio de obras y servicios a nuevos clientes corporativos que los encontraran por su cuenta.',
  challenge_en = 'RM Constructora won projects primarily through personal contacts. Without a professional website, they could not credibly present their project portfolio and services to new corporate clients who found them independently.',
  results_es = ARRAY[
    'Sitio web que exhibe proyectos terminados y servicios de forma profesional',
    'Nuevos clientes corporativos los encontraron a través de Google',
    'Imagen de marca sólida para negociaciones con desarrolladores y empresas',
    'Aumento en solicitudes de cotización de proyectos de mayor escala'
  ],
  results_en = ARRAY[
    'Website showcasing completed projects and services professionally',
    'New corporate clients found them through Google',
    'Solid brand image for negotiations with developers and companies',
    'Increase in quote requests for larger-scale projects'
  ],
  client_quote_es = 'Antes llegábamos a las reuniones y teníamos que explicar todo desde cero. Ahora los clientes ya revisaron nuestro sitio y llegan sabiendo quiénes somos.',
  client_quote_en = 'Before we arrived at meetings and had to explain everything from scratch. Now clients have already reviewed our website and arrive knowing who we are.'
WHERE id = 'e46351da-f937-47f8-bbd2-72768a939e4d';

-- 20. Starfilters (e-commerce industrial)
UPDATE portfolio SET
  year = 2023,
  challenge_es = 'Starfilters vendía filtros industriales exclusivamente a través de su equipo de ventas tradicional, sin canal en línea. Los compradores no podían explorar productos ni solicitar cotizaciones fuera del horario de oficina, limitando el alcance comercial de la empresa.',
  challenge_en = 'Starfilters sold industrial filters exclusively through their traditional sales team, with no online channel. Buyers could not browse products or request quotes outside business hours, limiting the company''s commercial reach.',
  results_es = ARRAY[
    'Canal de ventas en línea disponible las 24 horas para clientes industriales',
    'Catálogo técnico profesional que genera credibilidad con compradores B2B',
    'Mayor visibilidad de productos ante empresas en todo el país',
    'Nuevas oportunidades de venta más allá de la red de ventas tradicional'
  ],
  results_en = ARRAY[
    '24/7 online sales channel available for industrial clients',
    'Professional technical catalog that builds credibility with B2B buyers',
    'Greater product visibility to companies nationwide',
    'New sales opportunities beyond the traditional sales network'
  ],
  client_quote_es = 'Ahora clientes que antes ni sabían que existíamos nos encuentran en internet, ven nuestro catálogo y nos contactan directamente. El e-commerce abrió un mercado completamente nuevo.',
  client_quote_en = 'Now clients who didn''t even know we existed find us online, browse our catalog and contact us directly. The e-commerce opened a completely new market.'
WHERE id = 'e6a70299-c8a1-49ef-a51e-1b625b4bc0d8';

-- 21. Construcción Inteligente
UPDATE portfolio SET
  year = 2023,
  challenge_es = 'Como muchas empresas constructoras, dependían de referidos y no tenían presencia digital. Esto limitaba su visibilidad a clientes potenciales fuera de su red personal y les impedía competir con constructoras que ya tenían imagen profesional en línea.',
  challenge_en = 'Like many construction companies, they relied on referrals and had no digital presence. This limited their visibility to potential clients outside their personal network and prevented them from competing with builders who already had a professional online image.',
  results_es = ARRAY[
    'Sitio web moderno que los posiciona por encima de la competencia',
    'Imagen de marca profesional que genera confianza antes del primer contacto',
    'Nuevos contactos de clientes que los encontraron buscando en internet',
    'Alcance expandido más allá de su red personal de referidos'
  ],
  results_en = ARRAY[
    'Modern website positioning them above the competition',
    'Professional brand image that builds trust before the first contact',
    'New contacts from clients who found them searching online',
    'Expanded reach beyond their personal referral network'
  ],
  client_quote_es = 'El sitio web nos puso al nivel de constructoras mucho más grandes. Los clientes nos perciben diferente y eso se refleja en los proyectos que nos llegan.',
  client_quote_en = 'The website put us on the level of much larger construction companies. Clients perceive us differently and that is reflected in the projects that come to us.'
WHERE id = 'f70c2679-72ba-4699-b490-fca1b0ee07f0';

-- 22. The PodStore (procesos internos)
UPDATE portfolio SET
  year = 2024,
  challenge_es = 'La empresa gestionaba sus procesos internos de forma manual, sin un sistema digital para rastrear operaciones, tareas y flujos de trabajo. Esto generaba ineficiencias, falta de visibilidad entre el equipo y retrasos en la ejecución.',
  challenge_en = 'The company managed its internal processes manually, with no digital system to track operations, tasks and workflows. This caused inefficiencies, lack of team visibility and execution delays.',
  results_es = ARRAY[
    'Sistema digital centralizado para gestión de procesos internos',
    'Eliminación del seguimiento manual de tareas y operaciones',
    'Coordinación mejorada y visibilidad completa para todo el equipo',
    'Ejecución más rápida y ordenada de los flujos de trabajo internos'
  ],
  results_en = ARRAY[
    'Centralized digital system for internal process management',
    'Elimination of manual task and operations tracking',
    'Improved coordination and full visibility for the entire team',
    'Faster and more organized execution of internal workflows'
  ],
  client_quote_es = 'Tener todo el proceso en un sistema propio cambió la forma en que operamos. El equipo trabaja más coordinado y los errores se redujeron enormemente.',
  client_quote_en = 'Having the entire process in our own system changed the way we operate. The team works more coordinated and errors have been greatly reduced.'
WHERE id = 'fd01aabd-d41d-476b-a814-c796ebbabb0d';
