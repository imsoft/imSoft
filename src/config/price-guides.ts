/**
 * "Cuanto cuesta" pages: they answer the price searches Google autocomplete suggests in
 * Mexico (2026-09-26). Web page and app are already answered by two blog posts (the app
 * one was already at position 15): a new guide with the same question would take strength
 * away from them, so those link to the post. "Cuanto cuesta un software para una empresa"
 * and "cuanto cuesta una tienda en linea en mexico" had no page and get a guide.
 *
 * Online store: $9,999 MXN minimum set by Brandon (2026-09-28) for a basic store from a
 * template; the three full stores in the portfolio were $19,000 to $60,000 MXN. The range
 * is published, without saying what each client paid.
 *
 * Rules: only prices published on the site (pricing section), real portfolio projects and
 * no market figures without a source. They reuse the city landing format
 * (CityServiceContent) and its component.
 */
import type { CityServiceContent, CityServiceSlug } from './city-services';

export type PriceGuideSlug = 'software-a-la-medida' | 'tienda-en-linea';

export const PRICE_GUIDE_SLUGS: PriceGuideSlug[] = ['software-a-la-medida', 'tienda-en-linea'];

const OPENING_HOURS = 'Atendemos de lunes a sábado de 9:00 a 18:00, y los domingos de 9:00 a 13:00.';

export const PRICE_GUIDES: Record<PriceGuideSlug, CityServiceContent> = {
  'software-a-la-medida': {
    seoTitle: '¿Cuánto cuesta un software a la medida para una empresa?',
    seoDescription:
      'Cuánto cuesta un software para una empresa en México: primer sistema desde $60,000 y plataforma a la medida desde $150,000 MXN. Precio fijo, código tuyo.',
    h1: '¿Cuánto cuesta un software a la medida para una empresa?',
    heroSubtitle:
      'Con nosotros, un primer sistema para tu operación cuesta desde $60,000 MXN y una plataforma a la medida desde $150,000 MXN, a precio fijo. Aquí te explicamos cómo se forma ese precio, cómo compararlo contra pagar licencias cada mes y cómo empezar sin arriesgar todo el presupuesto.',
    audience: {
      title: 'Qué define el costo de un software a la medida',
      items: [
        {
          title: 'Cuántos procesos cubre',
          description:
            'Un sistema que resuelve un solo proceso, como pedidos o inventario, es más acotado que uno que junta ventas, operación, facturación y reportes. Lo más sano es empezar por el proceso que más duele.',
        },
        {
          title: 'Usuarios, roles y permisos',
          description:
            'Si entran vendedores, almacén, dirección y clientes, cada uno ve cosas distintas. Diseñar y probar esos permisos es parte importante del trabajo.',
        },
        {
          title: 'Integraciones con lo que ya usas',
          description:
            'Conectarse con tu sistema contable, el SAT para facturar, un ERP, bancos o paqueterías suma trabajo. A veces es lo que más valor da, porque elimina capturar lo mismo dos veces.',
        },
        {
          title: 'Datos que hay que migrar',
          description:
            'Pasar años de información desde hojas de Excel o un sistema viejo requiere limpiarla y validarla. Si no se planea desde la cotización, es donde aparecen los costos inesperados.',
        },
      ],
    },
    problems: {
      title: 'Señales de que tu empresa ya necesita un software propio',
      items: [
        'La operación vive en hojas de Excel que solo una persona entiende',
        'Capturan la misma información en dos o tres sistemas distintos',
        'Pagas licencias por usuario de un programa que usas a medias',
        'Cada cierre de mes alguien junta los números de varias áreas para armar el reporte',
        'Los clientes llaman para preguntar el estado de algo que ya está en tus datos',
        'Crecer significa contratar más gente para tareas que se podrían automatizar',
      ],
    },
    solutions: {
      title: 'Cómo cotizamos un software a la medida en imSoft',
      items: [
        {
          title: 'Empezamos por un proceso',
          description:
            'Elegimos el proceso que más tiempo o dinero te cuesta y lo resolvemos primero. En 6 a 8 semanas tienes algo funcionando y decides la siguiente etapa con resultados a la vista.',
        },
        {
          title: 'Precio fijo por etapa',
          description:
            'Cada etapa tiene alcance y precio por escrito. Sabes cuánto vas a invertir antes de empezar y no pagas horas abiertas.',
        },
        {
          title: 'El código es tuyo, sin licencias',
          description:
            'No pagas renta por usuario. El código queda a nombre de tu empresa y puedes seguir con nosotros o con otro equipo.',
        },
        {
          title: 'Hecho según tu operación',
          description:
            'No adaptamos tu empresa a un programa genérico: el sistema sigue cómo trabajan ustedes, y eso reduce la resistencia del equipo a usarlo.',
        },
      ],
    },
    pricing: {
      title: 'Nuestros precios de referencia',
      description: 'Precios publicados, en pesos mexicanos. El precio de cada etapa se fija por escrito antes de empezar.',
      items: [
        { name: 'Primer sistema o MVP', price: 'Desde $60,000 MXN', includes: 'Un proceso resuelto de punta a punta en 6 a 8 semanas, con usuarios, panel y el primer mes de soporte.' },
        { name: 'Plataforma a la medida', price: 'Desde $150,000 MXN', includes: 'Varios procesos, roles e integraciones, arquitectura propia y plan de etapas.' },
      ],
      note: 'Para comparar contra un software de licencia, suma lo que pagarías en mensualidades durante tres a cinco años por todos tus usuarios, más lo que cuesta adaptarlo.',
    },
    proof: {
      title: 'Sistemas que hicimos para empresas',
      description: 'Software del portafolio que ya usan equipos en su operación diaria.',
      items: [
        { name: 'JTP Logistics · Inventario', description: 'Sistema de control de inventario interno de una empresa de logística.', slug: 'jtp-logistics-inventory' },
        { name: 'Steridental · Pedidos', description: 'Aplicación con la que los clientes de un laboratorio generan sus pedidos.', slug: 'steridantal-order-generator' },
        { name: 'The PodStore', description: 'Aplicación para ordenar los procesos internos de una empresa de servicios.', slug: 'the-podstore' },
        { name: 'Wellpoint', description: 'Plataforma para centralizar servicios de salud, profesionales y centros wellness.', slug: 'wellpoint' },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes sobre el costo de un software',
      items: [
        {
          question: '¿Qué sale más caro, un software a la medida o uno de licencia?',
          answer:
            'Al inicio, casi siempre el de licencia es más barato. Con los años, las mensualidades por usuario, los módulos extra y lo que cuesta adaptar tu operación al programa pueden superar el costo de uno propio. Conviene hacer la cuenta a tres o cinco años con tu número real de usuarios.',
        },
        {
          question: '¿Cuánto tarda desarrollar un software para mi empresa?',
          answer:
            'La primera etapa, con un proceso funcionando, toma de 6 a 8 semanas. Una plataforma completa se construye por etapas a lo largo de varios meses, y desde la primera ya la estás usando.',
        },
        {
          question: '¿Qué pasa si después quiero cambiar algo?',
          answer:
            'Los cambios nuevos se cotizan aparte, con precio fijo, y tú decides si los haces. El primer mes de soporte va incluido; después puedes contratar una iguala mensual si quieres mejoras continuas.',
        },
        {
          question: '¿Se puede facturar y pagar en partes?',
          answer:
            'Sí. Cada etapa se paga en partes, por transferencia o con tarjeta, y emitimos CFDI por cada pago.',
        },
        {
          question: '¿Y si ya tengo un sistema que no funciona bien?',
          answer:
            'Revisamos qué se puede rescatar. A veces conviene migrar los datos a uno nuevo y a veces basta con construir lo que le falta alrededor del que ya tienes.',
        },
      ],
    },
    cta: {
      title: '¿Cuánto costaría el software de tu empresa?',
      description: `En una llamada de 15 minutos vemos qué proceso conviene resolver primero y en 24 horas te mandamos el precio fijo de esa etapa. ${OPENING_HOURS}`,
      buttonText: 'Pedir cotización',
    },
  },
  'tienda-en-linea': {
    seoTitle: '¿Cuánto cuesta una tienda en línea en México? Precios 2026',
    seoDescription:
      'Cuánto cuesta una tienda en línea en México: desde $9,999 MXN. Qué sube el precio, comisiones, envíos y cuándo conviene Shopify o una tienda propia.',
    h1: '¿Cuánto cuesta una tienda en línea en México?',
    heroSubtitle:
      'Con nosotros, una tienda en línea básica cuesta desde $9,999 MXN, a precio fijo, y las tiendas completas que hemos entregado van de $19,000 a $60,000 MXN según el tamaño del catálogo y lo que tienen que hacer. Aquí te explicamos qué mueve ese precio, qué gastos tiene una tienda cuando ya está vendiendo y cómo decidir entre una plataforma de renta y una tienda propia.',
    audience: {
      title: 'Qué hace que una tienda en línea cueste más o menos',
      items: [
        {
          title: 'Cuántos productos y variantes',
          description:
            'Una tienda con 30 productos no es lo mismo que una con 2,000 artículos en tallas, colores o medidas. Más catálogo significa más filtros, más búsqueda y más trabajo para cargar y ordenar la información.',
        },
        {
          title: 'Cómo cobras y cómo envías',
          description:
            'Pago con tarjeta, meses sin intereses, pago en OXXO o transferencia, y envíos con tarifa fija o calculada por paquetería. Cada opción se configura y se prueba con compras reales antes de abrir.',
        },
        {
          title: 'Si le vendes a empresas',
          description:
            'Una tienda para mayoristas o compradores industriales suele necesitar catálogo técnico, precios por cliente y solicitud de cotización en lugar de carrito. Es más trabajo que una tienda para el público.',
        },
        {
          title: 'Conexión con tu inventario y tu facturación',
          description:
            'Si las existencias viven en tu sistema de punto de venta o en un ERP, o si quieres que cada venta genere su CFDI, esas integraciones son muchas veces la parte más valiosa y también la que más suma al precio.',
        },
      ],
    },
    problems: {
      title: 'Gastos de una tienda que conviene sumar desde el inicio',
      items: [
        'La comisión de la pasarela de pago en cada venta',
        'El costo de las guías de paquetería, o cuánto de eso absorbes tú',
        'Fotos de producto: sin buenas fotos, el mejor diseño no vende',
        'Cargar y mantener al día el catálogo, precios y existencias',
        'Renovación anual de dominio y hosting',
        'Mensualidades y apps extra si la tienda vive en una plataforma de renta',
      ],
    },
    solutions: {
      title: 'Cómo cotizamos una tienda en línea en imSoft',
      items: [
        {
          title: 'Precio fijo según tu catálogo',
          description:
            'En una llamada de 15 minutos vemos cuántos productos tienes, cómo cobras y cómo envías. En 24 horas te mandamos el precio fijo por escrito, y no cambia durante el proyecto.',
        },
        {
          title: 'Tienda propia, sin comisión nuestra',
          description:
            'La tienda y el código quedan a tu nombre. No cobramos porcentaje de tus ventas; solo pagas la comisión de la pasarela que elijas.',
        },
        {
          title: 'Imagen de marca que genera confianza',
          description:
            'Un comprador que no te conoce decide en segundos si confía en tu tienda. Diseñamos el sitio con tu identidad, con páginas de preguntas frecuentes y de quiénes son, para que la primera compra no se quede en el carrito.',
        },
        {
          title: 'Pagos en partes',
          description:
            'Lo habitual es 50 % al iniciar y 50 % al entregar, por transferencia o con tarjeta. Emitimos CFDI por cada pago.',
        },
      ],
    },
    pricing: {
      title: 'Nuestros precios de referencia',
      description: 'Precio publicado, en pesos mexicanos. El precio final se fija por escrito antes de empezar.',
      items: [
        { name: 'Tienda en línea básica', price: 'Desde $9,999 MXN', includes: 'Tienda básica con plantilla personalizada: catálogo por categorías, carrito, pago en línea y panel para administrar productos y pedidos.' },
      ],
      note: 'Las tiendas completas que hemos entregado van de $19,000 a $60,000 MXN. Lo que más sube el precio es el tamaño del catálogo, un diseño propio en lugar de plantilla, vender a empresas y conectar la tienda con tu inventario o tu facturación.',
    },
    proof: {
      title: 'Tiendas en línea que hicimos',
      description: 'Tiendas del portafolio, de tamaños y giros distintos, que puedes abrir y revisar.',
      items: [
        { name: 'LC Suplements', description: 'Tienda de suplementos deportivos con catálogo por categorías, lista de deseos, búsqueda y envíos a todo México.', slug: 'lc-suplements' },
        { name: 'Oro Nacional', description: 'Tienda de joyería con imagen premium para vender fuera de la tienda física.', slug: 'national-gold' },
        { name: 'Starfilters', description: 'Tienda de filtros industriales con catálogo técnico para compradores de empresas.', slug: 'starfilters' },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes sobre el precio de una tienda en línea',
      items: [
        {
          question: '¿Me conviene Shopify o una tienda propia?',
          answer:
            'Una plataforma de renta es rápida para empezar, pero pagas mensualidad, apps adicionales y, según el plan, comisiones, y la tienda no es tuya. Una tienda propia cuesta más al inicio y se paga una vez. Si vas a vender de forma constante o necesitas algo que la plataforma no hace, la propia suele salir mejor a mediano plazo.',
        },
        {
          question: '¿Cuánto cobran por cada venta?',
          answer:
            'Nosotros nada. La pasarela sí cobra una comisión por cobro; en Stripe México es 3.6 % más $3 MXN e IVA por venta con tarjeta, y los meses sin intereses tienen un costo adicional que puedes absorber o trasladar.',
        },
        {
          question: '¿Qué necesito tener listo para empezar?',
          answer:
            'La lista de productos con precios, fotos y descripciones, cómo vas a enviar y qué formas de pago quieres aceptar. Si no tienes todo, lo definimos juntos en la primera llamada.',
        },
        {
          question: '¿Puedo administrar los productos yo mismo?',
          answer:
            'Sí. La tienda incluye un panel para dar de alta productos, cambiar precios y existencias y ver pedidos, sin depender de nosotros para cada cambio.',
        },
        {
          question: '¿Puedo pagar la tienda a meses sin intereses?',
          answer:
            'Sí, con tarjetas de crédito mexicanas mediante un enlace de pago. También aceptamos transferencia.',
        },
      ],
    },
    cta: {
      title: '¿Cuánto costaría tu tienda en línea?',
      description: `Cuéntanos qué vendes y cuántos productos tienes, y en 24 horas te mandamos el precio fijo por escrito. ${OPENING_HOURS}`,
      buttonText: 'Pedir cotización',
    },
  },
};

export function priceGuide(slug: string): CityServiceContent | null {
  return (PRICE_GUIDES as Record<string, CityServiceContent>)[slug] ?? null;
}

export function priceGuideHref(lang: string, slug: PriceGuideSlug): string {
  return `/${lang}/cuanto-cuesta/${slug}`;
}

/** Page that answers "cuanto cuesta" for each city-landing service. */
export const SERVICE_PRICE_GUIDE: Record<CityServiceSlug, { name: string; href: string }> = {
  'paginas-web': { name: '¿Cuánto cuesta una página web en México?', href: '/es/blog/cuanto-cuesta-una-pagina-web-en-mexico' },
  'desarrollo-de-apps': { name: '¿Cuánto cuesta desarrollar una app en México?', href: '/es/blog/cuanto-cuesta-desarrollar-una-app-en-mexico' },
  'empresas-de-software': { name: '¿Cuánto cuesta un software a la medida para una empresa?', href: '/es/cuanto-cuesta/software-a-la-medida' },
  'tiendas-en-linea': { name: '¿Cuánto cuesta una tienda en línea en México?', href: '/es/cuanto-cuesta/tienda-en-linea' },
};

export function servicePriceGuide(slug: CityServiceSlug): { name: string; href: string } | null {
  return SERVICE_PRICE_GUIDE[slug] ?? null;
}
