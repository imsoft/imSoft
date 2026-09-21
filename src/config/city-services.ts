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

export type CityKey = 'guadalajara' | 'monterrey' | 'cdmx';

export const CITY_SERVICE_CITY_LABELS: Record<CityKey, string> = {
  guadalajara: 'Guadalajara',
  monterrey: 'Monterrey',
  cdmx: 'CDMX',
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

/**
 * Monterrey y CDMX: se atienden a distancia desde Guadalajara. Ninguna pagina afirma
 * oficina ni clientes en la ciudad; lo que si es propio de cada una es el tipo de
 * empresa, las zonas y los problemas que se cotizan desde ahi.
 */
const MONTERREY: Record<CityServiceSlug, CityServiceContent> = {
  'paginas-web': {
    seoTitle: 'Páginas web en Monterrey para empresas | imSoft',
    seoDescription:
      'Páginas web para empresas de Monterrey: sitios corporativos que dan confianza a compradores industriales y captan clientes. Precio fijo desde $15,000 MXN.',
    h1: 'Páginas Web en Monterrey',
    heroSubtitle:
      'Desarrollamos páginas web para empresas de Monterrey y su área metropolitana que venden a otras empresas: proveedores industriales, servicios corporativos y negocios de San Pedro, Apodaca o Santa Catarina que necesitan un sitio serio, rápido y que aparezca cuando un comprador los busca. Precio fijo y el sitio a tu nombre.',
    audience: {
      title: 'Qué sitios hacemos para empresas de Monterrey',
      items: [
        {
          title: 'Proveedores industriales y de manufactura',
          description:
            'Maquilados, metalmecánica, refacciones y servicios para las plantas de Apodaca, Escobedo y Santa Catarina. El comprador de una planta revisa tu sitio antes de darte de alta como proveedor: necesita ver certificaciones, capacidad instalada y una forma clara de pedir cotización.',
        },
        {
          title: 'Servicios corporativos en San Pedro y Valle Oriente',
          description:
            'Despachos, consultoras, inmobiliarias y firmas que compiten por clientes empresariales. Aquí el sitio es carta de presentación: casos, equipo, especialidades y un contacto que llegue a la persona correcta, no a un buzón genérico.',
        },
        {
          title: 'Negocios con sitio viejo que ya no vende',
          description:
            'Sitios hechos hace años con un constructor de plantillas, que cargan lento y no aparecen en Google. Revisamos lo que tienes, conservamos lo que funciona y rehacemos lo que no.',
        },
      ],
    },
    problems: {
      title: 'Lo que nos dicen desde Monterrey',
      items: [
        'Un comprador de planta nos pidió el sitio y nos dio pena mandarlo',
        'Aparecemos en Google por el nombre de la empresa, no por lo que vendemos',
        'El sitio no muestra certificaciones ni capacidad y eso lo piden siempre',
        'Cada cotización empieza con un correo porque el sitio no tiene formulario útil',
        'Lo hizo un proveedor que ya no contesta y nadie sabe cómo cambiarlo',
        'Pagamos hosting y mantenimiento de algo que no genera nada',
      ],
    },
    solutions: {
      title: 'Cómo hacemos un sitio que sirva para vender a empresas',
      items: [
        {
          title: 'Estructura pensada para el comprador industrial',
          description:
            'Capacidades, certificaciones, industrias atendidas y catálogo o líneas de producto donde el comprador las busca. Una solicitud de cotización que pide lo necesario y llega al área correcta.',
        },
        {
          title: 'Posicionamiento para búsquedas de Monterrey y Nuevo León',
          description:
            'Títulos y contenidos orientados a cómo buscan tus clientes en la región, datos estructurados de empresa y perfil de Google conectado. Lo técnico del SEO queda resuelto desde el primer día.',
        },
        {
          title: 'Rápido y estable, sin plantillas pesadas',
          description:
            'Sitios hechos con Next.js, medidos con Core Web Vitals antes de entregar. Cargan rápido en celular y en la red de una planta, y no dependen de plugins que se rompen.',
        },
        {
          title: 'Administración en tus manos',
          description:
            'Panel para actualizar productos, certificaciones y noticias sin programar. Dominio, hosting y SSL incluidos el primer año; el código es tuyo desde que queda pagado.',
        },
      ],
    },
    pricing: {
      title: 'Cuánto cuesta una página web en Monterrey',
      description: 'Precio fijo, acordado antes de empezar. Trabajamos a distancia con empresas de todo México.',
      items: [
        { name: 'Landing page', price: 'Desde $5,000 MXN', includes: 'Una sola página con formulario, lista en una semana. Útil para una línea de producto o una campaña.' },
        { name: 'Sitio web corporativo', price: 'Desde $15,000 MXN', includes: 'Secciones de empresa, capacidades y contacto, SEO técnico, dominio, hosting y SSL. Entrega en 2 a 3 semanas.' },
      ],
      note: 'Catálogos extensos, versión en inglés para clientes de Estados Unidos o integraciones con tu CRM se cotizan aparte. Te damos el precio cerrado en 48 horas.',
    },
    proof: {
      title: 'Sitios corporativos que puedes revisar',
      description: 'Proyectos reales del portafolio. Somos de Guadalajara y no publicamos la ubicación de cada cliente.',
      items: [
        { name: 'Profibra', description: 'Sitio industrial con catálogo de productos.', slug: 'profibra' },
        { name: 'Infinito Empresarial y Aduanero', description: 'Sitio corporativo para una empresa de servicios aduanales.', slug: 'business-and-customs-infinity' },
        { name: 'RM Constructora', description: 'Web corporativa de constructora, orientada a marca y credibilidad.', slug: 'rm-construction' },
        { name: 'Ortiz y Cía', description: 'Página diseñada para generar confianza y captar clientes nuevos.', slug: 'ortiz-and-co' },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Tienen oficina en Monterrey?',
          answer: 'No, estamos en Guadalajara. Todo el proceso se hace a distancia con videollamadas y WhatsApp, y así trabajamos con empresas de varias ciudades. Si el proyecto pide una reunión presencial, lo acordamos al cotizar.',
        },
        {
          question: '¿Pueden hacer el sitio en inglés para clientes de Estados Unidos?',
          answer: 'Sí. Muchas empresas de Monterrey venden a plantas del sur de Texas y necesitan versión en inglés. Se cotiza como sección adicional y se construye con las URL y etiquetas correctas para que Google la muestre a quien busca en inglés.',
        },
        {
          question: '¿Cuánto tarda un sitio corporativo?',
          answer: 'Entre dos y tres semanas a partir de que tenemos textos, fotos y certificaciones. Si hace falta redactar o adaptar contenido, lo hacemos y se suma al calendario.',
        },
        {
          question: '¿Cómo se paga?',
          answer: '50 % al iniciar y 50 % contra entrega, por transferencia o con tarjeta mediante enlace de pago. Emitimos CFDI por cada pago; somos persona física con actividad empresarial en Jalisco.',
        },
      ],
    },
    relatedPosts: ['cuanto-cuesta-una-pagina-web-en-mexico'],
    cta: {
      title: '¿Revisamos tu sitio actual?',
      description: `Mándanos la dirección de tu sitio o cuéntanos qué necesitas. En 48 horas te decimos qué haríamos, cuánto costaría y cuándo estaría. ${HORARIO}`,
      buttonText: 'Pedir cotización',
    },
  },

  'empresas-de-software': {
    seoTitle: 'Empresa de desarrollo de software para Monterrey | imSoft',
    seoDescription:
      'Software a la medida para empresas de Monterrey: sistemas de operación, portales de proveedores y plataformas en la nube, a precio fijo y a distancia.',
    h1: 'Desarrollo de Software a la Medida para Empresas de Monterrey',
    heroSubtitle:
      'Construimos software a la medida para empresas de Monterrey que ya rebasaron el Excel: control de producción y mantenimiento, portales de proveedores y clientes, y plataformas para operar varias sucursales o plantas. Precio fijo, entregas por fases y el código a tu nombre.',
    audience: {
      title: 'Sistemas que cotizamos con frecuencia para Monterrey',
      items: [
        {
          title: 'Operación de planta y mantenimiento',
          description:
            'Órdenes de trabajo, mantenimiento preventivo, control de refacciones y reportes de producción por turno. Sistemas que sustituyen las bitácoras en papel y las hojas de cálculo que cada supervisor llena a su manera.',
        },
        {
          title: 'Portales de proveedores y clientes industriales',
          description:
            'Que el proveedor cargue sus facturas y consulte pagos, y que el cliente vea el estado de su pedido o su embarque sin llamar a compras o a tráfico. Es donde más horas de atención se recuperan.',
        },
        {
          title: 'Grupos con varias sucursales o unidades',
          description:
            'Empresas de servicios, comercio o salud con sedes en el área metropolitana que necesitan ver la operación completa en un solo lugar: inventarios, ventas, personal y cumplimiento.',
        },
      ],
    },
    problems: {
      title: 'Cuándo un sistema a la medida sale más barato que seguir así',
      items: [
        'Cada planta o sucursal lleva su control aparte y consolidar tarda días',
        'El ERP que compraron cubre finanzas, pero la operación diaria sigue en Excel',
        'Compras recibe facturas por correo y las captura una por una',
        'Los clientes llaman a preguntar por pedidos que podrían consultar solos',
        'Los reportes para dirección se arman a mano cada semana',
        'Pagan licencias por usuario de un software que usan a medias',
      ],
    },
    solutions: {
      title: 'Cómo llevamos un proyecto a distancia sin que se sienta a distancia',
      items: [
        {
          title: 'Descubrimiento corto y alcance cerrado',
          description:
            'Dos o tres sesiones por videollamada con las personas que operan, no solo con dirección. De ahí sale un documento de alcance con módulos, reglas y precio fijo.',
        },
        {
          title: 'Fases que se usan en producción',
          description:
            'La primera entrega ya resuelve el proceso más doloroso y se usa en tu operación real. Cada hito de pago está ligado a una entrega, no a fechas en el aire.',
        },
        {
          title: 'Integración con lo que ya tienes',
          description:
            'Conectamos con tu ERP, tu facturación o tus básculas y lectores cuando aplica, en lugar de duplicar información. Base de datos PostgreSQL y nube, sin licencias por usuario.',
        },
        {
          title: 'Documentación y código a tu nombre',
          description:
            'Al terminar, el sistema es tuyo y está documentado para que tu equipo de sistemas o cualquier proveedor lo mantenga. El primer mes de soporte va incluido.',
        },
      ],
    },
    pricing: {
      title: 'Cuánto cuesta un desarrollo a la medida para Monterrey',
      description: 'Referencia publicada. El precio cerrado sale del alcance que definimos juntos.',
      items: [
        { name: 'Primer sistema o MVP', price: 'Desde $60,000 MXN', includes: 'Un proceso completo funcionando en 6 a 8 semanas, con usuarios, roles y panel de administración.' },
        { name: 'Plataforma a la medida', price: 'Desde $150,000 MXN', includes: 'Varios módulos, integraciones con ERP o facturación, múltiples sedes y roadmap por fases.' },
      ],
      note: 'Un portal de proveedores o un control de mantenimiento suelen quedar en el primer rango; una plataforma multi-planta con integraciones, en el segundo.',
    },
    proof: {
      title: 'Sistemas nuestros que ya operan',
      description: 'Del portafolio, para que veas el tipo de sistema. Somos de Guadalajara y no publicamos la ubicación de cada cliente.',
      items: [
        { name: 'Aduvanta', description: 'SaaS de gestión aduanera que sustituye trece aplicaciones de escritorio.', slug: 'aduvanta' },
        { name: 'Starfilters · Reportes', description: 'Reportes dinámicos para clientes de una empresa de filtros industriales.', slug: 'starfilters-report-generator' },
        { name: 'The PodStore', description: 'Aplicación web para procesos internos de una empresa de servicios.', slug: 'the-podstore' },
        { name: 'JTP Logistics · Inventario', description: 'Control de inventario interno para una empresa de logística.', slug: 'jtp-logistics-inventory' },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Funciona desarrollar un sistema con un equipo que no está en Monterrey?',
          answer: 'Sí, siempre que el levantamiento se haga bien. Por eso las sesiones de descubrimiento son con quien opera el proceso, por videollamada y con pantalla compartida, y cada fase se prueba en tu operación antes de seguir. Si hace falta estar presentes en el arranque, lo acordamos al cotizar.',
        },
        {
          question: '¿Se integra con nuestro ERP?',
          answer: 'Depende del ERP y de qué acceso ofrezca. La mayoría de los sistemas modernos tienen API o exportación programada, y con eso conectamos sin duplicar capturas. Lo revisamos en el descubrimiento antes de cerrar precio.',
        },
        {
          question: '¿Quién es dueño del código?',
          answer: 'Tu empresa, desde que el proyecto está pagado. Sin licencias por usuario, sin renta por usar tu propio sistema, y con documentación para que lo mantenga quien decidas.',
        },
        {
          question: '¿Cómo son los pagos?',
          answer: 'Por hitos ligados a entregas, normalmente 50 % al iniciar y 50 % contra entrega en proyectos cortos, o tres hitos en proyectos largos. Transferencia o tarjeta con enlace de pago, y CFDI en cada pago.',
        },
      ],
    },
    relatedPosts: ['cuanto-cuesta-desarrollar-una-app-en-mexico'],
    cta: {
      title: '¿Vemos tu operación?',
      description: `Una videollamada de 15 minutos para entender qué controlas hoy en Excel y decirte si un sistema a la medida tiene sentido y en qué rango de precio. ${HORARIO}`,
      buttonText: 'Agendar videollamada',
    },
  },

  'tiendas-en-linea': {
    seoTitle: 'Tiendas en línea en Monterrey: ecommerce B2B y B2C | imSoft',
    seoDescription:
      'Tiendas en línea para empresas de Monterrey: catálogo industrial, precios por cliente, pagos y facturación. Tienda propia, sin comisiones por venta.',
    h1: 'Tiendas en Línea en Monterrey',
    heroSubtitle:
      'Desarrollamos tiendas en línea para empresas de Monterrey que venden a otras empresas o al consumidor final: catálogos industriales con precios por cliente, marcas regias que venden a todo México y distribuidores que quieren dejar de tomar pedidos por teléfono. Tienda propia, sin comisión por venta.',
    audience: {
      title: 'Tres tiendas en línea distintas que hacemos para Monterrey',
      items: [
        {
          title: 'Catálogo industrial con venta a empresas',
          description:
            'Refacciones, herramienta, consumibles y equipo con precios por cliente, crédito y pedidos recurrentes. El cliente industrial ve su lista de precios, repite su pedido del mes y descarga su factura, y tu equipo de ventas deja de capturar.',
        },
        {
          title: 'Marcas de consumo que venden a todo el país',
          description:
            'Alimentos, ropa, artículos del hogar y productos regionales que salen de Monterrey a todo México. Aquí importan la velocidad, los envíos con paqueterías nacionales y los pagos con meses sin intereses.',
        },
        {
          title: 'Distribuidores que ya venden por WhatsApp',
          description:
            'Negocios que cierran cada pedido en el chat y pierden ventas fuera de horario. La tienda toma el pedido, cobra y confirma el envío sola; WhatsApp queda para las dudas.',
        },
      ],
    },
    problems: {
      title: 'Por qué las plataformas de renta se quedan cortas',
      items: [
        'Vendes a empresas con precios distintos por cliente y la plataforma solo tiene un precio',
        'Facturas cada venta a mano porque la tienda no emite CFDI',
        'La comisión por venta ya suma más que lo que costaría una tienda propia',
        'El inventario de la tienda y el del almacén no coinciden',
        'Los envíos foráneos se cotizan uno por uno',
        'Quieres conectar tu ERP o tu punto de venta y no hay forma',
      ],
    },
    solutions: {
      title: 'Qué incluye una tienda en línea con nosotros',
      items: [
        {
          title: 'Precios por cliente, crédito y pedidos recurrentes',
          description:
            'Listas de precio por segmento, límites de crédito, aprobación de pedidos y repetición del pedido anterior. Lo que una tienda de plantilla no maneja y una venta a empresas exige.',
        },
        {
          title: 'Pagos y facturación como en México',
          description:
            'Tarjeta con meses sin intereses, SPEI y efectivo mediante Stripe o Mercado Pago, y CFDI automático o a solicitud. El dinero llega a tu cuenta, no a una plataforma.',
        },
        {
          title: 'Envíos a todo el país',
          description:
            'Guías con paqueterías nacionales, reglas por peso y zona, y entrega local en el área metropolitana de Monterrey si la manejas con tu flota.',
        },
        {
          title: 'Tuya, sin comisiones ni renta',
          description:
            'Pagas el desarrollo una vez. Después, solo los costos reales de hosting y pasarela, que son públicos y no los cobramos nosotros. Código, diseño y datos son de tu empresa.',
        },
      ],
    },
    proof: {
      title: 'Tiendas en línea que ya venden',
      description: 'Tres ecommerce del portafolio que puedes abrir. Somos de Guadalajara y no publicamos la ubicación de cada cliente.',
      items: [
        { name: 'Starfilters', description: 'Ecommerce de filtros y soluciones industriales con catálogo técnico.', slug: 'starfilters' },
        { name: 'LC Suplements', description: 'Tienda de suplementos deportivos con catálogo de proteínas, creatinas y vitaminas.', slug: 'lc-suplements' },
        { name: 'Oro Nacional', description: 'Ecommerce de joyería enfocado en mostrar producto y aumentar ventas.', slug: 'national-gold' },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Sirve para vender a empresas y no solo al público?',
          answer: 'Sí, es donde más sentido tiene una tienda a la medida. Precios por cliente, crédito, aprobación de pedidos, facturación con los datos fiscales de cada cuenta y un portal donde tu cliente repite pedidos y descarga facturas.',
        },
        {
          question: '¿Cuánto cuesta una tienda en línea para Monterrey?',
          answer: 'Una tienda con catálogo, pagos y envíos se cotiza en el rango de un sitio corporativo con módulos adicionales; una con precios por cliente, crédito, inventario sincronizado y facturación automática se acerca a un sistema a la medida. El precio cerrado te lo damos en 48 horas.',
        },
        {
          question: '¿Se puede conectar con nuestro sistema de inventario?',
          answer: 'Sí, cuando el sistema ofrece API o exportación. Así el inventario de la tienda refleja el del almacén y no vendes lo que ya no hay. Lo revisamos antes de cerrar el alcance.',
        },
        {
          question: '¿Y si ya tenemos tienda en Shopify?',
          answer: 'Si te funciona, quédate ahí. Migrar a una tienda propia conviene cuando las comisiones y la mensualidad ya superan el costo de tenerla, o cuando necesitas funciones que la plataforma no permite. Te decimos con números cuál es tu caso.',
        },
      ],
    },
    relatedPosts: ['cuanto-cuesta-una-pagina-web-en-mexico'],
    cta: {
      title: '¿Vemos tu catálogo y cómo cobras?',
      description: `Cuéntanos qué vendes, a quién y cómo tomas pedidos hoy. Todo a distancia, por videollamada, desde Guadalajara. Te decimos si conviene tienda propia o plataforma, y cuánto costaría. ${HORARIO}`,
      buttonText: 'Pedir cotización',
    },
  },

  'desarrollo-de-apps': {
    seoTitle: 'Desarrollo de apps para empresas de Monterrey | imSoft',
    seoDescription:
      'Desarrollo de apps para empresas de Monterrey: apps para equipos en planta y en campo, portales para clientes y productos digitales. Precio fijo, a distancia.',
    h1: 'Desarrollo de Apps para Empresas de Monterrey',
    heroSubtitle:
      'Desarrollamos aplicaciones para empresas de Monterrey: apps para el personal de planta y de campo, portales móviles para clientes y productos digitales que quieres lanzar. Te decimos con números cuándo conviene una app nativa y cuándo una aplicación web resuelve lo mismo por menos.',
    audience: {
      title: 'Apps que cotizamos con frecuencia desde Monterrey',
      items: [
        {
          title: 'Personal de planta y mantenimiento',
          description:
            'Registro de inspecciones, checklists de seguridad, reporte de fallas con foto y órdenes de trabajo en el teléfono, con modo sin conexión para naves donde la señal no llega.',
        },
        {
          title: 'Equipos en campo y flotas',
          description:
            'Técnicos, vendedores de ruta y choferes que hoy reportan por WhatsApp. Una app con formularios, evidencia con ubicación y sincronización cuando vuelve la señal.',
        },
        {
          title: 'Productos digitales y MVP',
          description:
            'Empresas y emprendedores de Monterrey que quieren validar una app con usuarios reales antes de invertir a fondo. Primera versión funcional en seis a ocho semanas.',
        },
      ],
    },
    problems: {
      title: 'Lo que suele pasar antes de tener una app propia',
      items: [
        'La información de planta se captura en papel y se pasa a Excel al final del turno',
        'Nos cotizaron una app nativa sin explicar por qué no bastaba una web app',
        'El proveedor anterior entregó la app y desapareció',
        'Cada área usa una app distinta y ninguna se comunica con las demás',
        'Queremos lanzar un producto, pero no sabemos cuánto invertir ni por dónde empezar',
        'Los clientes piden consultar su información desde el celular y no hay cómo',
      ],
    },
    solutions: {
      title: 'Cómo decidimos y construimos',
      items: [
        {
          title: 'Web app o nativa, con criterio',
          description:
            'Si necesitas cámara y GPS de forma intensiva, trabajo sin señal o distribución en tiendas de apps, va nativa. Para la mayoría de los casos, una aplicación web instalable en el teléfono cuesta menos y se actualiza sin pasar por las tiendas.',
        },
        {
          title: 'Primera versión en 6 a 8 semanas',
          description:
            'Con lo esencial funcionando: acceso de usuarios, la operación principal y panel de administración. Lo demás se agrega con datos de uso real.',
        },
        {
          title: 'Un solo código para web y móvil',
          description:
            'Con React y Next.js la misma lógica sirve para la web y para la app. Menos costo de mantenimiento y mejoras que llegan a todos a la vez.',
        },
        {
          title: 'Publicación, soporte y propiedad',
          description:
            'Publicamos en App Store y Google Play con cuentas a tu nombre. Primer mes de soporte incluido, y el código es tuyo desde que queda pagado.',
        },
      ],
    },
    pricing: {
      title: 'Cuánto cuesta desarrollar una app para Monterrey',
      description: 'Referencia publicada; el precio cerrado sale después de definir el alcance por videollamada.',
      items: [
        { name: 'MVP o app de operación', price: 'Desde $60,000 MXN', includes: 'Aplicación funcional en 6 a 8 semanas con usuarios, roles, panel y, si aplica, pagos.' },
        { name: 'Plataforma o producto completo', price: 'Desde $150,000 MXN', includes: 'Varios roles, integraciones con tus sistemas, modo sin conexión y roadmap de versiones.' },
      ],
      note: 'Una app nativa para iOS y Android cuesta más que una web app con las mismas funciones. Por eso lo primero que revisamos es cuál necesitas de verdad.',
    },
    proof: {
      title: 'Aplicaciones nuestras en uso',
      description: 'Aplicaciones web del portafolio que equipos y clientes usan desde el teléfono. Somos de Guadalajara y no publicamos la ubicación de cada cliente.',
      items: [
        { name: 'Steridental · Pedidos', description: 'Aplicación con la que los clientes de un laboratorio dental generan pedidos.', slug: 'steridantal-order-generator' },
        { name: 'La Casa del Paste', description: 'Aplicación para la gestión interna de una empresa de alimentos.', slug: 'the-paste-house' },
        { name: 'Wellpoint', description: 'Plataforma para administrar servicios de salud, profesionales y centros wellness.', slug: 'wellpoint' },
        { name: 'Cursumi', description: 'Plataforma de venta de cursos y gestión de contenido educativo.', slug: 'cursumi' },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Pueden desarrollar la app sin estar en Monterrey?',
          answer: 'Sí. El levantamiento se hace por videollamada con quienes van a usar la app, y las pruebas las hace tu equipo en su operación real desde la primera fase. Trabajamos así con empresas de varias ciudades.',
        },
        {
          question: '¿La app funciona sin señal dentro de la planta?',
          answer: 'Puede. El modo sin conexión guarda la captura en el teléfono y sincroniza cuando hay red. Es una de las razones para elegir app nativa o una web app instalable con almacenamiento local, y se define en el alcance.',
        },
        {
          question: '¿Cuánto tarda?',
          answer: 'Un MVP, entre seis y ocho semanas. Una app de operación con varios roles e integraciones, de dos a cuatro meses, entregada por fases que se usan desde que salen.',
        },
        {
          question: '¿Quién mantiene la app después?',
          answer: 'El primer mes va incluido. Después puedes contratar mantenimiento mensual con nosotros o dárselo a tu equipo de sistemas: el código, las cuentas de las tiendas y los datos son tuyos.',
        },
      ],
    },
    relatedPosts: ['cuanto-cuesta-desarrollar-una-app-en-mexico'],
    cta: {
      title: '¿Platicamos de tu app?',
      description: `Cuéntanos qué debe hacer y quién la usará. En una videollamada de 15 minutos te decimos si va web o nativa y en qué rango de precio queda. ${HORARIO}`,
      buttonText: 'Agendar videollamada',
    },
  },
};

const CDMX: Partial<Record<CityServiceSlug, CityServiceContent>> = {
  'paginas-web': {
    seoTitle: 'Páginas web en CDMX para empresas y despachos | imSoft',
    seoDescription:
      'Páginas web para empresas, despachos y negocios de la Ciudad de México: sitios rápidos que posicionan en Google y convierten. Precio fijo desde $15,000 MXN.',
    h1: 'Páginas Web en CDMX',
    heroSubtitle:
      'Desarrollamos páginas web para empresas de la Ciudad de México que compiten en el mercado más saturado del país: despachos, consultoras, agencias, clínicas y negocios de Polanco, Santa Fe, Roma o Insurgentes que necesitan destacar en Google y convertir la visita en contacto. Precio fijo y el sitio a tu nombre.',
    audience: {
      title: 'Qué sitios hacemos para la Ciudad de México',
      items: [
        {
          title: 'Despachos y firmas de servicios profesionales',
          description:
            'Abogados, contadores, consultoras y agencias que compiten con cientos de firmas por las mismas búsquedas. El sitio tiene que decir en qué eres distinto, mostrar casos y equipo, y llevar a una cita sin fricción.',
        },
        {
          title: 'Clínicas y consultorios con varias sedes',
          description:
            'Especialistas y clínicas con consultorios en distintas colonias que necesitan que cada sede aparezca en su zona y que la cita se agende desde el celular.',
        },
        {
          title: 'Empresas que ya invirtieron en un sitio que no rinde',
          description:
            'Agencias que cobraron mucho por un sitio bonito que no aparece ni convierte. Revisamos qué pasa, conservamos la marca y arreglamos estructura, velocidad y contenido.',
        },
      ],
    },
    problems: {
      title: 'Lo que nos cuentan desde la Ciudad de México',
      items: [
        'Hay tanta competencia que no aparecemos ni buscando nuestra especialidad',
        'Pagamos una agencia cara y el sitio se ve bien pero no trae clientes',
        'El sitio tarda en cargar y en celular es peor',
        'Las citas y contactos se pierden entre correos y redes',
        'Cambiar algo del sitio implica pedirlo y esperar semanas',
        'No sabemos cuántos clientes vienen del sitio y cuántos de recomendación',
      ],
    },
    solutions: {
      title: 'Cómo competimos en un mercado saturado',
      items: [
        {
          title: 'Enfoque: una especialidad, una zona, una promesa',
          description:
            'En CDMX no se rankea por "abogados" ni por "clínica", sino por especialidad y zona. Estructuramos el sitio para esas búsquedas concretas, con páginas por servicio y por sede cuando hace falta.',
        },
        {
          title: 'Velocidad y técnica sin excusas',
          description:
            'Next.js, Core Web Vitals medidos, datos estructurados de negocio y de preguntas frecuentes. Lo que Google evalúa queda resuelto desde el código.',
        },
        {
          title: 'Camino claro al contacto',
          description:
            'Cita en línea, WhatsApp o formulario que llega a la persona correcta, con medición para saber qué página y qué canal trajo cada contacto.',
        },
        {
          title: 'Independencia de la agencia',
          description:
            'Panel para editar contenido sin depender de nadie. Dominio, hosting y SSL incluidos el primer año; el sitio es tuyo desde que queda pagado.',
        },
      ],
    },
    pricing: {
      title: 'Cuánto cuesta una página web en CDMX',
      description: 'Precio fijo, acordado antes de empezar. Trabajamos a distancia desde Guadalajara con clientes de todo el país.',
      items: [
        { name: 'Landing page', price: 'Desde $5,000 MXN', includes: 'Una página con formulario, lista en una semana. Para una campaña o un servicio específico.' },
        { name: 'Sitio web corporativo', price: 'Desde $15,000 MXN', includes: 'Secciones por servicio, diseño responsive, SEO técnico, dominio, hosting y SSL. Entrega en 2 a 3 semanas.' },
      ],
      note: 'Sitios con varias sedes, agenda de citas en línea o blog se cotizan con módulos adicionales. Precio cerrado en 48 horas.',
    },
    proof: {
      title: 'Sitios que puedes revisar',
      description: 'Proyectos reales del portafolio. Somos de Guadalajara y no publicamos la ubicación de cada cliente.',
      items: [
        { name: 'Bemästra Dental', description: 'Sitio de clínica dental pensado para atraer pacientes y facilitar la cita.', slug: 'bemastra-dental' },
        { name: 'Ortiz y Cía', description: 'Página diseñada para generar confianza y captar clientes nuevos.', slug: 'ortiz-and-co' },
        { name: 'Construcción Inteligente', description: 'Web corporativa con diseño orientado a posicionamiento.', slug: 'intelligent-construction' },
        { name: 'Infinito Empresarial y Aduanero', description: 'Sitio corporativo para una empresa de servicios aduanales.', slug: 'business-and-customs-infinity' },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Están en la Ciudad de México?',
          answer: 'No, estamos en Guadalajara y trabajamos a distancia con clientes de todo el país. Videollamadas, WhatsApp y entregas revisables en línea; el proceso no requiere reuniones presenciales.',
        },
        {
          question: '¿Por qué contratar a una empresa de otra ciudad?',
          answer: 'Porque el resultado no depende de la ciudad sino del proceso: precio fijo, entrega en semanas, sitio a tu nombre y SEO técnico hecho. Y porque nuestros costos de operación en Guadalajara se reflejan en el precio.',
        },
        {
          question: '¿Cuánto tarda?',
          answer: 'Una landing, una semana. Un sitio corporativo, dos a tres semanas desde que tenemos textos y fotos. Si necesitas redacción, la hacemos y se suma al plazo.',
        },
        {
          question: '¿Cómo se paga y facturan?',
          answer: '50 % al iniciar y 50 % contra entrega, por transferencia o tarjeta con enlace de pago. Emitimos CFDI por cada pago con tus datos fiscales.',
        },
      ],
    },
    relatedPosts: ['cuanto-cuesta-una-pagina-web-en-mexico'],
    cta: {
      title: '¿Revisamos tu sitio?',
      description: `Mándanos tu sitio actual o cuéntanos qué necesitas. En 48 horas te decimos qué haríamos, cuánto costaría y cuándo estaría. ${HORARIO}`,
      buttonText: 'Pedir cotización',
    },
  },

  'empresas-de-software': {
    seoTitle: 'Empresa de desarrollo de software para CDMX | imSoft',
    seoDescription:
      'Software a la medida para empresas de la Ciudad de México: sistemas internos, portales de clientes y plataformas SaaS, a precio fijo y a distancia.',
    h1: 'Desarrollo de Software a la Medida para Empresas de CDMX',
    heroSubtitle:
      'Construimos software a la medida para empresas de la Ciudad de México que necesitan un sistema propio sin pagar tarifas de agencia grande: sistemas de operación, portales para clientes, automatización de procesos y plataformas SaaS. Precio fijo, entregas por fases y el código a tu nombre.',
    audience: {
      title: 'Proyectos que cotizamos con frecuencia para CDMX',
      items: [
        {
          title: 'Despachos y firmas con muchos expedientes',
          description:
            'Legales, contables, inmobiliarias y de gestoría que llevan cientos de asuntos en carpetas compartidas. Un sistema de expedientes con seguimiento, vencimientos y portal donde el cliente consulta su caso.',
        },
        {
          title: 'Empresas de servicios con operación repetitiva',
          description:
            'Mantenimiento, limpieza, seguridad, logística de última milla: cotizar, programar, ejecutar y cobrar, hoy repartido entre WhatsApp, Excel y un sistema de facturación que no se habla con nada.',
        },
        {
          title: 'Emprendedores y empresas que lanzan un SaaS',
          description:
            'Producto digital con suscripción, varios roles y pagos recurrentes. Primera versión en seis a ocho semanas para validar con clientes de pago antes de escalar.',
        },
      ],
    },
    problems: {
      title: 'Señales de que ya toca un sistema propio',
      items: [
        'La operación vive en Excel y solo una persona lo entiende',
        'Los clientes llaman para preguntar por trámites que podrían consultar solos',
        'Pagan varias herramientas que no se comunican y capturan doble',
        'Las agencias grandes cotizan cifras que no tienen relación con el problema',
        'El producto que quieren lanzar lleva meses en presentaciones y cero en código',
        'Crecer implica contratar más personas para administrar, no para vender',
      ],
    },
    solutions: {
      title: 'Cómo trabajamos con empresas de la Ciudad de México',
      items: [
        {
          title: 'Alcance cerrado en dos semanas de descubrimiento',
          description:
            'Sesiones por videollamada con quien opera el proceso. Salen módulos, reglas, integraciones y un precio fijo que no se mueve salvo que cambie el alcance, y eso se cotiza aparte por escrito.',
        },
        {
          title: 'Entregas cortas que se usan de inmediato',
          description:
            'La primera fase resuelve el proceso más caro y entra a producción. Cada pago va ligado a una entrega que puedes probar.',
        },
        {
          title: 'Stack moderno, sin licencias',
          description:
            'Next.js, PostgreSQL y nube. Sin cobro por usuario, sin renta por usar tu sistema. Integración con facturación, pasarelas de pago y las herramientas que ya usas.',
        },
        {
          title: 'IA aplicada a lo que consume horas',
          description:
            'Extraer datos de documentos, clasificar solicitudes o redactar reportes. La usamos donde ahorra tiempo real, con revisión humana en lo que importa.',
        },
      ],
    },
    pricing: {
      title: 'Cuánto cuesta un desarrollo a la medida para CDMX',
      description: 'Referencia publicada. El precio cerrado sale del alcance definido.',
      items: [
        { name: 'Primer sistema o MVP', price: 'Desde $60,000 MXN', includes: 'Un proceso completo en producción en 6 a 8 semanas, con usuarios, roles, pagos si aplica y panel de administración.' },
        { name: 'Plataforma o SaaS', price: 'Desde $150,000 MXN', includes: 'Varios módulos, suscripciones, integraciones y roadmap por fases.' },
      ],
      note: 'Un sistema de expedientes o un portal de clientes suele quedar en el primer rango; un SaaS con suscripciones y varios roles, en el segundo.',
    },
    proof: {
      title: 'Sistemas nuestros que ya operan',
      description: 'Del portafolio, para que veas el tipo de trabajo. Somos de Guadalajara y no publicamos la ubicación de cada cliente.',
      items: [
        { name: 'Aduvanta', description: 'SaaS de gestión aduanera en la nube que reemplaza trece aplicaciones de escritorio.', slug: 'aduvanta' },
        { name: 'Omnitria', description: 'Plataforma inmobiliaria para publicar, gestionar y encontrar propiedades.', slug: 'omnitria' },
        { name: 'Wellpoint', description: 'SaaS para centralizar servicios de salud, profesionales y centros wellness.', slug: 'wellpoint' },
        { name: 'The PodStore', description: 'Aplicación web para procesos internos de una empresa de servicios.', slug: 'the-podstore' },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Trabajan con empresas de la Ciudad de México sin estar ahí?',
          answer: 'Sí, todo el proceso es remoto: descubrimiento por videollamada con pantalla compartida, entregas que pruebas en línea y soporte por WhatsApp. Es como trabajamos con clientes fuera de Guadalajara.',
        },
        {
          question: '¿Por qué su precio es menor que el de agencias de CDMX?',
          answer: 'Porque somos un equipo pequeño con costos de Guadalajara y sin capas de gestión. El precio fijo y el alcance por escrito hacen que no haya sorpresas ni horas facturadas de más.',
        },
        {
          question: '¿Qué pasa si cambiamos de idea a la mitad?',
          answer: 'Los cambios que amplían el alcance se cotizan por separado antes de hacerse y no mueven lo ya contratado. Está en la cotización y en el contrato que firmas en línea.',
        },
        {
          question: '¿Quién es dueño del código y quién lo mantiene?',
          answer: 'Tu empresa es dueña desde que el proyecto está pagado. El primer mes de soporte va incluido; después decides si sigues con nosotros por iguala mensual o con otro equipo.',
        },
      ],
    },
    relatedPosts: ['cuanto-cuesta-desarrollar-una-app-en-mexico'],
    cta: {
      title: '¿Platicamos de tu proyecto?',
      description: `Una videollamada de 15 minutos para entender qué quieres resolver y decirte si tiene sentido, cómo lo haríamos y en qué rango de precio. ${HORARIO}`,
      buttonText: 'Agendar videollamada',
    },
  },

  'tiendas-en-linea': {
    seoTitle: 'Tiendas en línea en CDMX sin comisiones por venta | imSoft',
    seoDescription:
      'Desarrollo de tiendas en línea para negocios de la Ciudad de México: catálogo, pagos, envíos y facturación integrados. Tienda propia, sin comisión por venta.',
    h1: 'Tiendas en Línea en CDMX',
    heroSubtitle:
      'Desarrollamos tiendas en línea para marcas y negocios de la Ciudad de México que quieren vender a todo el país sin depender de marketplaces ni pagar comisión por cada venta: catálogo propio, pagos con tarjeta y SPEI, envíos y facturación, con un panel para administrarlo todo.',
    audience: {
      title: 'Para quién hacemos tiendas en línea en la Ciudad de México',
      items: [
        {
          title: 'Marcas que hoy dependen de marketplaces',
          description:
            'Venden en Mercado Libre o Amazon, pagan comisiones altas y no tienen los datos de sus clientes. Una tienda propia recupera margen y te permite volver a venderle a quien ya compró.',
        },
        {
          title: 'Negocios de nicho con catálogo amplio',
          description:
            'Refacciones, materiales, productos especializados o importados con cientos de variantes. La estructura del catálogo, los filtros y la búsqueda se diseñan para lo que vendes.',
        },
        {
          title: 'Mayoristas que venden a tiendas y negocios',
          description:
            'Con precios por cliente, pedidos mínimos y crédito. Un portal donde el cliente repite su pedido, ve su saldo y descarga facturas sin llamar a tu vendedor.',
        },
      ],
    },
    problems: {
      title: 'Lo que cuesta vender solo por marketplace o plantilla',
      items: [
        'La comisión del marketplace se lleva el margen y el cliente es de ellos, no tuyo',
        'La plataforma de renta no maneja precios por cliente ni pedidos al mayoreo',
        'Facturar cada venta es un proceso manual aparte',
        'El inventario de la tienda y del almacén no coinciden',
        'Los envíos a provincia se cotizan uno por uno',
        'No puedes conectar tu sistema de inventario ni tu punto de venta',
      ],
    },
    solutions: {
      title: 'Qué incluye una tienda propia con imSoft',
      items: [
        {
          title: 'Catálogo diseñado para tus productos',
          description:
            'Variantes, filtros, búsqueda y fichas pensadas para tu nicho, no una plantilla genérica. Carga masiva de productos desde el panel.',
        },
        {
          title: 'Pagos y facturación integrados',
          description:
            'Tarjeta con meses sin intereses, SPEI y efectivo mediante Stripe o Mercado Pago. CFDI automático o a solicitud del cliente, con sus datos fiscales guardados.',
        },
        {
          title: 'Envíos a todo México y entrega en la ciudad',
          description:
            'Guías con paqueterías nacionales, reglas por zona y opción de entrega el mismo día dentro de la ciudad si la manejas con tu propio equipo.',
        },
        {
          title: 'Sin comisiones y con tus datos',
          description:
            'Pagas el desarrollo una vez y la tienda, los clientes y las ventas son tuyos. Solo pagas los costos reales de hosting y pasarela, que son públicos.',
        },
      ],
    },
    proof: {
      title: 'Ecommerce que ya venden',
      description: 'Tiendas del portafolio que puedes abrir. Somos de Guadalajara y no publicamos la ubicación de cada cliente.',
      items: [
        { name: 'Oro Nacional', description: 'Ecommerce de joyería enfocado en mostrar producto y aumentar ventas.', slug: 'national-gold' },
        { name: 'LC Suplements', description: 'Tienda de suplementos deportivos con catálogo de proteínas, creatinas y vitaminas.', slug: 'lc-suplements' },
        { name: 'Starfilters', description: 'Ecommerce de filtros y soluciones industriales con catálogo técnico.', slug: 'starfilters' },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Conviene salir del marketplace?',
          answer: 'No salir: complementar. El marketplace trae tráfico que no tienes; la tienda propia recupera margen, te da los datos del cliente y te permite vender de nuevo sin comisión. Muchas marcas usan ambos y mueven a los clientes recurrentes a su tienda.',
        },
        {
          question: '¿Cuánto cuesta una tienda en línea en CDMX?',
          answer: 'Una tienda con catálogo, pagos y envíos se cotiza como un sitio corporativo con módulos adicionales; una con precios por cliente, inventario sincronizado y facturación automática se acerca a un sistema a la medida. El precio cerrado te lo damos en 48 horas.',
        },
        {
          question: '¿Pueden migrar los productos de mi tienda actual?',
          answer: 'Sí. Exportamos catálogo, clientes y pedidos de Shopify, WooCommerce o Tiendanube y los cargamos en la tienda nueva. Las URL de producto se redirigen para no perder el posicionamiento que ya tienes.',
        },
        {
          question: '¿Trabajan con negocios de la Ciudad de México a distancia?',
          answer: 'Sí. Estamos en Guadalajara y trabajamos a distancia con clientes de todo el país. Todo el proceso se hace por videollamada y en línea, y la tienda se prueba desde tu navegador antes de salir.',
        },
      ],
    },
    relatedPosts: ['cuanto-cuesta-una-pagina-web-en-mexico'],
    cta: {
      title: '¿Vemos tu catálogo?',
      description: `Cuéntanos qué vendes, dónde vendes hoy y qué te frena. Te decimos si conviene tienda propia y cuánto costaría. ${HORARIO}`,
      buttonText: 'Pedir cotización',
    },
  },
};

export const CITY_SERVICES: Record<CityKey, Partial<Record<CityServiceSlug, CityServiceContent>>> = {
  guadalajara: GUADALAJARA,
  monterrey: MONTERREY,
  cdmx: CDMX,
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
