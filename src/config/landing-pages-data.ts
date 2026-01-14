import type { LandingPageConfig } from '@/types/landing-pages';

/**
 * Configuración completa de contenido para las 15 landing pages
 * Cada combinación ciudad + industria tiene contenido único y específico
 */
export const landingPagesData: LandingPageConfig = {
  guadalajara: {
    'software-para-inmobiliarias': {
      seoTitle: 'Software para Inmobiliarias en Guadalajara | Desarrollo a la Medida - imSoft',
      seoDescription:
        'Desarrollamos plataformas digitales para inmobiliarias en Guadalajara. Sistemas de gestión de propiedades, portales web y apps móviles que impulsan tus ventas.',
      h1: 'Software Especializado para Inmobiliarias en Guadalajara',
      heroSubtitle:
        'Transformamos la gestión inmobiliaria con páginas web modernas, aplicaciones móviles nativas, análisis de datos en tiempo real y consultoría tecnológica especializada diseñadas para aumentar tus ventas y optimizar la operación de tu empresa en la Zona Metropolitana de Guadalajara.',
      problems: {
        title: '¿Tu inmobiliaria enfrenta estos desafíos?',
        items: [
          'Gestión manual de propiedades dispersa entre Excel, emails y WhatsApp',
          'Falta de visibilidad en tiempo real del inventario disponible',
          'Dificultad para que clientes agenden visitas o soliciten información',
          'Páginas web desactualizadas que no reflejan tu oferta actual ni generan leads de calidad',
          'Procesos lentos de seguimiento a prospectos y clientes sin análisis de datos que permitan optimizar la conversión',
          'Incapacidad de integrar con portales inmobiliarios externos',
        ],
      },
      solutions: {
        title: 'Soluciones tecnológicas que transforman tu negocio',
        items: [
          {
            title: 'Portal Inmobiliario Personalizado',
            description:
              'Plataforma web moderna con búsqueda avanzada por zona, precio, características. Integración con Google Maps para ubicaciones en Guadalajara, Zapopan, Tlaquepaque.',
          },
          {
            title: 'CRM Inmobiliario a la Medida',
            description:
              'Gestiona propiedades, clientes, agendamiento de citas, seguimiento automatizado, reportes de rendimiento y dashboards ejecutivos.',
          },
          {
            title: 'App Móvil para Agentes',
            description:
              'Aplicación nativa iOS/Android para que tus agentes actualicen propiedades, compartan información y cierren ventas desde cualquier lugar.',
          },
          {
            title: 'Sistema de Tours Virtuales',
            description:
              'Integración de tours 360°, videos HD y documentación digital de propiedades para mostrar a clientes sin salir de casa.',
          },
        ],
      },
      imSoftServices: {
        title: 'Tecnología empresarial para inmobiliarias',
        description:
          'En imSoft desarrollamos soluciones digitales robustas y escalables que impulsan el crecimiento de empresas inmobiliarias en Guadalajara. Ofrecemos páginas web modernas, aplicaciones móviles, análisis de datos, tiendas en línea y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web y Plataformas Personalizadas',
            description:
              'Páginas web modernas y portales inmobiliarios con arquitectura escalable, optimización SEO, integración con APIs externas y panel de administración completo.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles Nativas',
            description:
              'Aplicaciones móviles iOS y Android con experiencia fluida, notificaciones push, geolocalización y sincronización en tiempo real para agentes y clientes.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos y Business Intelligence',
            description:
              'Dashboards ejecutivos con análisis de datos en tiempo real, reportes de rendimiento, métricas de conversión y business intelligence para tomar decisiones informadas.',
            icon: '📊',
          },
          {
            title: 'Tiendas en Línea y E-commerce',
            description:
              'Plataformas de e-commerce para venta de servicios inmobiliarios, membresías premium, paquetes de asesoría y productos relacionados con tu inmobiliaria.',
            icon: '🛒',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada: auditoría de sistemas actuales, arquitectura de soluciones, migración de datos y estrategia de transformación digital.',
            icon: '💡',
          },
        ],
      },
      cta: {
        title: '¿Listo para modernizar tu inmobiliaria?',
        description:
          'Agenda una consultoría tecnológica sin costo. Analizamos tu operación actual con análisis de datos y diseñamos una solución integral que puede incluir páginas web, aplicaciones móviles, tiendas en línea y sistemas personalizados que impulsen tus ventas.',
        buttonText: 'Agendar Consultoría Gratuita',
      },
    },

    'software-para-constructoras': {
      seoTitle: 'Software para Constructoras en Guadalajara | Sistemas de Gestión - imSoft',
      seoDescription:
        'Plataformas digitales para constructoras en Guadalajara. Gestión de proyectos, control de obra, ERP especializado y apps móviles para construcción.',
      h1: 'Sistemas de Gestión para Constructoras en Guadalajara',
      heroSubtitle:
        'Digitalizamos la operación de constructoras con páginas web corporativas, aplicaciones móviles para campo, análisis de datos en tiempo real, sistemas ERP especializados y consultoría tecnológica que reducen costos y aumentan la productividad.',
      problems: {
        title: 'Desafíos comunes en la industria de la construcción',
        items: [
          'Control manual de múltiples obras simultáneas con información fragmentada',
          'Dificultad para rastrear materiales, presupuestos y avances en tiempo real',
          'Comunicación deficiente entre oficina, supervisores y personal en campo',
          'Reportes de avance tardíos o incompletos para clientes e inversionistas sin análisis de datos que permitan tomar decisiones estratégicas',
          'Falta de trazabilidad en compras, inventarios y logística de materiales',
          'Procesos manuales que generan errores y retrasos costosos',
        ],
      },
      solutions: {
        title: 'Tecnología que optimiza tu operación constructora',
        items: [
          {
            title: 'ERP para Construcción',
            description:
              'Sistema integral que conecta proyectos, finanzas, compras, inventarios, RH y control de obra en una sola plataforma centralizada.',
          },
          {
            title: 'Control de Obra Digital',
            description:
              'Bitácora electrónica, checklist de avances, registro fotográfico geolocalizado, reportes automáticos y alertas de desviaciones.',
          },
          {
            title: 'Portal para Clientes',
            description:
              'Plataforma web donde clientes e inversionistas consultan avances, fotografías, presupuestos ejecutados y cronogramas actualizados.',
          },
          {
            title: 'App Móvil para Campo',
            description:
              'Aplicación para supervisores y contratistas: reportar avances, registrar incidencias, aprobar entregas y comunicación instantánea.',
          },
        ],
      },
      imSoftServices: {
        title: 'Desarrollo de software para constructoras',
        description:
          'Creamos soluciones empresariales que integran toda la cadena de valor de la construcción, desde la planeación hasta la entrega final. Ofrecemos páginas web corporativas, aplicaciones móviles, análisis de datos, tiendas en línea para materiales y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web y Portales Corporativos',
            description:
              'Páginas web modernas y portales para clientes con arquitectura escalable, optimización SEO, integración con sistemas ERP y dashboards en tiempo real.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles para Campo',
            description:
              'Aplicaciones móviles nativas iOS y Android que funcionan offline, sincronización automática, captura de fotos, geolocalización y firma digital.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos y Business Intelligence',
            description:
              'Análisis de datos en tiempo real, dashboards ejecutivos, reportes de avance, métricas de productividad y business intelligence para optimizar proyectos.',
            icon: '📊',
          },
          {
            title: 'Tiendas en Línea para Materiales',
            description:
              'Plataformas de e-commerce para venta de materiales de construcción, gestión de inventarios, pedidos en línea y facturación electrónica integrada.',
            icon: '🛒',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada: auditoría de sistemas, arquitectura de soluciones, migración de datos y estrategia de transformación digital.',
            icon: '💡',
          },
        ],
      },
      cta: {
        title: 'Moderniza la gestión de tu constructora',
        description:
          'Conversemos sobre cómo nuestras soluciones tecnológicas - páginas web, aplicaciones móviles, análisis de datos y consultoría - pueden reducir costos operativos y mejorar el control de tus proyectos de construcción.',
        buttonText: 'Solicitar Demo Personalizada',
      },
    },

    'software-para-restaurantes': {
      seoTitle: 'Software para Restaurantes en Guadalajara | Sistemas POS y Pedidos - imSoft',
      seoDescription:
        'Soluciones digitales para restaurantes en Guadalajara. Sistemas POS, apps de pedidos, gestión de cocina e integraciones con delivery.',
      h1: 'Plataformas Digitales para Restaurantes en Guadalajara',
      heroSubtitle:
        'Impulsamos restaurantes y cadenas gastronómicas con páginas web modernas, aplicaciones móviles para pedidos, tiendas en línea, análisis de datos de ventas y consultoría tecnológica que aumentan ventas y eficiencia operativa.',
      problems: {
        title: 'Retos de la industria restaurantera',
        items: [
          'Sistemas POS obsoletos o de terceros con altas comisiones',
          'Falta de integración entre punto de venta, cocina y delivery',
          'Dificultad para gestionar múltiples sucursales desde un solo lugar',
          'Pedidos en línea dispersos entre varias plataformas externas sin una tienda en línea propia ni análisis de datos de comportamiento del cliente',
          'Control manual de inventarios y mermas que genera pérdidas',
          'Ausencia de programas de lealtad o promociones automatizadas',
        ],
      },
      solutions: {
        title: 'Tecnología que impulsa tu restaurante',
        items: [
          {
            title: 'Sistema POS Personalizado',
            description:
              'Punto de venta moderno con comandas digitales, división de cuentas, propinas, reportes de ventas y gestión de turnos del personal.',
          },
          {
            title: 'App de Pedidos Propia',
            description:
              'Aplicación móvil con tu marca para pedidos a domicilio y recolección en sucursal. Sin comisiones de terceros, pagos integrados.',
          },
          {
            title: 'Gestión de Cocina Digital',
            description:
              'Pantallas KDS (Kitchen Display System) que sincronizan pedidos de salón, delivery y apps en tiempo real para tu equipo de cocina.',
          },
          {
            title: 'Panel de Administración Centralizado',
            description:
              'Dashboard con ventas en tiempo real, control de inventarios, análisis de platillos más vendidos y gestión multilocación.',
          },
        ],
      },
      imSoftServices: {
        title: 'Desarrollo de software para restaurantes',
        description:
          'Construimos ecosistemas digitales completos que conectan todos los puntos de contacto con tus clientes y optimizan tu operación. Ofrecemos páginas web modernas, aplicaciones móviles, tiendas en línea, análisis de datos y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web y Tiendas en Línea',
            description:
              'Páginas web modernas y tiendas en línea para pedidos a domicilio con diseño responsive, optimización SEO, integración con sistemas POS y pasarelas de pago.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles de Pedidos',
            description:
              'Aplicaciones móviles nativas iOS y Android con tu identidad de marca, notificaciones push, programa de puntos, geolocalización y pasarelas de pago integradas.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos y Business Intelligence',
            description:
              'Análisis de datos en tiempo real, dashboards con métricas de ventas, análisis de platillos más vendidos, comportamiento de clientes y reportes ejecutivos.',
            icon: '📊',
          },
          {
            title: 'Sistemas POS y Gestión',
            description:
              'Plataformas web responsivas para tablets y terminales, integración con impresoras térmicas, lectores de tarjetas, control de inventarios y gestión multilocación.',
            icon: '🍽️',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada: auditoría de sistemas actuales, estrategia de transformación digital, integraciones empresariales y optimización de procesos.',
            icon: '💡',
          },
        ],
      },
      cta: {
        title: 'Lleva tu restaurante al siguiente nivel',
        description:
          'Platiquemos sobre cómo nuestras soluciones - páginas web, aplicaciones móviles, tiendas en línea, análisis de datos y consultoría tecnológica - pueden reducir dependencia de plataformas externas y aumentar tus ventas directas con tecnología propia.',
        buttonText: 'Agendar Consultoría',
      },
    },

    'software-para-clinicas': {
      seoTitle: 'Software para Clínicas en Guadalajara | Sistemas Médicos - imSoft',
      seoDescription:
        'Sistemas de gestión para clínicas y consultorios en Guadalajara. Expediente electrónico, agendamiento, facturación y telemedicina.',
      h1: 'Software Médico para Clínicas en Guadalajara',
      heroSubtitle:
        'Digitalizamos clínicas y consultorios médicos con páginas web corporativas, aplicaciones móviles para pacientes, análisis de datos médicos, expediente electrónico y consultoría tecnológica que mejoran la atención al paciente.',
      problems: {
        title: 'Desafíos de clínicas y consultorios médicos',
        items: [
          'Expedientes en papel difíciles de consultar y susceptibles a pérdida',
          'Agendamiento de citas manual con conflictos y confirmaciones tardías',
          'Falta de trazabilidad en tratamientos, estudios y seguimiento de pacientes sin análisis de datos que permitan optimizar la atención',
          'Facturación lenta que retrasa el ciclo de cobro con aseguradoras',
          'Imposibilidad de ofrecer consultas a distancia o telemedicina',
          'Comunicación deficiente con pacientes sobre resultados y recordatorios',
        ],
      },
      solutions: {
        title: 'Soluciones digitales para el sector salud',
        items: [
          {
            title: 'Expediente Clínico Electrónico',
            description:
              'Sistema HIPAA compliant con historia clínica, recetas, estudios de laboratorio, imagenología y trazabilidad completa del paciente.',
          },
          {
            title: 'Sistema de Agendamiento Inteligente',
            description:
              'Plataforma web y móvil para agendar citas, envío automático de recordatorios por SMS/email, confirmación y reagendamiento.',
          },
          {
            title: 'Plataforma de Telemedicina',
            description:
              'Videoconsultas seguras, sala de espera virtual, prescripción electrónica y pagos en línea integrados.',
          },
          {
            title: 'Facturación y Administración',
            description:
              'Módulo de facturación CFDI 4.0, integración con aseguradoras, control de pagos, caja y reportes financieros.',
          },
        ],
      },
      imSoftServices: {
        title: 'Tecnología especializada para salud',
        description:
          'Desarrollamos soluciones médicas que cumplen con estándares de seguridad, privacidad y normativas del sector salud. Ofrecemos páginas web corporativas, aplicaciones móviles, análisis de datos médicos y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web Corporativas',
            description:
              'Páginas web modernas para clínicas con arquitectura segura, optimización SEO, información de servicios, agendamiento en línea y cumplimiento de normativas.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles para Pacientes',
            description:
              'Aplicaciones móviles nativas iOS y Android para agendar citas, consultar resultados, videoconsultas, recordatorios y comunicación directa con médicos.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos Médicos',
            description:
              'Análisis de datos en tiempo real, dashboards con métricas de atención, reportes de eficiencia, análisis de tratamientos y business intelligence para clínicas.',
            icon: '📊',
          },
          {
            title: 'Sistemas Médicos a la Medida',
            description:
              'Plataformas web con arquitectura segura, encriptación de datos, respaldo automático, expediente electrónico y cumplimiento HIPAA.',
            icon: '⚕️',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada en salud: auditoría de sistemas, cumplimiento normativo, migración de datos y estrategia de transformación digital.',
            icon: '💡',
          },
          {
            title: 'Migración y Capacitación',
            description:
              'Transferencia de expedientes físicos a digital, capacitación al personal médico y soporte técnico especializado.',
            icon: '🎓',
          },
        ],
      },
      cta: {
        title: 'Digitaliza tu clínica o consultorio',
        description:
          'Agenda una reunión para conocer cómo nuestras soluciones tecnológicas - páginas web corporativas, aplicaciones móviles, análisis de datos médicos y consultoría tecnológica - pueden mejorar la atención al paciente y la eficiencia de tu clínica.',
        buttonText: 'Contactar a un Especialista',
      },
    },

    'software-para-logistica': {
      seoTitle: 'Software para Logística en Guadalajara | Sistemas TMS y Rastreo - imSoft',
      seoDescription:
        'Plataformas de gestión logística en Guadalajara. TMS, rastreo GPS, gestión de flotas, almacenes y distribución para empresas.',
      h1: 'Sistemas de Gestión Logística en Guadalajara',
      heroSubtitle:
        'Optimizamos operaciones logísticas con páginas web corporativas, aplicaciones móviles para operadores, análisis de datos en tiempo real, plataformas TMS y consultoría tecnológica que reducen costos y mejoran tiempos de entrega.',
      problems: {
        title: 'Retos en la industria logística',
        items: [
          'Falta de visibilidad en tiempo real de la ubicación de unidades y mercancía',
          'Rutas de entrega no optimizadas que incrementan costos de combustible',
          'Gestión manual de almacenes con errores en inventarios y picking',
          'Comunicación deficiente entre almacén, distribución y clientes finales',
          'Dificultad para escalar operaciones o agregar nuevas rutas',
          'Reportes tardíos que impiden toma de decisiones ágil sin análisis de datos que permitan optimizar rutas y operaciones',
        ],
      },
      solutions: {
        title: 'Tecnología que transforma tu operación logística',
        items: [
          {
            title: 'TMS - Sistema de Gestión de Transporte',
            description:
              'Plataforma integral para planear rutas, asignar unidades, rastrear envíos en tiempo real y generar documentación de embarques.',
          },
          {
            title: 'Rastreo GPS y Telemetría',
            description:
              'Integración con dispositivos GPS para monitoreo en tiempo real, geovallas, alertas de desviación y análisis de comportamiento de operadores.',
          },
          {
            title: 'WMS - Gestión de Almacenes',
            description:
              'Control de inventarios en tiempo real, picking optimizado, códigos de barras/RFID, entradas y salidas automatizadas.',
          },
          {
            title: 'Portal para Clientes',
            description:
              'Plataforma web donde clientes consultan estatus de envíos, rastrean en mapa en tiempo real y descargan documentación.',
          },
        ],
      },
      imSoftServices: {
        title: 'Soluciones tecnológicas para logística',
        description:
          'Creamos ecosistemas digitales que conectan almacenes, transporte, operadores y clientes en una sola plataforma centralizada. Ofrecemos páginas web corporativas, aplicaciones móviles, análisis de datos, tiendas en línea para servicios y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web y Portales Corporativos',
            description:
              'Páginas web modernas y portales para clientes con arquitectura escalable, optimización SEO, rastreo en tiempo real, dashboards y gestión de documentación.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles para Operadores',
            description:
              'Aplicaciones móviles nativas iOS y Android para operadores de campo, rastreo GPS, captura de firmas, fotos de entrega y sincronización en tiempo real.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos y Business Intelligence',
            description:
              'Análisis de datos en tiempo real, dashboards ejecutivos, métricas de eficiencia, optimización de rutas, análisis de costos y business intelligence.',
            icon: '📊',
          },
          {
            title: 'Plataformas TMS/WMS',
            description:
              'Sistemas web robustos con arquitectura escalable, APIs para integraciones externas y dashboards ejecutivos con KPIs logísticos.',
            icon: '🚚',
          },
          {
            title: 'Aplicaciones Móviles para Operadores',
            description:
              'Aplicaciones móviles nativas iOS y Android para choferes y personal de almacén con modo offline, captura de evidencias, geolocalización y firma digital.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos y Business Intelligence',
            description:
              'Análisis de datos en tiempo real, reportes avanzados, análisis predictivo de rutas, optimización de costos, visualización de datos logísticos y business intelligence.',
            icon: '📊',
          },
          {
            title: 'Tiendas en Línea para Servicios',
            description:
              'Plataformas de e-commerce para venta de servicios logísticos, cotización en línea, seguimiento de envíos y facturación electrónica integrada.',
            icon: '🛒',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada: auditoría de sistemas logísticos, arquitectura de soluciones, integraciones empresariales y estrategia de transformación digital.',
            icon: '💡',
          },
        ],
      },
      cta: {
        title: 'Optimiza tu operación logística',
        description:
          'Conversemos sobre cómo nuestras soluciones tecnológicas - páginas web corporativas, aplicaciones móviles, análisis de datos, tiendas en línea y consultoría - pueden reducir costos operativos y mejorar tiempos de entrega con tecnología especializada en logística.',
        buttonText: 'Solicitar Análisis de Operación',
      },
    },
  },

  cdmx: {
    'software-para-inmobiliarias': {
      seoTitle: 'Software para Inmobiliarias en CDMX | Desarrollo a la Medida - imSoft',
      seoDescription:
        'Desarrollamos plataformas digitales para inmobiliarias en Ciudad de México. Sistemas de gestión de propiedades, portales web y apps móviles.',
      h1: 'Software Especializado para Inmobiliarias en CDMX',
      heroSubtitle:
        'Transformamos la gestión inmobiliaria en la Ciudad de México con páginas web modernas, aplicaciones móviles nativas, análisis de datos en tiempo real y consultoría tecnológica especializada que impulsan ventas y optimizan la operación de tu empresa.',
      problems: {
        title: '¿Tu inmobiliaria enfrenta estos desafíos?',
        items: [
          'Gestión manual de propiedades en colonias y alcaldías dispersas de CDMX',
          'Falta de visibilidad en tiempo real del inventario disponible',
          'Páginas web que no destacan en el competitivo mercado inmobiliario de la capital ni generan leads de calidad',
          'Dificultad para gestionar propiedades en renta y venta simultáneamente',
          'Seguimiento deficiente a prospectos en zonas premium como Polanco, Santa Fe, Roma',
          'Incapacidad de integrar con portales externos y sistemas de valuación',
        ],
      },
      solutions: {
        title: 'Soluciones tecnológicas para el mercado inmobiliario de CDMX',
        items: [
          {
            title: 'Portal Inmobiliario Avanzado',
            description:
              'Plataforma web con búsqueda por alcaldía, colonia, tipo de propiedad. Mapas interactivos con transporte público, amenidades y zonas de interés.',
          },
          {
            title: 'CRM Inmobiliario Empresarial',
            description:
              'Sistema completo para gestionar propiedades, clientes, contratos de renta/venta, documentación legal y seguimiento comercial.',
          },
          {
            title: 'App Móvil para Agentes y Clientes',
            description:
              'Aplicación iOS/Android para agentes en campo y clientes que buscan propiedades. Notificaciones de nuevas publicaciones y alertas de visitas.',
          },
          {
            title: 'Valuación Automatizada',
            description:
              'Integración con bases de datos de mercado inmobiliario para valuación de propiedades basada en ubicación, características y tendencias.',
          },
        ],
      },
      imSoftServices: {
        title: 'Tecnología empresarial para inmobiliarias en CDMX',
        description:
          'Desarrollamos soluciones digitales robustas para empresas inmobiliarias que operan en el competitivo mercado de la Ciudad de México. Ofrecemos páginas web modernas, aplicaciones móviles, análisis de datos, tiendas en línea y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web y Plataformas Personalizadas',
            description:
              'Páginas web modernas y portales inmobiliarios con arquitectura escalable, optimización SEO local, integración con APIs de geolocalización y panel administrativo completo.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles Nativas',
            description:
              'Aplicaciones móviles iOS y Android con experiencia premium, notificaciones push inteligentes, realidad aumentada, geolocalización y sincronización en tiempo real.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos y Business Intelligence',
            description:
              'Análisis de datos en tiempo real, dashboards ejecutivos con métricas de conversión, análisis de mercado inmobiliario y business intelligence para toma de decisiones.',
            icon: '📊',
          },
          {
            title: 'Tiendas en Línea y E-commerce',
            description:
              'Plataformas de e-commerce para venta de servicios inmobiliarios, membresías premium, paquetes de asesoría y productos relacionados con tu inmobiliaria.',
            icon: '🛒',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada: auditoría de sistemas, arquitectura de soluciones, migración de datos históricos y estrategia de transformación digital.',
            icon: '💡',
          },
        ],
      },
      cta: {
        title: '¿Listo para modernizar tu inmobiliaria en CDMX?',
        description:
          'Agenda una consultoría tecnológica sin costo. Analizamos tu operación actual con análisis de datos y diseñamos una solución integral que puede incluir páginas web, aplicaciones móviles, tiendas en línea y sistemas personalizados que impulsen tus ventas en la capital.',
        buttonText: 'Agendar Consultoría Gratuita',
      },
    },

    'software-para-constructoras': {
      seoTitle: 'Software para Constructoras en CDMX | Sistemas de Gestión ERP - imSoft',
      seoDescription:
        'Plataformas digitales para constructoras en Ciudad de México. Gestión de proyectos, control de obra, ERP especializado y apps móviles.',
      h1: 'Sistemas de Gestión para Constructoras en CDMX',
      heroSubtitle:
        'Digitalizamos la operación de constructoras en la Ciudad de México con páginas web corporativas, aplicaciones móviles para campo, análisis de datos en tiempo real, sistemas ERP especializados y consultoría tecnológica que reducen costos.',
      problems: {
        title: 'Desafíos de constructoras en la capital',
        items: [
          'Gestión de múltiples obras simultáneas en diferentes alcaldías de CDMX',
          'Cumplimiento de normativa urbana y permisos de construcción locales',
          'Coordinación compleja entre oficina, supervisores y personal en campo',
          'Reportes de avance para desarrolladores e inversionistas institucionales',
          'Control de presupuestos en proyectos de gran envergadura',
          'Integración con proveedores y subcontratistas especializados',
        ],
      },
      solutions: {
        title: 'Tecnología para constructoras empresariales',
        items: [
          {
            title: 'ERP para Construcción Empresarial',
            description:
              'Sistema integral que conecta proyectos, finanzas corporativas, compras, RH, control de obra y cumplimiento normativo en una plataforma centralizada.',
          },
          {
            title: 'Control de Obra Digital',
            description:
              'Bitácora electrónica con firma digital, checklist de avances por fase, registro fotográfico con geolocalización y reportes ejecutivos.',
          },
          {
            title: 'Portal Corporativo para Inversionistas',
            description:
              'Plataforma web donde inversionistas y desarrolladores consultan avances financieros, cronogramas, presupuestos ejecutados y documentación.',
          },
          {
            title: 'App Móvil Empresarial',
            description:
              'Aplicación para supervisores, contratistas y directivos: aprobaciones digitales, reportes en tiempo real y comunicación instantánea.',
          },
        ],
      },
      imSoftServices: {
        title: 'Desarrollo de software para constructoras en CDMX',
        description:
          'Creamos soluciones empresariales que integran toda la cadena de valor de la construcción, desde la planeación hasta la entrega de proyectos complejos. Ofrecemos páginas web corporativas, aplicaciones móviles, análisis de datos, tiendas en línea para materiales y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web y Portales Corporativos',
            description:
              'Páginas web modernas y portales para clientes con arquitectura escalable, optimización SEO, integración con sistemas ERP y dashboards en tiempo real.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles para Campo',
            description:
              'Aplicaciones móviles nativas iOS y Android que funcionan offline, sincronización automática, captura de fotos, geolocalización y firma digital certificada.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos y Business Intelligence',
            description:
              'Análisis de datos en tiempo real, dashboards ejecutivos, reportes de avance, métricas de productividad, business intelligence y optimización de proyectos.',
            icon: '📊',
          },
          {
            title: 'Sistemas ERP Especializados',
            description:
              'Arquitectura empresarial modular, integración con sistemas contables corporativos, business intelligence y reportes regulatorios.',
            icon: '🏗️',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada: auditoría de sistemas, arquitectura de soluciones, migración de datos y estrategia de transformación digital.',
            icon: '💡',
          },
        ],
      },
      cta: {
        title: 'Moderniza la gestión de tu constructora en CDMX',
        description:
          'Conversemos sobre cómo nuestras soluciones tecnológicas - páginas web, aplicaciones móviles, análisis de datos y consultoría - pueden reducir costos operativos y mejorar el control de tus proyectos de construcción en la capital.',
        buttonText: 'Solicitar Demo Personalizada',
      },
    },

    'software-para-restaurantes': {
      seoTitle: 'Software para Restaurantes en CDMX | Sistemas POS y Apps - imSoft',
      seoDescription:
        'Soluciones digitales para restaurantes en Ciudad de México. Sistemas POS, apps de pedidos, gestión de cocina y múltiples sucursales.',
      h1: 'Plataformas Digitales para Restaurantes en CDMX',
      heroSubtitle:
        'Impulsamos restaurantes y cadenas gastronómicas en la Ciudad de México con páginas web modernas, aplicaciones móviles para pedidos, tiendas en línea, análisis de datos de ventas y consultoría tecnológica que aumentan ventas y eficiencia.',
      problems: {
        title: 'Retos de restaurantes en la capital',
        items: [
          'Altas comisiones de plataformas de delivery que reducen márgenes',
          'Gestión compleja de múltiples sucursales en diferentes colonias',
          'Competencia intensa en zonas premium como Condesa, Polanco, Santa Fe',
          'Falta de control centralizado de inventarios y mermas',
          'Dificultad para fidelizar clientes sin depender de terceros',
          'Ausencia de análisis de ventas por sucursal, horario y tipo de cliente',
        ],
      },
      solutions: {
        title: 'Tecnología que impulsa cadenas restauranteras',
        items: [
          {
            title: 'Sistema POS Multilocación',
            description:
              'Punto de venta centralizado para gestionar todas tus sucursales. Reportes consolidados, control de inventarios y sincronización en tiempo real.',
          },
          {
            title: 'App de Pedidos con Tu Marca',
            description:
              'Aplicación móvil propia para pedidos a domicilio y recolección. Sin comisiones de terceros, programa de lealtad integrado y pagos directos.',
          },
          {
            title: 'Gestión de Cocina y Delivery',
            description:
              'Pantallas KDS para cocina, sistema de asignación de repartidores, rastreo GPS de entregas y análisis de tiempos de servicio.',
          },
          {
            title: 'Business Intelligence Gastronómico',
            description:
              'Dashboards ejecutivos con ventas por sucursal, análisis de platillos, comportamiento de clientes y proyecciones de demanda.',
          },
        ],
      },
      imSoftServices: {
        title: 'Desarrollo de software para restaurantes en CDMX',
        description:
          'Construimos ecosistemas digitales completos para cadenas restauranteras que buscan independencia tecnológica y crecimiento escalable. Ofrecemos páginas web modernas, aplicaciones móviles, tiendas en línea, análisis de datos y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web y Tiendas en Línea',
            description:
              'Páginas web modernas y tiendas en línea para pedidos a domicilio con diseño responsive, optimización SEO, integración con sistemas POS y pasarelas de pago.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles de Pedidos',
            description:
              'Aplicaciones móviles nativas iOS y Android con tu marca, notificaciones push, programa de puntos, geolocalización, cupones y pasarelas de pago mexicanas.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos y Business Intelligence',
            description:
              'Análisis de datos en tiempo real, dashboards con métricas de ventas, análisis de platillos más vendidos, comportamiento de clientes y reportes ejecutivos.',
            icon: '📊',
          },
          {
            title: 'Sistemas POS y Gestión',
            description:
              'Plataformas web responsivas para tablets y terminales, integración con hardware especializado, facturación electrónica CFDI 4.0 y gestión multilocación.',
            icon: '🍽️',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada: auditoría de sistemas actuales, estrategia de transformación digital, integraciones empresariales y optimización de procesos.',
            icon: '💡',
          },
        ],
      },
      cta: {
        title: 'Lleva tu restaurante al siguiente nivel en CDMX',
        description:
          'Platiquemos sobre cómo nuestras soluciones - páginas web, aplicaciones móviles, tiendas en línea, análisis de datos y consultoría tecnológica - pueden reducir dependencia de plataformas externas y aumentar tus ventas directas con tecnología propia.',
        buttonText: 'Agendar Consultoría',
      },
    },

    'software-para-clinicas': {
      seoTitle: 'Software para Clínicas en CDMX | Sistemas Médicos - imSoft',
      seoDescription:
        'Sistemas de gestión para clínicas en Ciudad de México. Expediente electrónico, agendamiento, facturación, telemedicina y NOM-024.',
      h1: 'Software Médico para Clínicas en CDMX',
      heroSubtitle:
        'Digitalizamos clínicas y consultorios médicos en la Ciudad de México con páginas web corporativas, aplicaciones móviles para pacientes, análisis de datos médicos, expediente electrónico NOM-024 y consultoría tecnológica que mejoran la atención al paciente.',
      problems: {
        title: 'Desafíos de clínicas en la capital',
        items: [
          'Cumplimiento de NOM-024 para expediente clínico electrónico',
          'Gestión de múltiples consultorios o sucursales en diferentes zonas',
          'Integración con laboratorios, estudios de imagen y farmacias',
          'Facturación a aseguradoras y gastos médicos mayores',
          'Falta de plataforma para ofrecer telemedicina de forma profesional',
          'Reportes para certificaciones de calidad médica (ISO, CANACEM)',
        ],
      },
      solutions: {
        title: 'Soluciones digitales para el sector salud en CDMX',
        items: [
          {
            title: 'Expediente Clínico NOM-024',
            description:
              'Sistema que cumple con la normativa mexicana NOM-024 para expediente electrónico. Historia clínica, prescripción, estudios y trazabilidad completa.',
          },
          {
            title: 'Sistema de Agendamiento Empresarial',
            description:
              'Plataforma web y móvil para múltiples sucursales. Agenda por médico, especialidad, sucursal. Recordatorios automáticos y confirmación de citas.',
          },
          {
            title: 'Plataforma de Telemedicina Profesional',
            description:
              'Videoconsultas seguras con sala de espera virtual, historia clínica integrada, prescripción electrónica y pagos en línea.',
          },
          {
            title: 'Facturación y Administración',
            description:
              'Módulo de facturación CFDI 4.0, integración con aseguradoras (GNP, AXA, Metlife), control de caja y reportes financieros.',
          },
        ],
      },
      imSoftServices: {
        title: 'Tecnología especializada para salud en CDMX',
        description:
          'Desarrollamos soluciones médicas que cumplen con normativas mexicanas, estándares de seguridad y privacidad del sector salud. Ofrecemos páginas web corporativas, aplicaciones móviles, análisis de datos médicos y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web Corporativas',
            description:
              'Páginas web modernas para clínicas con arquitectura segura, optimización SEO, información de servicios, agendamiento en línea y cumplimiento de normativas.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles para Pacientes',
            description:
              'Aplicaciones móviles nativas iOS y Android para agendar citas, consultar resultados, videoconsultas, recordatorios y comunicación directa con médicos.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos Médicos',
            description:
              'Análisis de datos en tiempo real, dashboards con métricas de atención, reportes de eficiencia, análisis de tratamientos y business intelligence para clínicas.',
            icon: '📊',
          },
          {
            title: 'Sistemas Médicos Certificados',
            description:
              'Plataformas web con arquitectura segura, encriptación de datos médicos, respaldo automático y cumplimiento NOM-024/HIPAA.',
            icon: '⚕️',
          },
          {
            title: 'Apps para Pacientes',
            description:
              'Aplicaciones móviles para agendar citas, consultar resultados de estudios, videoconsultas y comunicación segura con médicos.',
            icon: '📱',
          },
          {
            title: 'Sistemas Médicos a la Medida',
            description:
              'Plataformas web con arquitectura segura, encriptación de datos médicos, respaldo automático, expediente electrónico y cumplimiento NOM-024/HIPAA.',
            icon: '⚕️',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada en salud: auditoría de sistemas, cumplimiento normativo, migración de datos y estrategia de transformación digital.',
            icon: '💡',
          },
        ],
      },
      cta: {
        title: 'Digitaliza tu clínica en CDMX',
        description:
          'Agenda una reunión para conocer cómo nuestras soluciones tecnológicas - páginas web corporativas, aplicaciones móviles, análisis de datos médicos y consultoría tecnológica - pueden mejorar la atención al paciente y cumplir con normativas de salud.',
        buttonText: 'Contactar a un Especialista',
      },
    },

    'software-para-logistica': {
      seoTitle: 'Software para Logística en CDMX | Sistemas TMS y Rastreo - imSoft',
      seoDescription:
        'Plataformas de gestión logística en Ciudad de México. TMS, rastreo GPS, gestión de flotas, almacenes y distribución urbana.',
      h1: 'Sistemas de Gestión Logística en CDMX',
      heroSubtitle:
        'Optimizamos operaciones logísticas en la Ciudad de México con páginas web corporativas, aplicaciones móviles para operadores, análisis de datos en tiempo real, plataformas TMS y consultoría tecnológica que reducen costos y mejoran tiempos de entrega.',
      problems: {
        title: 'Retos logísticos en la capital',
        items: [
          'Distribución urbana compleja con tráfico intenso y restricciones de circulación',
          'Gestión de flotas grandes con múltiples rutas y horarios de entrega',
          'Falta de visibilidad en tiempo real de mercancía en tránsito',
          'Cumplimiento de horarios de entrega en zonas con Hoy No Circula',
          'Coordinación entre almacenes, centro de distribución y puntos de entrega',
          'Altos costos operativos por rutas no optimizadas y tiempos muertos',
        ],
      },
      solutions: {
        title: 'Tecnología logística para la capital',
        items: [
          {
            title: 'TMS - Sistema de Gestión de Transporte',
            description:
              'Plataforma integral para planear rutas optimizadas, asignar unidades considerando restricciones de circulación, rastreo GPS y documentación.',
          },
          {
            title: 'Optimización de Rutas Urbanas',
            description:
              'Algoritmos inteligentes que consideran tráfico en tiempo real, restricciones de circulación, ventanas de entrega y prioridades de clientes.',
          },
          {
            title: 'WMS - Gestión de Almacenes',
            description:
              'Control de inventarios multilocación, picking optimizado, códigos de barras/RFID, cross-docking y trazabilidad completa de mercancía.',
          },
          {
            title: 'Portal para Clientes Empresariales',
            description:
              'Plataforma web donde clientes consultan estatus de envíos, rastrean en tiempo real, programan entregas y descargan documentación de embarque.',
          },
        ],
      },
      imSoftServices: {
        title: 'Soluciones tecnológicas para logística en CDMX',
        description:
          'Creamos ecosistemas digitales que conectan almacenes, transporte, operadores y clientes para operaciones logísticas eficientes en la capital. Ofrecemos páginas web corporativas, aplicaciones móviles, análisis de datos, tiendas en línea para servicios y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web y Portales Corporativos',
            description:
              'Páginas web modernas y portales para clientes con arquitectura escalable, optimización SEO, rastreo en tiempo real, dashboards y gestión de documentación.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles para Operadores',
            description:
              'Aplicaciones móviles nativas iOS y Android para choferes con navegación GPS, modo offline, captura de evidencias fotográficas, geolocalización y firma digital de entregas.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos y Business Intelligence',
            description:
              'Análisis de datos en tiempo real, reportes avanzados, análisis predictivo de demanda, optimización de costos, visualización de datos logísticos y business intelligence.',
            icon: '📊',
          },
          {
            title: 'Plataformas TMS/WMS Empresariales',
            description:
              'Sistemas web robustos con arquitectura escalable, APIs RESTful para integraciones, dashboards ejecutivos con KPIs logísticos en tiempo real.',
            icon: '🚚',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada: auditoría de sistemas logísticos, arquitectura de soluciones, integraciones empresariales y estrategia de transformación digital.',
            icon: '💡',
          },
        ],
      },
      cta: {
        title: 'Optimiza tu operación logística en CDMX',
        description:
          'Conversemos sobre cómo nuestras soluciones tecnológicas - páginas web corporativas, aplicaciones móviles, análisis de datos, tiendas en línea y consultoría - pueden reducir costos operativos y mejorar tiempos de entrega en la Ciudad de México con tecnología especializada.',
        buttonText: 'Solicitar Análisis de Operación',
      },
    },
  },

  monterrey: {
    'software-para-inmobiliarias': {
      seoTitle: 'Software para Inmobiliarias en Monterrey | Desarrollo a la Medida - imSoft',
      seoDescription:
        'Desarrollamos plataformas digitales para inmobiliarias en Monterrey. Sistemas de gestión de propiedades, portales web y apps móviles para empresas.',
      h1: 'Software Especializado para Inmobiliarias en Monterrey',
      heroSubtitle:
        'Transformamos la gestión inmobiliaria en Monterrey y el área metropolitana con páginas web modernas, aplicaciones móviles nativas, análisis de datos en tiempo real y consultoría tecnológica especializada que impulsan ventas y optimizan la operación empresarial.',
      problems: {
        title: '¿Tu inmobiliaria enfrenta estos desafíos?',
        items: [
          'Gestión de propiedades en San Pedro, Santa Catarina, Escobedo y otros municipios',
          'Páginas web que no compiten en el mercado inmobiliario industrial y corporativo ni generan leads de calidad',
          'Falta de integración con desarrolladoras y constructoras de la región',
          'Dificultad para gestionar propiedades industriales, corporativas y residenciales',
          'Seguimiento deficiente a clientes empresariales e inversionistas',
          'Ausencia de herramientas para valuar propiedades en zonas de alto crecimiento',
        ],
      },
      solutions: {
        title: 'Soluciones tecnológicas para el mercado inmobiliario regiomontano',
        items: [
          {
            title: 'Portal Inmobiliario Corporativo',
            description:
              'Plataforma web con búsqueda avanzada por municipio, tipo de propiedad (industrial, corporativa, residencial). Mapas con zonas industriales y corporativas.',
          },
          {
            title: 'CRM Inmobiliario Empresarial',
            description:
              'Sistema completo para gestionar propiedades, clientes corporativos, inversionistas, contratos y documentación legal de compraventa.',
          },
          {
            title: 'App Móvil para Agentes Corporativos',
            description:
              'Aplicación iOS/Android para agentes inmobiliarios con información completa de propiedades, tours virtuales y herramientas de cierre.',
          },
          {
            title: 'Integración con Desarrolladoras',
            description:
              'APIs para conectar con sistemas de desarrolladoras locales, importar propiedades nuevas, actualizar inventarios y sincronizar ventas.',
          },
        ],
      },
      imSoftServices: {
        title: 'Tecnología empresarial para inmobiliarias en Monterrey',
        description:
          'Desarrollamos soluciones digitales robustas para empresas inmobiliarias que operan en el dinámico mercado de Monterrey y el área metropolitana. Ofrecemos páginas web modernas, aplicaciones móviles, análisis de datos, tiendas en línea y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web y Plataformas Corporativas',
            description:
              'Páginas web modernas y portales inmobiliarios con arquitectura empresarial, optimización SEO, integración con sistemas de terceros y panel de administración avanzado.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles Empresariales',
            description:
              'Aplicaciones móviles iOS y Android con experiencia de usuario premium, notificaciones inteligentes, realidad aumentada, geolocalización y sincronización en tiempo real.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos y Business Intelligence',
            description:
              'Análisis de datos en tiempo real, dashboards ejecutivos con métricas de conversión, análisis de mercado inmobiliario y business intelligence para toma de decisiones.',
            icon: '📊',
          },
          {
            title: 'Tiendas en Línea y E-commerce',
            description:
              'Plataformas de e-commerce para venta de servicios inmobiliarios, membresías premium, paquetes de asesoría y productos relacionados con tu inmobiliaria.',
            icon: '🛒',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada: auditoría de sistemas, diseño de arquitectura de soluciones, migración de datos y estrategia de transformación digital empresarial.',
            icon: '💡',
          },
        ],
      },
      cta: {
        title: '¿Listo para modernizar tu inmobiliaria en Monterrey?',
        description:
          'Agenda una consultoría tecnológica sin costo. Analizamos tu operación actual con análisis de datos y diseñamos una solución integral que puede incluir páginas web, aplicaciones móviles, tiendas en línea y sistemas personalizados que impulsen tus ventas en el mercado regiomontano.',
        buttonText: 'Agendar Consultoría Gratuita',
      },
    },

    'software-para-constructoras': {
      seoTitle: 'Software para Constructoras en Monterrey | Sistemas ERP - imSoft',
      seoDescription:
        'Plataformas digitales para constructoras en Monterrey. Gestión de proyectos industriales, control de obra, ERP especializado y apps móviles.',
      h1: 'Sistemas de Gestión para Constructoras en Monterrey',
      heroSubtitle:
        'Digitalizamos la operación de constructoras en Monterrey con páginas web corporativas, aplicaciones móviles para campo, análisis de datos en tiempo real, sistemas ERP especializados y consultoría tecnológica para proyectos industriales y corporativos.',
      problems: {
        title: 'Desafíos de constructoras en el sector industrial',
        items: [
          'Gestión de proyectos industriales, corporativos y residenciales simultáneos',
          'Control de costos en proyectos de gran envergadura para empresas transnacionales',
          'Coordinación de múltiples subcontratistas especializados',
          'Reportes ejecutivos para desarrolladoras y clientes corporativos',
          'Cumplimiento de estándares de calidad internacionales',
          'Integración con sistemas de procurement y proveedores especializados',
        ],
      },
      solutions: {
        title: 'Tecnología para constructoras empresariales',
        items: [
          {
            title: 'ERP para Construcción Industrial',
            description:
              'Sistema integral que conecta proyectos, finanzas, compras, RH, control de obra y cumplimiento de estándares internacionales en una plataforma robusta.',
          },
          {
            title: 'Control de Obra Empresarial',
            description:
              'Bitácora electrónica con firma digital, control de calidad, checklist de avances, registro fotográfico de alta resolución y reportes ejecutivos.',
          },
          {
            title: 'Portal Corporativo para Clientes',
            description:
              'Plataforma web segura donde clientes corporativos consultan avances financieros, cronogramas, presupuestos ejecutados y documentación técnica.',
          },
          {
            title: 'App Móvil Empresarial',
            description:
              'Aplicación para supervisores, contratistas y directivos con aprobaciones digitales, reportes en tiempo real y comunicación segura.',
          },
        ],
      },
      imSoftServices: {
        title: 'Desarrollo de software para constructoras en Monterrey',
        description:
          'Creamos soluciones empresariales que integran toda la cadena de valor de la construcción industrial y corporativa. Ofrecemos páginas web corporativas, aplicaciones móviles, análisis de datos, tiendas en línea para materiales y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web y Portales Corporativos',
            description:
              'Páginas web modernas y portales para clientes con arquitectura escalable, optimización SEO, integración con sistemas ERP y dashboards en tiempo real.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles para Campo',
            description:
              'Aplicaciones móviles nativas iOS y Android con modo offline, sincronización automática, captura multimedia profesional, geolocalización y firma digital certificada.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos y Business Intelligence',
            description:
              'Análisis de datos en tiempo real, dashboards ejecutivos, reportes de avance, métricas de productividad, business intelligence y optimización de proyectos.',
            icon: '📊',
          },
          {
            title: 'Sistemas ERP Especializados',
            description:
              'Arquitectura empresarial modular, integración con ERP corporativos (SAP, Oracle), business intelligence y reportes para certificaciones.',
            icon: '🏗️',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada: auditoría de sistemas, arquitectura de soluciones, migración de datos y estrategia de transformación digital.',
            icon: '💡',
          },
        ],
      },
      cta: {
        title: 'Moderniza la gestión de tu constructora en Monterrey',
        description:
          'Conversemos sobre cómo nuestras soluciones tecnológicas - páginas web, aplicaciones móviles, análisis de datos y consultoría - pueden reducir costos operativos y mejorar el control de tus proyectos de construcción industrial.',
        buttonText: 'Solicitar Demo Personalizada',
      },
    },

    'software-para-restaurantes': {
      seoTitle: 'Software para Restaurantes en Monterrey | Sistemas POS - imSoft',
      seoDescription:
        'Soluciones digitales para restaurantes en Monterrey. Sistemas POS, apps de pedidos, gestión de cocina y múltiples sucursales para cadenas.',
      h1: 'Plataformas Digitales para Restaurantes en Monterrey',
      heroSubtitle:
        'Impulsamos restaurantes y cadenas gastronómicas en Monterrey con páginas web modernas, aplicaciones móviles para pedidos, tiendas en línea, análisis de datos de ventas y consultoría tecnológica que aumentan ventas y eficiencia operativa.',
      problems: {
        title: 'Retos de restaurantes en Monterrey',
        items: [
          'Altas comisiones de plataformas de delivery que afectan márgenes',
          'Gestión de múltiples sucursales en San Pedro, Valle, Cumbres y otras zonas',
          'Competencia intensa en el sector gastronómico de alta calidad',
          'Falta de herramientas para franquicias o modelos de expansión',
          'Dificultad para fidelizar clientes corporativos y alto poder adquisitivo',
          'Ausencia de análisis de ventas y comportamiento de clientes',
        ],
      },
      solutions: {
        title: 'Tecnología que impulsa cadenas restauranteras',
        items: [
          {
            title: 'Sistema POS Multilocación',
            description:
              'Punto de venta centralizado para gestionar todas tus sucursales. Reportes consolidados, control de inventarios multilocación y sincronización en tiempo real.',
          },
          {
            title: 'App de Pedidos con Tu Marca',
            description:
              'Aplicación móvil propia para pedidos a domicilio y recolección. Sin comisiones, programa de lealtad premium y pagos integrados.',
          },
          {
            title: 'Gestión de Cocina y Delivery',
            description:
              'Pantallas KDS para cocina, sistema de asignación de repartidores, rastreo GPS de entregas y análisis de tiempos de servicio por sucursal.',
          },
          {
            title: 'Business Intelligence Gastronómico',
            description:
              'Dashboards ejecutivos con ventas por sucursal, análisis de platillos, comportamiento de clientes corporativos y proyecciones de demanda.',
          },
        ],
      },
      imSoftServices: {
        title: 'Desarrollo de software para restaurantes en Monterrey',
        description:
          'Construimos ecosistemas digitales completos para cadenas restauranteras que buscan independencia tecnológica y crecimiento escalable. Ofrecemos páginas web modernas, aplicaciones móviles, tiendas en línea, análisis de datos y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web y Tiendas en Línea',
            description:
              'Páginas web modernas y tiendas en línea para pedidos a domicilio con diseño responsive, optimización SEO, integración con sistemas POS y pasarelas de pago.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles de Pedidos',
            description:
              'Aplicaciones móviles nativas iOS y Android con tu marca, notificaciones push, programa de puntos premium, geolocalización, cupones y pasarelas de pago mexicanas.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos y Business Intelligence',
            description:
              'Análisis de datos en tiempo real, dashboards con métricas de ventas, análisis de platillos más vendidos, comportamiento de clientes y reportes ejecutivos.',
            icon: '📊',
          },
          {
            title: 'Sistemas POS y Gestión',
            description:
              'Plataformas web responsivas para tablets y terminales, integración con hardware especializado, facturación electrónica y control de franquicias.',
            icon: '🍽️',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada: auditoría de sistemas actuales, estrategia de transformación digital, integraciones empresariales y optimización de procesos.',
            icon: '💡',
          },
        ],
      },
      cta: {
        title: 'Lleva tu restaurante al siguiente nivel en Monterrey',
        description:
          'Platiquemos sobre cómo nuestras soluciones - páginas web, aplicaciones móviles, tiendas en línea, análisis de datos y consultoría tecnológica - pueden reducir dependencia de plataformas externas y aumentar tus ventas directas con tecnología propia.',
        buttonText: 'Agendar Consultoría',
      },
    },

    'software-para-clinicas': {
      seoTitle: 'Software para Clínicas en Monterrey | Sistemas Médicos - imSoft',
      seoDescription:
        'Sistemas de gestión para clínicas en Monterrey. Expediente electrónico NOM-024, agendamiento, facturación, telemedicina y estándares internacionales.',
      h1: 'Software Médico para Clínicas en Monterrey',
      heroSubtitle:
        'Digitalizamos clínicas y hospitales en Monterrey con páginas web corporativas, aplicaciones móviles para pacientes, análisis de datos médicos, expediente electrónico NOM-024 y consultoría tecnológica que mejoran la atención al paciente.',
      problems: {
        title: 'Desafíos de clínicas en Monterrey',
        items: [
          'Cumplimiento de NOM-024 y estándares de calidad internacionales',
          'Gestión de múltiples especialidades médicas y servicios diagnósticos',
          'Integración con laboratorios, estudios de imagen y farmacias',
          'Facturación a aseguradoras internacionales y gastos médicos mayores',
          'Falta de plataforma profesional para telemedicina con calidad corporativa',
          'Reportes para certificaciones médicas internacionales (JCI, ISO)',
        ],
      },
      solutions: {
        title: 'Soluciones digitales para el sector salud en Monterrey',
        items: [
          {
            title: 'Expediente Clínico Certificado',
            description:
              'Sistema que cumple NOM-024 y estándares internacionales. Historia clínica completa, prescripción electrónica, estudios y trazabilidad total.',
          },
          {
            title: 'Sistema de Agendamiento Empresarial',
            description:
              'Plataforma web y móvil para múltiples sucursales y especialidades. Agenda por médico, consultorio, sucursal. Recordatorios multicanal.',
          },
          {
            title: 'Plataforma de Telemedicina Profesional',
            description:
              'Videoconsultas seguras de alta calidad, sala de espera virtual, historia clínica integrada, prescripción electrónica y pagos en línea.',
          },
          {
            title: 'Facturación y Administración Corporativa',
            description:
              'Módulo de facturación CFDI 4.0, integración con aseguradoras nacionales e internacionales, control financiero y reportes ejecutivos.',
          },
        ],
      },
      imSoftServices: {
        title: 'Tecnología especializada para salud en Monterrey',
        description:
          'Desarrollamos soluciones médicas que cumplen con normativas mexicanas e internacionales, estándares de seguridad y privacidad del sector salud. Ofrecemos páginas web corporativas, aplicaciones móviles, análisis de datos médicos y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web Corporativas',
            description:
              'Páginas web modernas para clínicas con arquitectura segura, optimización SEO, información de servicios, agendamiento en línea y cumplimiento de normativas.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles para Pacientes',
            description:
              'Aplicaciones móviles premium nativas iOS y Android para agendar citas, consultar resultados de estudios, videoconsultas de alta calidad y comunicación segura.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos Médicos',
            description:
              'Análisis de datos en tiempo real, dashboards con métricas de atención, reportes de eficiencia, análisis de tratamientos y business intelligence para clínicas.',
            icon: '📊',
          },
          {
            title: 'Sistemas Médicos Certificados',
            description:
              'Plataformas web con arquitectura segura de nivel empresarial, encriptación de datos médicos, respaldo automático, expediente electrónico y cumplimiento NOM-024/HIPAA.',
            icon: '⚕️',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada en salud: auditoría de sistemas, cumplimiento normativo, migración de datos y estrategia de transformación digital.',
            icon: '💡',
          },
        ],
      },
      cta: {
        title: 'Digitaliza tu clínica en Monterrey',
        description:
          'Agenda una reunión para conocer cómo nuestras soluciones tecnológicas - páginas web corporativas, aplicaciones móviles, análisis de datos médicos y consultoría tecnológica - pueden mejorar la atención al paciente y cumplir con normativas de salud nacionales e internacionales.',
        buttonText: 'Contactar a un Especialista',
      },
    },

    'software-para-logistica': {
      seoTitle: 'Software para Logística en Monterrey | Sistemas TMS - imSoft',
      seoDescription:
        'Plataformas de gestión logística en Monterrey. TMS, rastreo GPS, gestión de flotas, almacenes y distribución para empresas industriales.',
      h1: 'Sistemas de Gestión Logística en Monterrey',
      heroSubtitle:
        'Optimizamos operaciones logísticas en Monterrey con páginas web corporativas, aplicaciones móviles para operadores, análisis de datos en tiempo real, plataformas TMS y consultoría tecnológica para empresas industriales.',
      problems: {
        title: 'Retos logísticos en el sector industrial',
        items: [
          'Gestión de flotas para distribución industrial y cross-border',
          'Coordinación con parques industriales y centros de distribución',
          'Falta de visibilidad en tiempo real de mercancía de alto valor',
          'Cumplimiento de estándares de seguridad y rastreo para clientes corporativos',
          'Integración con sistemas de clientes transnacionales (EDI, APIs)',
          'Altos costos operativos en rutas de distribución regional',
        ],
      },
      solutions: {
        title: 'Tecnología logística para empresas industriales',
        items: [
          {
            title: 'TMS - Sistema de Gestión de Transporte',
            description:
              'Plataforma integral para planear rutas, asignar unidades, rastreo GPS en tiempo real, documentación de embarques y análisis de costos.',
          },
          {
            title: 'Rastreo GPS y Telemetría Avanzada',
            description:
              'Integración con dispositivos GPS empresariales, monitoreo en tiempo real, geovallas, alertas de seguridad y análisis de comportamiento de operadores.',
          },
          {
            title: 'WMS - Gestión de Almacenes',
            description:
              'Control de inventarios multilocación, picking optimizado, códigos de barras/RFID, cross-docking, trazabilidad completa y reportes de auditoría.',
          },
          {
            title: 'Portal Corporativo para Clientes',
            description:
              'Plataforma web donde clientes consultan estatus de envíos, rastrean en tiempo real con SLA, programan entregas y descargan documentación.',
          },
        ],
      },
      imSoftServices: {
        title: 'Soluciones tecnológicas para logística en Monterrey',
        description:
          'Creamos ecosistemas digitales que conectan almacenes, transporte, operadores y clientes para operaciones logísticas eficientes de nivel industrial. Ofrecemos páginas web corporativas, aplicaciones móviles, análisis de datos, tiendas en línea para servicios y consultoría tecnológica especializada.',
        services: [
          {
            title: 'Páginas Web y Portales Corporativos',
            description:
              'Páginas web modernas y portales para clientes con arquitectura escalable, optimización SEO, rastreo en tiempo real, dashboards y gestión de documentación.',
            icon: '🌐',
          },
          {
            title: 'Aplicaciones Móviles para Operadores',
            description:
              'Aplicaciones móviles nativas iOS y Android para choferes con navegación GPS, modo offline, captura de evidencias multimedia, geolocalización y firma digital certificada.',
            icon: '📱',
          },
          {
            title: 'Análisis de Datos y Business Intelligence',
            description:
              'Análisis de datos en tiempo real, reportes avanzados, análisis predictivo de demanda, optimización de costos, visualización de datos logísticos y business intelligence.',
            icon: '📊',
          },
          {
            title: 'Plataformas TMS/WMS Empresariales',
            description:
              'Sistemas web robustos con arquitectura escalable, APIs RESTful para integraciones EDI, dashboards ejecutivos con KPIs logísticos en tiempo real.',
            icon: '🚚',
          },
          {
            title: 'Consultoría Tecnológica',
            description:
              'Consultoría tecnológica especializada: auditoría de sistemas logísticos, arquitectura de soluciones, integraciones empresariales y estrategia de transformación digital.',
            icon: '💡',
          },
        ],
      },
      cta: {
        title: 'Optimiza tu operación logística en Monterrey',
        description:
          'Conversemos sobre cómo nuestras soluciones tecnológicas - páginas web corporativas, aplicaciones móviles, análisis de datos, tiendas en línea y consultoría - pueden reducir costos operativos y mejorar tiempos de entrega en Monterrey con tecnología especializada para empresas industriales.',
        buttonText: 'Solicitar Análisis de Operación',
      },
    },
  },
};
