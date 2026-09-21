/**
 * Landings de ciudad + servicio: "paginas web guadalajara", "empresas de desarrollo de
 * software monterrey", etc. Distintas de las de ciudad + industria (landing-pages-data.ts).
 *
 * Reglas que salen de los datos de Search Console y del autocompletado de Google
 * (validado el 21-sep-2026 en 26 ciudades):
 *
 * - Cada pagina tiene texto propio. Las 31 landings de industria con plantilla suman
 *   0 clics en 90 dias y aparecen en la posicion 80: Google no premia "misma pagina,
 *   otra ciudad". Una prueba (city-services.test.ts) impide que dos paginas compartan
 *   parrafos.
 * - Los slugs siguen lo que la gente teclea: "paginas web", "empresas de desarrollo de
 *   software", "tienda en linea", "desarrollo de apps". Nadie busca "software a la
 *   medida <ciudad>": ese servicio se atiende desde "empresas de software".
 * - Los proyectos citados son reales (tabla portfolio). No se afirma que un cliente
 *   este en la ciudad salvo que conste.
 * - Los precios "desde" son los publicados en la seccion de precios del sitio.
 * - Solo en español: en ingles estas busquedas no tienen volumen. /en canonicaliza a /es.
 */

export type CityServiceSlug = 'paginas-web' | 'empresas-de-software' | 'tiendas-en-linea' | 'desarrollo-de-apps';

export const CITY_SERVICE_SLUGS: CityServiceSlug[] = ['paginas-web', 'empresas-de-software', 'tiendas-en-linea', 'desarrollo-de-apps'];

export interface CityServiceContent {
  seoTitle: string;
  seoDescription: string;
  h1: string;
  heroSubtitle: string;
  /** Tipos de negocio o zonas de la ciudad para los que aplica. */
  audience: { title: string; items: Array<{ title: string; description: string }> };
  problems: { title: string; items: string[] };
  solutions: { title: string; items: Array<{ title: string; description: string }> };
  /** Precios de referencia publicados; solo si aplican a este servicio. */
  pricing?: { title: string; description: string; items: Array<{ name: string; price: string; includes: string }>; note?: string };
  /** Proyectos reales del portafolio, con su slug para enlazar la ficha. */
  proof: { title: string; description: string; items: Array<{ name: string; description: string; slug?: string }> };
  faq: { title: string; items: Array<{ question: string; answer: string }> };
  /** Articulos del blog que responden lo que la gente busca antes de contratar. */
  relatedPosts?: string[];
  cta: { title: string; description: string; buttonText: string };
}

export type CityKey = 'guadalajara';

export const CITY_SERVICE_CITY_LABELS: Record<CityKey, string> = {
  guadalajara: 'Guadalajara',
};

export const CITY_SERVICE_LABELS: Record<CityServiceSlug, string> = {
  'paginas-web': 'Páginas web',
  'empresas-de-software': 'Desarrollo de software',
  'tiendas-en-linea': 'Tiendas en línea',
  'desarrollo-de-apps': 'Desarrollo de apps',
};

/** "Páginas web en Guadalajara", "Desarrollo de apps en Guadalajara"... */
export function cityServiceTitle(city: CityKey, slug: CityServiceSlug): string {
  return `${CITY_SERVICE_LABELS[slug]} en ${CITY_SERVICE_CITY_LABELS[city]}`;
}

export function cityServiceHref(lang: string, city: CityKey, slug: CityServiceSlug): string {
  return `/${lang}/${city}/${slug}`;
}

const HORARIO = 'Atendemos de lunes a sábado de 9:00 a 18:00, y los domingos de 9:00 a 13:00.';

const GUADALAJARA: Record<CityServiceSlug, CityServiceContent> = {
  'paginas-web': {
    seoTitle: 'Páginas web en Guadalajara para empresas y PyMEs | imSoft',
    seoDescription:
      'Diseño y desarrollo de páginas web en Guadalajara: sitios rápidos, con SEO local y panel para editarlos tú. Precio fijo desde $15,000 MXN. Cotización en 48 h.',
    h1: 'Páginas Web en Guadalajara',
    heroSubtitle:
      'Diseñamos y desarrollamos páginas web para empresas de Guadalajara que necesitan aparecer en Google y convertir visitas en llamadas, cotizaciones o citas. Precio fijo acordado antes de empezar, el sitio queda a tu nombre y lo editas sin depender de nadie.',
    audience: {
      title: 'Para quién hacemos páginas web en Guadalajara',
      items: [
        {
          title: 'Empresas de servicios que venden por cotización',
          description:
            'Agencias aduanales, despachos, constructoras, transportistas y distribuidoras: negocios donde el cliente investiga en Google antes de llamar. El sitio tiene que explicar el servicio, dar confianza con casos reales y llevar al contacto en dos clics. Hemos hecho varios sitios así para empresas aduanales y de logística.',
        },
        {
          title: 'Consultorios, clínicas y negocios con cita',
          description:
            'Dentistas, especialistas y clínicas de Providencia, Chapalita o Americana que compiten por búsquedas como "dentista cerca de mí". Aquí el sitio necesita cargar rápido en celular, mostrar horarios y tratamientos, y tener un botón de WhatsApp que funcione a la primera.',
        },
        {
          title: 'Negocios que ya tienen sitio pero no les sirve',
          description:
            'La página se hizo hace años con una plantilla, no aparece en Google y nadie sabe si trae clientes. Empezamos por revisar qué tienes hoy: a veces se rehace, a veces se rescata lo que sí funciona.',
        },
      ],
    },
    problems: {
      title: 'Lo que nos cuentan cuando nos buscan',
      items: [
        'Buscan mi negocio en Google y aparece la competencia, no yo',
        'El sitio carga lento en celular y la gente se va antes de leer',
        'Cada cambio, por chico que sea, hay que pedírselo a quien lo hizo',
        'Tengo visitas, pero no sé cuáles se convirtieron en clientes',
        'La página se ve bien, pero no explica qué vendo ni cómo contactarme',
        'Me cobran una mensualidad por un sitio que no es mío',
      ],
    },
    solutions: {
      title: 'Qué incluye una página web con imSoft',
      items: [
        {
          title: 'Diseño propio, no plantilla',
          description:
            'Cada sección se decide según lo que vendes y cómo te buscan. El resultado es un sitio que se entiende en diez segundos y que se ve como tu empresa, no como cualquier otra.',
        },
        {
          title: 'SEO local para Guadalajara y la ZMG',
          description:
            'Datos estructurados de negocio local, títulos orientados a las búsquedas reales de la zona y perfil de Google Business Profile bien conectado. El posicionamiento se construye desde el código, no se agrega al final.',
        },
        {
          title: 'Rápido en celular, medido antes de entregar',
          description:
            'Construimos sobre Next.js y revisamos Core Web Vitals antes de la entrega. La mayoría de tus visitas llegan desde el teléfono, y la velocidad es criterio de posicionamiento en Google.',
        },
        {
          title: 'Panel para que lo edites tú',
          description:
            'Textos, fotos, servicios y noticias se cambian desde un panel. Dominio, hosting y certificado SSL incluidos el primer año, y el código es tuyo desde que queda pagado.',
        },
      ],
    },
    pricing: {
      title: 'Cuánto cuesta una página web en Guadalajara',
      description: 'Trabajamos a precio fijo: sabes el costo antes de empezar y no cambia durante el proyecto.',
      items: [
        { name: 'Landing page', price: 'Desde $5,000 MXN', includes: 'Una página, formulario de contacto y entrega en una semana. Para validar una idea o una campaña.' },
        { name: 'Sitio web corporativo', price: 'Desde $15,000 MXN', includes: 'Varias secciones, diseño responsive, SEO técnico, dominio, hosting y SSL. Entrega en 2 a 3 semanas.' },
      ],
      note: 'El precio final depende del número de secciones y de si necesitas catálogo, blog o integraciones. Te lo decimos en 48 horas después de una llamada de 15 minutos.',
    },
    proof: {
      title: 'Páginas web que ya están en línea',
      description:
        'Proyectos nuestros que puedes abrir y revisar. Algunos son de empresas de Jalisco, como Ferreacabados Jalisco; de los demás no publicamos la ubicación.',
      items: [
        { name: 'JTP Logistics', description: 'Sitio para captar clientes de una empresa de logística, más una aplicación interna de inventario.', slug: 'jtp-logistics' },
        { name: 'Ferreacabados Jalisco', description: 'Página para presentar productos de ferretería y atraer clientes locales.', slug: 'ferreacabados-jalisco' },
        { name: 'Bemästra Dental', description: 'Sitio de clínica dental pensado para atraer pacientes y facilitar la cita.', slug: 'bemastra-dental' },
        { name: 'Infinito Empresarial y Aduanero', description: 'Sitio corporativo de una empresa de servicios aduanales.', slug: 'business-and-customs-infinity' },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Cuánto tarda una página web?',
          answer: 'Una landing page, una semana. Un sitio corporativo, entre dos y tres semanas desde que nos entregas textos y fotos. Si no los tienes, te ayudamos a redactarlos y eso se suma al plazo.',
        },
        {
          question: '¿El sitio es mío o pago renta?',
          answer: 'Es tuyo. El código, el diseño y el dominio quedan a tu nombre desde que el proyecto está pagado. Dominio, hosting y SSL van incluidos el primer año; después los renuevas tú o con nosotros.',
        },
        {
          question: '¿Van a aparecer en Google?',
          answer: 'El sitio sale con SEO técnico y local hecho: estructura, velocidad, datos de negocio y títulos orientados a cómo te buscan en Guadalajara. Posicionar en las primeras posiciones toma meses y depende también de reseñas y contenido; lo que garantizamos es que el sitio no sea el obstáculo.',
        },
        {
          question: '¿Puedo pagar en partes?',
          answer: 'Sí. Lo habitual es 50 % al iniciar y 50 % contra entrega, por transferencia o con tarjeta mediante enlace de pago. Emitimos CFDI por cada pago.',
        },
        {
          question: '¿Atienden en persona en Guadalajara?',
          answer: 'Sí. Estamos en Guadalajara y podemos vernos para arrancar el proyecto o revisar avances; el resto lo llevamos por videollamada y WhatsApp para no atrasar nada.',
        },
      ],
    },
    relatedPosts: ['cuanto-cuesta-una-pagina-web-en-mexico'],
    cta: {
      title: '¿Hablamos de tu página?',
      description: `Cuéntanos qué tienes hoy y qué quieres que haga tu sitio. En 48 horas te decimos precio y tiempo, sin compromiso. ${HORARIO}`,
      buttonText: 'Pedir cotización',
    },
  },

  'empresas-de-software': {
    seoTitle: 'Empresa de desarrollo de software en Guadalajara | imSoft',
    seoDescription:
      'Empresa de desarrollo de software en Guadalajara: sistemas a la medida para logística, comercio y servicios, a precio fijo y con el código a tu nombre.',
    h1: 'Empresa de Desarrollo de Software en Guadalajara',
    heroSubtitle:
      'Desarrollamos software a la medida para empresas de Guadalajara que ya operan bien pero cargan con hojas de cálculo, WhatsApp y sistemas que no se hablan entre sí. Sistemas internos, portales para clientes y plataformas en la nube, a precio fijo y con el código a tu nombre.',
    audience: {
      title: 'Qué tipo de sistemas construimos en Guadalajara',
      items: [
        {
          title: 'Logística y comercio exterior',
          description:
            'Guadalajara concentra agencias aduanales, transportistas y operadores logísticos, y es el sector con el que más hemos trabajado. Les construimos sistemas de inventario, seguimiento de embarques y portales donde sus clientes consultan el estado de su carga sin llamar. Aduvanta, un SaaS aduanero que reemplaza trece aplicaciones de escritorio, nació de ese sector.',
        },
        {
          title: 'Distribuidoras y mayoristas',
          description:
            'Negocios del Mercado de Abastos y de la zona industrial que toman pedidos por teléfono y controlan existencias en Excel. Un sistema de pedidos con precios por cliente, rutas y facturación quita horas de captura y errores de surtido.',
        },
        {
          title: 'Despachos, clínicas y empresas de servicios',
          description:
            'Generadores de reportes, expedientes, cotizadores y portales de clientes para negocios donde hoy la información vive en carpetas compartidas. Lo hemos hecho para laboratorios dentales, empresas de filtros industriales y despachos.',
        },
      ],
    },
    problems: {
      title: 'Señales de que ya necesitas un sistema propio',
      items: [
        'El control de la operación vive en un Excel que solo entiende una persona',
        'Tus clientes llaman para preguntar cómo va su pedido, su embarque o su trámite',
        'Pagas licencias de varios programas que no se comunican entre sí',
        'Capturar la misma información dos o tres veces es parte del trabajo diario',
        'Quieres crecer, pero cada cliente nuevo implica contratar a alguien más para administrarlo',
        'El sistema que compraste se adapta a medias y no lo puedes modificar',
      ],
    },
    solutions: {
      title: 'Cómo trabajamos un proyecto de software',
      items: [
        {
          title: 'Precio fijo y alcance por escrito',
          description:
            'Antes de programar, definimos juntos qué hace el sistema y qué no, y te damos un precio cerrado. Si el alcance cambia a la mitad, se cotiza aparte; lo acordado no se mueve.',
        },
        {
          title: 'Entregas por fases que puedes usar',
          description:
            'No esperas seis meses para ver algo. Cada fase deja un módulo funcionando en tu operación real, y el pago de cada hito va ligado a esa entrega.',
        },
        {
          title: 'Tecnología actual, sin licencias',
          description:
            'Next.js, PostgreSQL y nube. Sin licencias por usuario ni mensualidades por usar tu propio sistema. El código queda a tu nombre y lo puede mantener cualquier equipo.',
        },
        {
          title: 'Inteligencia artificial donde sí aporta',
          description:
            'Extraer datos de documentos, clasificar información o redactar reportes. La usamos cuando ahorra horas reales, no como adorno, y siempre con revisión humana en lo que importa.',
        },
      ],
    },
    pricing: {
      title: 'Cuánto cuesta desarrollar software a la medida en Guadalajara',
      description: 'Referencia publicada de nuestros precios. Cada proyecto se cotiza con alcance cerrado.',
      items: [
        { name: 'MVP o primer sistema', price: 'Desde $60,000 MXN', includes: 'Producto funcional en 6 a 8 semanas con acceso de usuarios, pagos y panel de administración.' },
        { name: 'Software a la medida', price: 'Desde $150,000 MXN', includes: 'Plataformas, SaaS y sistemas empresariales con arquitectura propia, integraciones y roadmap.' },
      ],
      note: 'Un sistema de inventario o pedidos para una PyME suele quedar en el primer rango; una plataforma con varios roles, facturación e integraciones, en el segundo.',
    },
    proof: {
      title: 'Sistemas que ya operan',
      description:
        'Proyectos reales del portafolio que puedes revisar. Lo que no publicamos es la ubicación de cada cliente.',
      items: [
        { name: 'Aduvanta', description: 'SaaS de gestión aduanera que reemplaza trece aplicaciones de escritorio con una sola plataforma en la nube.', slug: 'aduvanta' },
        { name: 'JTP Logistics · Inventario', description: 'Aplicación web para el control del inventario interno de una empresa de logística.', slug: 'jtp-logistics-inventory' },
        { name: 'Steridental · Pedidos', description: 'Generador de pedidos para los clientes de un laboratorio dental.', slug: 'steridantal-order-generator' },
        { name: 'Starfilters · Reportes', description: 'Generación dinámica de reportes para clientes de una empresa de filtros industriales.', slug: 'starfilters-report-generator' },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Cómo saben cuánto va a costar antes de programar?',
          answer: 'Con una fase corta de descubrimiento: revisamos tu operación, definimos los módulos y las reglas, y con eso cerramos precio y calendario. Si prefieres, esa fase se cotiza sola y decides después si seguimos.',
        },
        {
          question: '¿Qué pasa si el proyecto necesita cambios a la mitad?',
          answer: 'Los cambios que amplían el alcance se cotizan por separado antes de hacerse, y no mueven el precio ni las fechas de lo ya contratado. Está por escrito en la cotización y en el contrato.',
        },
        {
          question: '¿Quién mantiene el sistema después?',
          answer: 'El primer mes de soporte va incluido. Después puedes contratar una iguala mensual con nosotros o dárselo a otro equipo: el código es tuyo y está documentado.',
        },
        {
          question: '¿Trabajan con empresas fuera de Guadalajara?',
          answer: 'Sí, todo el proceso funciona a distancia. Pero estar en Guadalajara nos permite vernos en persona cuando el proyecto lo pide, que en sistemas de operación suele ser al inicio.',
        },
        {
          question: '¿Puedo pagar a meses?',
          answer: 'El proyecto se paga por hitos ligados a entregas. Cada hito puede pagarse por transferencia o con tarjeta, y con tarjeta hay meses sin intereses con bancos participantes.',
        },
      ],
    },
    relatedPosts: ['cuanto-cuesta-desarrollar-una-app-en-mexico'],
    cta: {
      title: '¿Platicamos de tu operación?',
      description: `En una llamada de 15 minutos te decimos si un sistema a la medida tiene sentido para tu caso y en qué rango de precio quedaría. ${HORARIO}`,
      buttonText: 'Agendar llamada',
    },
  },

  'tiendas-en-linea': {
    seoTitle: 'Tiendas en línea en Guadalajara: ecommerce a la medida | imSoft',
    seoDescription:
      'Desarrollo de tiendas en línea en Guadalajara con pagos, envíos y facturación integrados. Sin comisiones por venta ni mensualidades. Cotización en 48 h.',
    h1: 'Tiendas en Línea en Guadalajara',
    heroSubtitle:
      'Desarrollamos tiendas en línea para negocios de Guadalajara que quieren vender más allá del mostrador y de las redes sociales: catálogo, pagos con tarjeta y transferencia, envíos, facturación y un panel para administrarlo todo. Sin comisión por venta ni renta mensual por usar tu propia tienda.',
    audience: {
      title: 'Para qué negocios de Guadalajara tiene sentido una tienda en línea',
      items: [
        {
          title: 'Marcas y boutiques que ya venden por Instagram y WhatsApp',
          description:
            'Ropa, joyería, calzado y suplementos que hoy cierran cada venta en el chat. La tienda toma el pedido, cobra y avisa el envío sola, y tú dejas de contestar "¿cuánto cuesta?" cincuenta veces al día.',
        },
        {
          title: 'Mayoristas y distribuidoras con clientes recurrentes',
          description:
            'Negocios del Abastos y de la zona industrial cuyos clientes piden lo mismo cada semana. Un portal con precios por cliente, pedidos recurrentes y crédito ahorra la captura por teléfono y los errores de surtido.',
        },
        {
          title: 'Fabricantes locales con catálogo técnico',
          description:
            'Filtros, refacciones, materiales y productos con variantes y fichas técnicas. Aquí una plantilla genérica se queda corta: se necesita catálogo estructurado, cotización en línea y, a veces, integración con el inventario.',
        },
      ],
    },
    problems: {
      title: 'Por qué las tiendas de plantilla dejan de servir',
      items: [
        'Pagas mensualidad y comisión por cada venta, y la tienda sigue sin ser tuya',
        'El inventario de la tienda física y el de la web nunca coinciden',
        'Vendes productos con variantes o precios por volumen y la plataforma no lo maneja',
        'Facturar cada venta es un proceso aparte, a mano',
        'Los envíos se cotizan uno por uno por WhatsApp',
        'Quieres integrar tu sistema o tu punto de venta y no hay forma',
      ],
    },
    solutions: {
      title: 'Qué incluye una tienda en línea con imSoft',
      items: [
        {
          title: 'Pagos como se paga en México',
          description:
            'Tarjeta con meses sin intereses, transferencia SPEI y pago en efectivo en tiendas, a través de Stripe o Mercado Pago. El dinero llega a tu cuenta, no a una plataforma intermedia.',
        },
        {
          title: 'Envíos y facturación integrados',
          description:
            'Guías con paqueterías nacionales y entrega local en la ZMG, y CFDI automático o a solicitud del cliente. Menos pasos manuales por cada venta.',
        },
        {
          title: 'Catálogo a tu medida',
          description:
            'Variantes, precios por cliente o volumen, fichas técnicas, productos bajo pedido. La estructura se diseña para lo que vendes, no al revés.',
        },
        {
          title: 'Sin comisiones ni renta',
          description:
            'La tienda es tuya: código, diseño y datos. Pagas el desarrollo una vez y solo los costos reales de hosting y pasarela de pago, que son públicos y no los cobramos nosotros.',
        },
      ],
    },
    proof: {
      title: 'Tiendas en línea que ya venden',
      description:
        'Tres ecommerce del portafolio que puedes abrir. No publicamos la ubicación de cada cliente, solo el trabajo.',
      items: [
        { name: 'LC Suplements', description: 'Ecommerce de suplementos deportivos con catálogo de proteínas, creatinas y vitaminas.', slug: 'lc-suplements' },
        { name: 'Oro Nacional', description: 'Tienda en línea de joyería, enfocada en mostrar producto y aumentar ventas.', slug: 'national-gold' },
        { name: 'Starfilters', description: 'Ecommerce de filtros y soluciones industriales con catálogo técnico.', slug: 'starfilters' },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Es mejor una tienda a la medida o Shopify?',
          answer: 'Si vendes pocos productos simples y no te importa la comisión, Shopify o Tiendanube sirven bien. Una tienda a la medida conviene cuando tienes variantes, precios por cliente, catálogo técnico, necesitas integrar tu inventario o facturación, o cuando la mensualidad y las comisiones ya superan lo que costaría tenerla propia.',
        },
        {
          question: '¿Cuánto cuesta una tienda en línea?',
          answer: 'Depende del catálogo y de las integraciones. Una tienda con catálogo, pagos y envíos entra en el rango de un sitio corporativo con módulos adicionales; una con precios por cliente, inventario sincronizado y facturación automática se acerca a un sistema a la medida. Te damos el precio cerrado en 48 horas.',
        },
        {
          question: '¿Puedo cobrar con tarjeta y a meses sin intereses?',
          answer: 'Sí. Con Stripe o Mercado Pago aceptas tarjetas con meses sin intereses de bancos mexicanos, además de SPEI y efectivo. La pasarela cobra su comisión pública por transacción; nosotros no cobramos nada por venta.',
        },
        {
          question: '¿Y las fotos y descripciones de los productos?',
          answer: 'Las cargas tú desde el panel, en lote si son muchos. Si no tienes fotos, te orientamos sobre qué pedirle a un fotógrafo de producto; ese costo va aparte.',
        },
      ],
    },
    relatedPosts: ['cuanto-cuesta-una-pagina-web-en-mexico'],
    cta: {
      title: '¿Vemos tu catálogo?',
      description: `Cuéntanos qué vendes, cómo cobras hoy y qué te frena. Te decimos si conviene tienda propia o plataforma, y cuánto costaría. ${HORARIO}`,
      buttonText: 'Pedir cotización',
    },
  },

  'desarrollo-de-apps': {
    seoTitle: 'Desarrollo de apps en Guadalajara para empresas | imSoft',
    seoDescription:
      'Desarrollo de apps en Guadalajara: aplicaciones web y móviles para tu equipo o tus clientes, a precio fijo y con el código a tu nombre. Cotización en 48 h.',
    h1: 'Desarrollo de Apps en Guadalajara',
    heroSubtitle:
      'Desarrollamos aplicaciones para empresas de Guadalajara: herramientas para tu equipo en campo, portales para tus clientes y productos que quieres lanzar al mercado. Te decimos con honestidad cuándo conviene una app móvil y cuándo una aplicación web resuelve lo mismo por menos.',
    audience: {
      title: 'Tres tipos de app que hacemos en Guadalajara',
      items: [
        {
          title: 'Apps para tu equipo en campo',
          description:
            'Choferes, técnicos, vendedores de ruta y supervisores de obra que hoy reportan por WhatsApp y fotos sueltas. Una app con formularios, evidencia con foto y ubicación, que funciona sin señal y sincroniza después.',
        },
        {
          title: 'Portales y apps para tus clientes',
          description:
            'Que el cliente consulte el estado de su pedido, su embarque o su trámite, descargue facturas y haga pedidos desde su teléfono. Es la forma más directa de quitarle llamadas a tu equipo.',
        },
        {
          title: 'Un producto propio o MVP',
          description:
            'Tienes una idea de app y quieres validarla con usuarios reales antes de invertir a lo grande. Construimos la primera versión funcional en seis a ocho semanas, con acceso de usuarios, pagos y panel.',
        },
      ],
    },
    problems: {
      title: 'Lo que suele pasar antes de tener una app',
      items: [
        'Tu equipo en campo reporta por WhatsApp y la información se pierde entre chats',
        'Tus clientes te llaman para preguntar algo que podrían consultar solos',
        'Cotizaste una app y el precio no tenía explicación ni alcance claro',
        'Te ofrecieron una app nativa carísima cuando una web app resolvía lo mismo',
        'La app que ya tienes depende de un proveedor que ya no contesta',
        'Quieres lanzar un producto, pero no sabes por dónde empezar ni cuánto invertir',
      ],
    },
    solutions: {
      title: 'Cómo decidimos y construimos tu app',
      items: [
        {
          title: 'Primero, qué tipo de app te conviene',
          description:
            'Una aplicación web funciona en cualquier teléfono sin pasar por las tiendas de apps y cuesta menos; una app nativa se justifica cuando necesitas cámara, GPS o modo sin conexión de forma intensiva. Te lo decimos en la primera llamada, aunque signifique cotizarte menos.',
        },
        {
          title: 'MVP en 6 a 8 semanas',
          description:
            'La primera versión sale con lo esencial funcionando: acceso de usuarios, la operación principal, pagos si aplica y panel de administración. Lo demás se agrega con datos de uso real, no con suposiciones.',
        },
        {
          title: 'Una base de código para web y móvil',
          description:
            'Con React y Next.js, la misma lógica sirve para la web y para la app móvil. Menos costo de mantenimiento y mejoras que llegan a todos los dispositivos a la vez.',
        },
        {
          title: 'Publicación y mantenimiento incluidos al inicio',
          description:
            'Si va a las tiendas, nos encargamos de publicarla en App Store y Google Play. El primer mes de soporte va incluido y después decides si continúas con iguala mensual.',
        },
      ],
    },
    pricing: {
      title: 'Cuánto cuesta desarrollar una app en Guadalajara',
      description: 'Referencia publicada de nuestros precios; el precio cerrado sale después de definir el alcance.',
      items: [
        { name: 'MVP o app para tu operación', price: 'Desde $60,000 MXN', includes: 'Producto funcional en 6 a 8 semanas con acceso de usuarios, pagos y panel de administración.' },
        { name: 'Plataforma o producto completo', price: 'Desde $150,000 MXN', includes: 'Varios roles, integraciones, arquitectura propia y roadmap de versiones.' },
      ],
      note: 'Una app nativa para iOS y Android suele costar más que una aplicación web con las mismas funciones. Por eso lo primero que revisamos es cuál necesitas de verdad.',
    },
    proof: {
      title: 'Aplicaciones que ya se usan',
      description:
        'Aplicaciones web del portafolio que equipos y clientes usan desde el teléfono y la computadora. No publicamos la ubicación de cada cliente.',
      items: [
        { name: 'JTP Logistics · Inventario', description: 'Aplicación para el control del inventario interno de una empresa de logística.', slug: 'jtp-logistics-inventory' },
        { name: 'Steridental · Pedidos', description: 'Aplicación con la que los clientes de un laboratorio dental generan sus pedidos.', slug: 'steridantal-order-generator' },
        { name: 'Wellpoint', description: 'Plataforma para centralizar y administrar servicios de salud, profesionales y centros wellness.', slug: 'wellpoint' },
        { name: 'La Casa del Paste', description: 'Aplicación para la gestión interna de una empresa de alimentos.', slug: 'the-paste-house' },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿App móvil o aplicación web?',
          answer: 'Si tus usuarios necesitan cámara, GPS o trabajar sin señal de forma intensiva, o si el producto vive en la tienda de apps, va móvil. Para casi todo lo demás, una aplicación web que se abre desde el teléfono cuesta menos, se actualiza sin pasar por las tiendas y funciona igual en iPhone y Android.',
        },
        {
          question: '¿Cuánto tarda?',
          answer: 'Un MVP funcional, entre seis y ocho semanas. Una app para tu operación con varios roles e integraciones, de dos a cuatro meses. Se entrega por fases y cada fase se usa desde que sale.',
        },
        {
          question: '¿Ustedes la publican en las tiendas?',
          answer: 'Sí. Creamos las cuentas de desarrollador a tu nombre, preparamos las fichas y gestionamos la revisión de Apple y Google. Las cuentas de desarrollador tienen un costo anual que cobra cada tienda.',
        },
        {
          question: '¿Qué pasa con la app cuando termina el proyecto?',
          answer: 'Es tuya: código, cuentas y datos. El primer mes de soporte va incluido; después puedes contratar mantenimiento mensual con nosotros o con quien elijas.',
        },
      ],
    },
    relatedPosts: ['cuanto-cuesta-desarrollar-una-app-en-mexico'],
    cta: {
      title: '¿Platicamos de tu app?',
      description: `Cuéntanos qué quieres que haga y quién la va a usar. En 15 minutos te decimos si va web o móvil y en qué rango de precio queda. ${HORARIO}`,
      buttonText: 'Agendar llamada',
    },
  },
};

export const CITY_SERVICES: Record<CityKey, Record<CityServiceSlug, CityServiceContent>> = {
  guadalajara: GUADALAJARA,
};

export const CITY_SERVICE_CITIES = Object.keys(CITY_SERVICES) as CityKey[];

export function cityServiceContent(city: string, slug: string): CityServiceContent | null {
  const c = CITY_SERVICES[city as CityKey];
  if (!c) return null;
  return c[slug as CityServiceSlug] ?? null;
}

/** Todas las combinaciones publicadas, para sitemap, generateStaticParams y enlaces. */
export function cityServicePages(): Array<{ city: CityKey; slug: CityServiceSlug }> {
  return CITY_SERVICE_CITIES.flatMap((city) => (Object.keys(CITY_SERVICES[city]) as CityServiceSlug[]).map((slug) => ({ city, slug })));
}
