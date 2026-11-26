/**
 * Sample websites for fictitious businesses, shown to prospects who have no website
 * ("¿Les mando un ejemplo?"). They live at /es/demo/<slug>, are not indexed, and every
 * call to action goes to imSoft's WhatsApp with a message that says which sample the
 * person saw, so the conversation starts with that context.
 *
 * All of them render with the same template (src/components/demo/demo-site.tsx); a new
 * industry is one more entry here. Photos come from Unsplash, whose license allows
 * commercial use.
 */
import type { DemoFont } from '@/components/demo/fonts'

export const IMSOFT_WHATSAPP = '523325365558'

export type DemoIcon = 'sparkles' | 'smile' | 'gem' | 'heart' | 'shield' | 'stethoscope' | 'utensils' | 'truck' | 'calendar' | 'hammer' | 'ruler' | 'home' | 'scale' | 'briefcase' | 'file' | 'users' | 'wrench' | 'paint' | 'zap' | 'key'

export interface DemoSite {
  /** Industry with its article, as it reads in "la página de ejemplo del taller mecánico". */
  label: string
  title: string
  font: DemoFont
  /** `round`: soft corners and pills. `square`: hard edges. */
  shape: 'round' | 'square'
  /** `split`: text beside a framed photo. `full`: photo behind the text. */
  hero: 'split' | 'full'
  colors: {
    bg: string
    fg: string
    accent: string
    accentFg: string
    /** Background of the dark band (services). */
    band: string
    bandFg: string
    /** Background of the soft band (reviews). */
    soft: string
    /** Highlight over the hero photo when `accent` is too dark to read there. */
    heroAccent?: string
  }
  /** Name of the services section in the menu and buttons ("Servicios", "Menú"…). */
  servicesNav?: string
  name: string
  tagline: string
  eyebrow: string
  /** Headline; the part between *asterisks* gets the accent color. */
  headline: string
  lead: string
  cta: string
  ctaShort: string
  rating: string
  reviewCount: number
  heroImage: string
  heroAlt: string
  servicesTitle: string
  servicesLead: string
  services: { name: string; text: string; icon?: DemoIcon; price?: string }[]
  about: { eyebrow: string; title: string; text: string; images: [string, string]; alts: [string, string]; stats: [string, string][] }
  steps?: { title: string; text: string }[]
  gallery?: { id: string; alt: string }[]
  reviewsTitle: string
  reviews: { name: string; text: string }[]
  address: string
  mapQuery: string
  hours: [string, string][]
}

export const DEMO_SITES = {
  'consultorio-dental': {
    label: 'del consultorio dental',
    title: 'Dental Alba · Odontología integral en Guadalajara',
    font: 'serif',
    shape: 'round',
    hero: 'split',
    colors: { bg: '#fbf8f3', fg: '#1d2b2a', accent: '#2f7d73', accentFg: '#ffffff', band: '#1d2b2a', bandFg: '#fbf8f3', soft: '#efe6d8' },
    name: 'Dental Alba',
    tagline: 'Odontología integral',
    eyebrow: 'Chapultepec · Guadalajara',
    headline: 'Una sonrisa sana, *sin prisas* ni sustos.',
    lead: 'Consultorio familiar con más de 12 años cuidando dientes en Guadalajara. Te explicamos todo antes de empezar y el presupuesto va por escrito.',
    cta: 'Agenda tu valoración sin costo',
    ctaShort: 'Agendar cita',
    rating: '4.9',
    reviewCount: 186,
    heroImage: '1629909613654-28e377c37b09',
    heroAlt: 'Consultorio dental luminoso',
    servicesTitle: 'Todo lo que tu boca necesita, *en un solo lugar*.',
    servicesLead: 'Primera valoración sin costo y plan de pagos en tratamientos largos.',
    services: [
      { icon: 'sparkles', name: 'Limpieza dental', text: 'Profilaxis con ultrasonido y pulido. Sales en 40 minutos con la boca como nueva.' },
      { icon: 'smile', name: 'Ortodoncia invisible', text: 'Alineadores transparentes con revisión mensual y plan de pagos.' },
      { icon: 'gem', name: 'Blanqueamiento', text: 'Tratamiento en consultorio con luz LED, sin sensibilidad.' },
      { icon: 'heart', name: 'Endodoncia', text: 'Tratamiento de conductos con anestesia controlada y sin dolor.' },
      { icon: 'shield', name: 'Resinas y coronas', text: 'Restauraciones del color de tu diente, hechas para durar.' },
      { icon: 'stethoscope', name: 'Implantes', text: 'Valoración con radiografía digital y presupuesto por escrito.' },
    ],
    about: {
      eyebrow: 'Nosotros',
      title: 'La Dra. Alba Ríos y su equipo te atienden de principio a fin.',
      text: 'Cirujana dentista por la Universidad de Guadalajara, con especialidad en ortodoncia. Usamos radiografía digital, material esterilizado en cada cita y te mandamos recordatorio por WhatsApp un día antes.',
      images: ['1588776814546-1ffcf47267a5', '1609840114035-3c981b782dfe'],
      alts: ['Dentista revisando una radiografía', 'Paciente con alineadores transparentes'],
      stats: [['12', 'años de experiencia'], ['+3,000', 'pacientes atendidos'], ['4.9', 'en Google']],
    },
    reviewsTitle: 'Lo que dicen nuestros pacientes',
    reviews: [
      { name: 'Mariana G.', text: 'Me daban pánico los dentistas y aquí por fin me sentí tranquila. Todo me lo explicaron antes de empezar.' },
      { name: 'Jorge R.', text: 'Agendé por WhatsApp un sábado y me atendieron a la hora. El consultorio está impecable.' },
      { name: 'Lucía P.', text: 'Llevo a mis dos hijos desde hace años. La doctora tiene una paciencia increíble con ellos.' },
    ],
    address: 'Av. Chapultepec, col. Americana, Guadalajara, Jal.',
    mapQuery: 'Av. Chapultepec, Americana, Guadalajara',
    hours: [['Lunes a viernes', '9:00 – 19:00'], ['Sábado', '9:00 – 14:00'], ['Domingo', 'Cerrado']],
  },

  'taller-mecanico': {
    label: 'del taller mecánico',
    title: 'Taller Ledesma · Mecánica automotriz en Zapopan',
    font: 'condensed',
    shape: 'square',
    hero: 'full',
    colors: { bg: '#111111', fg: '#f2f0ea', accent: '#ffc531', accentFg: '#111111', band: '#ffc531', bandFg: '#111111', soft: '#1a1a1a' },
    name: 'Taller Ledesma',
    tagline: 'Mecánica automotriz',
    eyebrow: 'Desde 1998 en Zapopan',
    headline: 'Tu coche en manos *de confianza*',
    lead: 'Mecánica general, frenos, suspensión y diagnóstico por computadora. Te damos el precio antes de empezar y te mandamos fotos del avance.',
    cta: 'Cotiza por WhatsApp',
    ctaShort: 'Cotizar',
    rating: '4.8',
    reviewCount: 240,
    heroImage: '1625047509168-a7026f36de04',
    heroAlt: 'Mecánico revisando el motor de una camioneta',
    servicesTitle: 'Servicios',
    servicesLead: 'Revisión sin costo mientras esperas.',
    services: [
      { name: 'Afinación mayor y menor', text: 'Bujías, filtros, limpieza de inyectores y escaneo. Te decimos el precio antes de tocar el coche.' },
      { name: 'Frenos', text: 'Balatas, discos y líquido. Revisión gratis mientras esperas.' },
      { name: 'Suspensión y dirección', text: 'Amortiguadores, rótulas, terminales y alineación.' },
      { name: 'Cambio de aceite', text: 'Aceite sintético o convencional con filtro, en 30 minutos.' },
      { name: 'Diagnóstico por computadora', text: 'Leemos los códigos del tablero y te explicamos qué tiene, sin rodeos.' },
      { name: 'Clutch y transmisión', text: 'Kit de clutch, volante y revisión de caja estándar o automática.' },
    ],
    about: {
      eyebrow: 'El taller',
      title: 'Tres generaciones arreglando coches en la misma esquina.',
      text: 'Don Ramón abrió el taller en 1998 y hoy lo atienden sus hijos. Trabajamos con refacciones de marca, te enseñamos la pieza que cambiamos y te damos garantía por escrito.',
      images: ['1619642751034-765dfdf7c58e', '1530046339160-ce3e530c7d2f'],
      alts: ['Mecánico ajustando una pieza del motor', 'Pared de herramientas del taller'],
      stats: [['+25', 'años en Zapopan'], ['6 meses', 'de garantía'], ['4.8', 'en Google']],
    },
    steps: [
      { title: 'Escríbenos', text: 'Mándanos por WhatsApp el modelo y qué le pasa a tu coche.' },
      { title: 'Te cotizamos', text: 'Te damos un precio claro antes de empezar. Sin sorpresas.' },
      { title: 'Lo dejamos listo', text: 'Te mandamos fotos del avance y te avisamos cuando esté.' },
    ],
    gallery: [
      { id: '1487754180451-c456f719a1fc', alt: 'Cambio de aceite' },
      { id: '1530046339160-ce3e530c7d2f', alt: 'Herramientas del taller' },
      { id: '1619642751034-765dfdf7c58e', alt: 'Reparación de motor' },
    ],
    reviewsTitle: 'Clientes que regresan',
    reviews: [
      { name: 'Carlos M.', text: 'Honestos de verdad: me dijeron que solo eran las balatas cuando en otro lado me querían cambiar todo.' },
      { name: 'Ana V.', text: 'Me mandaron fotos de la pieza dañada por WhatsApp. Así da gusto dejar el coche.' },
      { name: 'Ricardo S.', text: 'Afinación lista el mismo día y a buen precio. Ya llevo tres años con ellos.' },
    ],
    address: 'Av. Guadalupe, col. Chapalita, Zapopan, Jal.',
    mapQuery: 'Av. Guadalupe, Chapalita, Zapopan',
    hours: [['Lunes a viernes', '8:30 – 18:30'], ['Sábado', '8:30 – 14:00'], ['Domingo', 'Cerrado']],
  },

  restaurante: {
    label: 'del restaurante',
    title: 'La Mesa de Tita · Cocina tapatía en Guadalajara',
    font: 'warm',
    shape: 'round',
    hero: 'full',
    colors: { bg: '#fff8ee', fg: '#2b1a12', accent: '#c2410c', accentFg: '#ffffff', band: '#2b1a12', bandFg: '#fff8ee', soft: '#f6e7d2', heroAccent: '#fdba74' },
    servicesNav: 'Menú',
    name: 'La Mesa de Tita',
    tagline: 'Cocina tapatía',
    eyebrow: 'Santa Tere · Guadalajara',
    headline: 'Sabor de casa, *hecho al momento*.',
    lead: 'Tacos, tortas ahogadas y guisos del día con recetas de la abuela Tita. Come aquí, pide para llevar o recibe a domicilio.',
    cta: 'Haz tu pedido por WhatsApp',
    ctaShort: 'Pedir',
    rating: '4.7',
    reviewCount: 412,
    heroImage: '1599974579688-8dbdd335c77f',
    heroAlt: 'Tacos de barbacoa con cilantro y cebolla',
    servicesTitle: 'Lo más pedido',
    servicesLead: 'Menú completo y precios en el WhatsApp. Envío gratis en pedidos de más de $350.',
    services: [
      { name: 'Torta ahogada', text: 'Birote salado, carnitas y salsa de jitomate con chile de árbol al gusto.', price: '$85' },
      { name: 'Orden de tacos de barbacoa', text: 'Cinco tacos con consomé, cebolla, cilantro y limón.', price: '$110' },
      { name: 'Carne en su jugo', text: 'Con frijoles de la olla, tocino, cebollitas asadas y tortillas hechas a mano.', price: '$145' },
      { name: 'Pozole rojo', text: 'Jueves y fines de semana. Plato grande con tostadas y crema.', price: '$120' },
      { name: 'Enchiladas tapatías', text: 'Bañadas en salsa de chile guajillo, con lechuga y papa con zanahoria.', price: '$115' },
      { name: 'Agua fresca del día', text: 'Jamaica, horchata o la de temporada, en litro.', price: '$40' },
    ],
    about: {
      eyebrow: 'Nuestra historia',
      title: 'Empezamos con cuatro mesas y la cazuela de la abuela.',
      text: 'Desde 2009 cocinamos todos los días con ingredientes del mercado. Hacemos eventos, pedidos para oficina y comida para llevar los siete días de la semana.',
      images: ['1565299585323-38d6b0865b47', '1552566626-52f8b828add9'],
      alts: ['Tacos recién servidos con limón', 'Interior del restaurante'],
      stats: [['2009', 'abrimos'], ['7 días', 'a la semana'], ['4.7', 'en Google']],
    },
    gallery: [
      { id: '1551504734-5ee1c4a1479b', alt: 'Plato de tacos' },
      { id: '1555396273-367ea4eb4db5', alt: 'Comedor del restaurante' },
      { id: '1565299585323-38d6b0865b47', alt: 'Tacos con limón' },
    ],
    reviewsTitle: 'Lo que dicen nuestros comensales',
    reviews: [
      { name: 'Paola H.', text: 'La torta ahogada está como debe ser. Pedimos a domicilio y llegó calientita.' },
      { name: 'Miguel A.', text: 'La carne en su jugo es de las mejores que he probado en Guadalajara. Porciones generosas.' },
      { name: 'Fernanda L.', text: 'Hicimos el cumpleaños de mi papá aquí y nos atendieron increíble. Ya reservamos para Navidad.' },
    ],
    address: 'C. José Clemente Orozco, col. Santa Teresita, Guadalajara, Jal.',
    mapQuery: 'José Clemente Orozco, Santa Teresita, Guadalajara',
    hours: [['Lunes a sábado', '8:00 – 18:00'], ['Domingo', '8:00 – 16:00']],
  },

  ferreteria: {
    label: 'de la ferretería',
    title: 'Ferretería Monteverde · Material y herramienta en Zapopan',
    font: 'condensed',
    shape: 'square',
    hero: 'split',
    colors: { bg: '#f4f1ea', fg: '#1b1b1b', accent: '#d62d20', accentFg: '#ffffff', band: '#1b1b1b', bandFg: '#f4f1ea', soft: '#e8e2d5' },
    name: 'Ferretería Monteverde',
    tagline: 'Material y herramienta',
    eyebrow: 'Zapopan · Desde 1992',
    headline: 'Lo que tu obra necesita, *hoy mismo*.',
    lead: 'Herramienta, material eléctrico, plomería, pintura y tornillería. Cotiza por WhatsApp y te lo apartamos o te lo llevamos a tu obra.',
    cta: 'Cotiza por WhatsApp',
    ctaShort: 'Cotizar',
    rating: '4.6',
    reviewCount: 158,
    heroImage: '1586864387967-d02ef85d93e8',
    heroAlt: 'Martillo sobre una mesa de madera',
    servicesTitle: 'Todo en un solo lugar',
    servicesLead: 'Precios de mayoreo para contratistas y entrega en obra en la zona metropolitana.',
    services: [
      { icon: 'hammer', name: 'Herramienta', text: 'Manual y eléctrica de las marcas que conoces, con garantía.' },
      { icon: 'zap', name: 'Material eléctrico', text: 'Cable, contactos, centros de carga y lámparas.' },
      { icon: 'wrench', name: 'Plomería', text: 'Tubería, conexiones, llaves, tinacos y bombas.' },
      { icon: 'paint', name: 'Pintura', text: 'Vinílica, esmalte e impermeabilizante. Igualamos tu color.' },
      { icon: 'key', name: 'Duplicado de llaves', text: 'Llaves sencillas y de seguridad al momento.' },
      { icon: 'truck', name: 'Entrega en obra', text: 'Te llevamos el material el mismo día en pedidos antes de la 1 p. m.' },
    ],
    about: {
      eyebrow: 'La ferretería',
      title: 'Atendidos por gente que sabe de obra.',
      text: 'Llevamos más de 30 años surtiendo a familias, maestros de obra y contratistas de Zapopan. Si no sabes qué pieza necesitas, mándanos una foto y te decimos.',
      images: ['1581783898377-1c85bf937427', '1530124566582-a618bc2615dc'],
      alts: ['Herramientas sobre fondo blanco', 'Pinzas y herramienta de mano'],
      stats: [['+30', 'años en Zapopan'], ['+8,000', 'productos'], ['4.6', 'en Google']],
    },
    steps: [
      { title: 'Manda tu lista', text: 'Escríbenos por WhatsApp lo que necesitas o una foto de la pieza.' },
      { title: 'Te cotizamos', text: 'Te respondemos con precio y existencia en minutos.' },
      { title: 'Recoge o recibe', text: 'Pasa por él ya apartado o te lo llevamos a tu obra.' },
    ],
    reviewsTitle: 'Clientes de toda la vida',
    reviews: [
      { name: 'Ing. Roberto C.', text: 'Les mando la lista por WhatsApp en la mañana y a mediodía ya tengo el material en la obra.' },
      { name: 'Laura S.', text: 'Les enseñé una foto de la llave que se me rompió y me dieron la pieza exacta. Muy amables.' },
      { name: 'Don Javier', text: 'Precios justos y siempre tienen lo que busco. Voy desde hace más de diez años.' },
    ],
    address: 'Av. Ávila Camacho, col. Jardines del Country, Zapopan, Jal.',
    mapQuery: 'Av. Ávila Camacho, Jardines del Country, Guadalajara',
    hours: [['Lunes a viernes', '8:00 – 19:00'], ['Sábado', '8:00 – 15:00'], ['Domingo', 'Cerrado']],
  },

  constructora: {
    label: 'de la constructora',
    title: 'Basalto Construcciones · Construcción y remodelación en Guadalajara',
    font: 'grotesk',
    shape: 'square',
    hero: 'full',
    colors: { bg: '#f2f2f0', fg: '#141414', accent: '#f26b1d', accentFg: '#ffffff', band: '#141414', bandFg: '#f2f2f0', soft: '#e4e3df' },
    name: 'Basalto',
    tagline: 'Construcciones',
    eyebrow: 'Construcción y remodelación',
    headline: 'Construimos tu proyecto *a tiempo y sin sorpresas*.',
    lead: 'Casas, locales y remodelaciones en la zona metropolitana de Guadalajara. Presupuesto detallado, avance semanal con fotos y un solo responsable de principio a fin.',
    cta: 'Pide tu presupuesto',
    ctaShort: 'Presupuesto',
    rating: '4.9',
    reviewCount: 64,
    heroImage: '1600585154340-be6161a56a0c',
    heroAlt: 'Casa moderna terminada con jardín',
    servicesTitle: 'Qué hacemos',
    servicesLead: 'Visita a tu terreno o inmueble sin costo dentro de la zona metropolitana.',
    services: [
      { icon: 'home', name: 'Casa habitación', text: 'Desde el proyecto y los permisos hasta la entrega de llaves.' },
      { icon: 'ruler', name: 'Proyecto arquitectónico', text: 'Planos, renders y presupuesto por etapas antes de empezar.' },
      { icon: 'paint', name: 'Remodelaciones', text: 'Cocinas, baños, fachadas y ampliaciones con tiempos claros.' },
      { icon: 'briefcase', name: 'Locales y oficinas', text: 'Adecuaciones comerciales trabajando en horarios que no frenen tu negocio.' },
      { icon: 'hammer', name: 'Obra civil', text: 'Bardas, losas, cimentación e impermeabilización.' },
      { icon: 'file', name: 'Permisos y trámites', text: 'Licencias de construcción y alineamiento ante el municipio.' },
    ],
    about: {
      eyebrow: 'Por qué Basalto',
      title: 'Sabes en qué va tu obra cada semana.',
      text: 'Cada proyecto tiene un residente responsable, un calendario por etapas y un reporte semanal con fotos y gastos. Pagas conforme avanza la obra, nunca por adelantado.',
      images: ['1503387762-592deb58ef4e', '1504307651254-35680f356dfd'],
      alts: ['Arquitecto revisando planos', 'Trabajadores en una obra'],
      stats: [['+120', 'obras entregadas'], ['15', 'años construyendo'], ['4.9', 'en Google']],
    },
    steps: [
      { title: 'Visita sin costo', text: 'Vamos a tu terreno o inmueble y escuchamos lo que quieres.' },
      { title: 'Presupuesto por etapas', text: 'Te entregamos planos, calendario y costo de cada etapa.' },
      { title: 'Obra con reporte semanal', text: 'Fotos, avance y gastos cada semana hasta la entrega.' },
    ],
    gallery: [
      { id: '1600596542815-ffad4c1539a9', alt: 'Casa con alberca terminada' },
      { id: '1541888946425-d81bb19240f5', alt: 'Equipo en obra' },
      { id: '1600585154340-be6161a56a0c', alt: 'Fachada de casa moderna' },
    ],
    reviewsTitle: 'Clientes que ya viven en su proyecto',
    reviews: [
      { name: 'Familia Orozco', text: 'Nos entregaron la casa en la fecha prometida. Los reportes de cada semana nos dieron mucha tranquilidad.' },
      { name: 'Andrea M.', text: 'Remodelaron la cocina y el baño en cinco semanas. Todo limpio y como lo planeamos.' },
      { name: 'Luis F.', text: 'Adecuaron mi local trabajando de noche para no cerrar. Muy profesionales.' },
    ],
    address: 'Av. Patria, col. Jardines Universidad, Zapopan, Jal.',
    mapQuery: 'Av. Patria, Jardines Universidad, Zapopan',
    hours: [['Lunes a viernes', '9:00 – 18:00'], ['Sábado', '9:00 – 13:00']],
  },

  'despacho-de-abogados': {
    label: 'del despacho de abogados',
    title: 'Ibarra & Solís Abogados · Despacho jurídico en Guadalajara',
    font: 'classic',
    shape: 'square',
    hero: 'split',
    colors: { bg: '#f7f5f0', fg: '#14213d', accent: '#9a7b3f', accentFg: '#ffffff', band: '#14213d', bandFg: '#f7f5f0', soft: '#ebe6da' },
    name: 'Ibarra & Solís',
    tagline: 'Abogados',
    eyebrow: 'Despacho jurídico · Guadalajara',
    headline: 'Defendemos lo tuyo *con claridad y sin rodeos*.',
    lead: 'Asesoría en derecho familiar, civil, laboral y mercantil. Te decimos en la primera consulta qué opciones tienes, cuánto cuesta y cuánto puede tardar.',
    cta: 'Agenda tu primera consulta',
    ctaShort: 'Consulta',
    rating: '4.9',
    reviewCount: 97,
    heroImage: '1589829545856-d10d557cf95f',
    heroAlt: 'Estatua de la justicia con balanza',
    servicesTitle: 'Áreas de práctica',
    servicesLead: 'Primera consulta presencial o por videollamada. Honorarios por escrito desde el inicio.',
    services: [
      { icon: 'users', name: 'Derecho familiar', text: 'Divorcios, pensión alimenticia, guarda y custodia.' },
      { icon: 'home', name: 'Derecho civil', text: 'Contratos, arrendamiento, herencias y juicios sucesorios.' },
      { icon: 'briefcase', name: 'Derecho laboral', text: 'Despidos, demandas y defensa de empresas ante el tribunal laboral.' },
      { icon: 'scale', name: 'Derecho mercantil', text: 'Cobranza judicial, pagarés y constitución de sociedades.' },
      { icon: 'file', name: 'Contratos', text: 'Redacción y revisión de contratos para personas y empresas.' },
      { icon: 'shield', name: 'Amparos', text: 'Protección de tus derechos frente a actos de autoridad.' },
    ],
    about: {
      eyebrow: 'El despacho',
      title: 'Abogados que contestan el teléfono.',
      text: 'Fundado por los licenciados Daniel Ibarra y Mónica Solís, con más de 18 años de experiencia litigando en Jalisco. Cada asunto tiene un abogado responsable que te informa de cada avance.',
      images: ['1505664194779-8beaceb93744', '1450101499163-c8848c66ca85'],
      alts: ['Biblioteca jurídica', 'Firma de un documento legal'],
      stats: [['18', 'años litigando'], ['+900', 'asuntos atendidos'], ['4.9', 'en Google']],
    },
    steps: [
      { title: 'Cuéntanos tu caso', text: 'Escríbenos por WhatsApp y agendamos tu primera consulta.' },
      { title: 'Te damos opciones', text: 'Te explicamos rutas, tiempos y honorarios por escrito.' },
      { title: 'Te informamos siempre', text: 'Un abogado responsable te avisa de cada paso del asunto.' },
    ],
    reviewsTitle: 'Clientes que confiaron en nosotros',
    reviews: [
      { name: 'Sofía R.', text: 'Me explicaron mi divorcio paso por paso y siempre supe en qué iba. Muy humanos.' },
      { name: 'Grupo Textil Arce', text: 'Nos llevan los asuntos laborales desde hace años. Responden rápido y con soluciones.' },
      { name: 'Héctor V.', text: 'Recuperaron un adeudo que daba por perdido. Honorarios claros desde el principio.' },
    ],
    address: 'Av. Américas, col. Providencia, Guadalajara, Jal.',
    mapQuery: 'Av. Américas, Providencia, Guadalajara',
    hours: [['Lunes a viernes', '9:00 – 19:00'], ['Sábado', 'Con cita']],
  },
} satisfies Record<string, DemoSite>

export type DemoSlug = keyof typeof DEMO_SITES

export function isDemoSlug(slug: string): slug is DemoSlug {
  return Object.hasOwn(DEMO_SITES, slug)
}

/** WhatsApp link to imSoft that names the sample the visitor was looking at. */
export function demoWhatsAppHref(slug: DemoSlug): string {
  const text = `Hola imSoft, vi la página de ejemplo ${DEMO_SITES[slug].label} y me interesa una así para mi negocio.`
  return `https://wa.me/${IMSOFT_WHATSAPP}?text=${encodeURIComponent(text)}`
}

/** Unsplash photo URL at a given width. */
export function unsplash(id: string, width: number): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`
}

/** Splits a headline on *asterisks*: odd parts get the accent color. */
export function headlineParts(headline: string): string[] {
  return headline.split('*')
}
