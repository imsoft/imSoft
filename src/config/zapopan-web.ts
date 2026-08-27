/**
 * Contenido de la landing de desarrollo web en Zapopan.
 *
 * Zapopan es mercado real —corporativo de la zona Andares / Puerta de Hierro y PyME—,
 * no aspiracional, y el servicio que mas pesa ahi es web. Por eso tiene pagina propia y
 * no un parrafo dentro de la de Guadalajara.
 *
 * El texto es especifico de Zapopan a proposito: si fuera la pagina de Guadalajara con
 * el nombre cambiado, Google la trataria como duplicado y no rankearia ninguna de las
 * dos. Los proyectos que se citan son reales y estan en el portafolio; lo que NO se
 * afirma es que esos clientes esten en Zapopan, porque ese dato no se tiene.
 *
 * Se apunta a "paginas web zapopan", no a "desarrollo web zapopan". El autocompletado
 * de Google (es-MX) sugiere la primera y no devuelve nada para la segunda: quien
 * contrata escribe "paginas web", "desarrollo web" lo escribe quien las programa.
 */

export const ZAPOPAN_WEB = {
  seoTitle: 'Páginas Web en Zapopan | Diseño y Desarrollo para Empresas - imSoft',
  seoDescription:
    'Páginas web para empresas y PyMEs de Zapopan: Andares, Puerta de Hierro y toda la zona. Sitios rápidos, medibles y hechos para captar clientes.',
  h1: 'Páginas Web en Zapopan',
  heroSubtitle:
    'Diseñamos y desarrollamos páginas web para empresas y PyMEs de Zapopan: rápidos, medibles y pensados para que la gente que te encuentra en Google termine escribiéndote. Trabajamos con empresas de la zona de Andares y Puerta de Hierro, y con negocios de toda la ciudad.',

  audience: {
    title: 'Dos tipos de proyecto que hacemos en Zapopan',
    items: [
      {
        title: 'Corporativo en Andares y Puerta de Hierro',
        description:
          'Empresas con oficinas en los corporativos de la zona que necesitan un sitio a la altura de su marca: presentación institucional clara, casos de éxito, integración con su CRM y analítica que diga de dónde llegan los prospectos. Suelen llegar con un sitio hecho hace años que ya no refleja lo que la empresa es hoy.',
      },
      {
        title: 'PyME de Zapopan que vende localmente',
        description:
          'Negocios que compiten por búsquedas de la zona y hoy dependen de redes sociales o de referidos. Aquí lo que mueve la aguja es un sitio que cargue rápido en celular, que explique el servicio sin rodeos y que aparezca cuando alguien busca en Zapopan. Menos catálogo y más camino claro al contacto.',
      },
    ],
  },

  problems: {
    title: '¿Te suena alguno de estos?',
    items: [
      'Tu sitio se hizo hace años y ya no representa lo que la empresa hace hoy',
      'Carga lento en celular, que es desde donde te busca la mayoría',
      'No apareces cuando alguien busca tu servicio en Zapopan o en la ZMG',
      'Recibes visitas pero no sabes cuáles se convierten en prospectos reales',
      'Dependes de quien te hizo el sitio para cambiar un texto o subir una nota',
      'La página existe, pero nadie la usa como herramienta de venta',
    ],
  },

  solutions: {
    title: 'Cómo lo trabajamos',
    items: [
      {
        title: 'Sitio corporativo a medida',
        description:
          'Nada de plantillas. Arquitectura pensada para tu oferta real, panel de administración para que edites sin depender de nosotros, y estructura preparada para posicionar en las búsquedas que te interesan.',
      },
      {
        title: 'Velocidad como requisito, no como extra',
        description:
          'Construimos sobre Next.js y medimos Core Web Vitals antes de entregar. Un sitio que tarda en pintar pierde visitas antes de que alguien lea la primera línea, y Google lo usa como señal de posicionamiento.',
      },
      {
        title: 'SEO local desde la estructura',
        description:
          'Datos estructurados de negocio local, títulos y contenidos orientados a las búsquedas de Zapopan y la Zona Metropolitana, y sitemap correcto. El posicionamiento se construye en el código, no se añade después.',
      },
      {
        title: 'Analítica que responde preguntas de negocio',
        description:
          'Instalamos medición para que sepas qué páginas traen contactos y por qué canal llegan. Sin eso, cualquier decisión sobre el sitio es una corazonada.',
      },
    ],
  },

  /**
   * Proyectos reales del portafolio. Se citan como muestra del tipo de trabajo, sin
   * afirmar que esos clientes esten en Zapopan.
   */
  proof: {
    title: 'Trabajo que ya está en línea',
    description:
      'Estos son proyectos nuestros que puedes revisar. No todos son de Zapopan, pero sí son el tipo de sitio que construimos para empresas como las de la zona.',
    items: [
      {
        name: 'Infinito Empresarial y Aduanero',
        description: 'Sitio corporativo para una empresa de servicios aduanales.',
      },
      {
        name: 'RM Constructora',
        description: 'Web corporativa de constructora, orientada a posicionamiento de marca.',
      },
      {
        name: 'JTP Logistics',
        description: 'Sitio para captar clientes, más una aplicación interna de inventario.',
      },
      {
        name: 'Profibra',
        description: 'Sitio industrial con catálogo de productos.',
      },
    ],
  },

  cta: {
    title: '¿Hablamos de tu sitio?',
    description:
      'Cuéntanos qué tienes hoy y qué necesitas que haga tu página. Te decimos con qué nos encontramos y qué haríamos, sin compromiso. Atendemos de 9:00 a 18:00, los siete días.',
    buttonText: 'Agenda una llamada',
  },
} as const;
