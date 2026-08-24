/**
 * Consolidacion del blog (agosto 2026).
 *
 * El generador diario publicaba sobre los mismos ~7 temas sin saber que ya existian:
 * 92 posts, de los que 36 canibalizaban a otro mas completo. Ninguno tenia fuerza para
 * posicionar y Search Console reportaba 34 "Rastreada: actualmente sin indexar".
 *
 * Los 36 quedan despublicados (`published = false`, reversible) y su URL hace 301 al
 * articulo que absorbe el tema, para no perder los enlaces ni la autoridad acumulada.
 * Las redirecciones se aplican en `next.config.ts` para ambos idiomas.
 */
export const BLOG_SLUG_REDIRECTS: Record<string, string> = {
  // 5 Errores Comunes que Frenan tu Transformación Digital en 2026
  '5-common-mistakes-slowing-down-your-digital-transformation-in-2026':
    '5-mistakes-halting-your-digital-transformation-and-how-to-avoid-them',
  // 5 Errores Comunes al Lanzar tu Tienda Online que Cuestan Dinero
  '5-common-mistakes-when-launching-your-online-store-that-cost-money':
    '5-common-mistakes-when-building-an-online-store-and-how-to-avoid-them',
  // 5 Errores Comunes en el Desarrollo Web que Cuestan Miles a tu Negocio
  '5-common-web-development-mistakes-costing-your-business-thousands':
    'why-your-website-isnt-converting-common-web-development-mistakes',
  // 5 Errores Comunes al Desarrollar tu Sitio Web que Cuestan Dinero
  '5-common-web-development-mistakes-that-cost-you-money':
    'why-your-website-isnt-converting-common-web-development-mistakes',
  // 5 Errores que te Cuestan Ventas en tu Tienda Online
  '5-mistakes-costing-you-sales-in-your-online-store':
    '5-common-mistakes-when-building-an-online-store-and-how-to-avoid-them',
  // 5 Errores que Están Saboteando tu Tienda Online (y Cómo Evitarlos)
  '5-mistakes-sabotaging-your-online-store-and-how-to-fix-them':
    '5-common-mistakes-when-building-an-online-store-and-how-to-avoid-them',
  // 5 Errores que Arruinan tu Tienda Online (y Cómo Evitarlos)
  '5-mistakes-that-destroy-your-online-store-and-how-to-fix-them':
    '5-common-mistakes-when-building-an-online-store-and-how-to-avoid-them',
  // 5 Señales de que tu negocio necesita transformación digital ya
  '5-signs-your-business-needs-digital-transformation-now':
    'how-digital-transformation-increases-your-business-profits',
  // Transformación Digital para PyMEs: Por Dónde Empezar en 2026
  'digital-transformation-for-smbs-where-to-start-in-2026':
    'digital-transformation-for-smes-where-to-start-in-2026',
  // Transformación Digital para PyMEs: La Guía Práctica que Necesitas en 202
  'digital-transformation-for-smes-the-practical-guide-you-need-in-2026':
    'digital-transformation-for-smes-where-to-start-in-2026',
  // Transformación Digital: Cómo Modernizar tu Negocio en 2026
  'digital-transformation-how-to-modernize-your-business-in-2026':
    'digital-transformation-for-smes-where-to-start-in-2026',
  // Transformación Digital: La Clave para que tu PyME Crezca en 2026
  'digital-transformation-the-key-for-your-smb-to-grow-in-2026':
    'digital-transformation-the-urgent-reality-your-smb-cant-ignore-in-2026',
  // Cómo la Transformación Digital Salva PyMEs de la Extinción
  'how-digital-transformation-saves-smes-from-extinction':
    'digital-transformation-for-smes-where-to-start-in-2026',
  // Cómo Automatizar tu PyME: La Guía Práctica para 2026
  'how-to-automate-your-smb-the-practical-guide-for-2026':
    'how-to-digitalize-your-sme-in-2026-the-practical-guide-you-need',
  // Cómo crear una tienda online que realmente venda en 2026
  'how-to-build-an-online-store-that-actually-sells-in-2026':
    'how-to-build-an-online-store-with-react-practical-guide-for-2026',
  // Cómo Elegir la Tecnología Correcta para tu Proyecto Digital en 2026
  'how-to-choose-the-right-technology-for-your-digital-project-in-2026':
    'how-to-choose-the-right-technology-for-your-mobile-app-in-2026',
  // Cómo Elegir la Tecnología Correcta para tu Startup: Guía Práctica 2026
  'how-to-choose-the-right-technology-for-your-startup-practical-guide-2026':
    'how-to-choose-the-right-technology-for-your-mobile-app-in-2026',
  // Cómo Crear una Tienda Online en 2026: Guía Práctica para PyMEs
  'how-to-create-an-online-store-in-2026-a-practical-guide-for-smbs':
    'how-to-build-an-online-store-with-react-practical-guide-for-2026',
  // Cómo crear una tienda online en 2026: guía práctica para PyMEs
  'how-to-create-an-online-store-in-2026-practical-guide-for-smes':
    'how-to-build-an-online-store-with-react-practical-guide-for-2026',
  // Cómo posicionar tu PyME en Google sin gastar en publicidad
  'how-to-rank-your-smb-on-google-without-spending-on-ads':
    'seo-for-smes-how-to-rank-on-google-without-spending-on-ads',
  // App Móvil vs Web: Cuál Elegir para tu Negocio en 2026
  'mobile-app-vs-web-which-one-to-choose-for-your-business-in-2026':
    'how-to-choose-the-right-technology-for-your-mobile-app-in-2026',
  // Diseño Web Moderno: Cómo Convertir Visitantes en Clientes
  'modern-web-design-how-to-convert-visitors-into-customers':
    'modern-web-design-the-key-to-converting-visitors-into-customers',
  // Diseño Web Moderno: Cómo Convertir Visitantes en Clientes
  'modern-web-design-how-to-convert-visitors-into-customers-1784128744839':
    'modern-web-design-the-key-to-converting-visitors-into-customers',
  // Diseño Web Responsivo: La Clave para Convertir Visitantes en Clientes
  'responsive-web-design-the-key-to-converting-visitors-into-customers':
    'modern-web-design-the-key-to-converting-visitors-into-customers',
  // Diseño Web Responsivo: Clave para Vender en Todos los Dispositivos
  'responsive-web-design-the-key-to-selling-on-every-device':
    'responsive-web-design-why-your-site-must-look-perfect-on-every-device',
  // Las Tendencias de Software en 2026: Qué Debes Saber para tu Negocio
  'software-trends-in-2026-what-you-need-to-know-for-your-business':
    '5-tech-trends-that-will-transform-your-business-in-2026',
  // Las 5 tendencias tecnológicas que transformarán tu negocio en 2026
  'the-5-tech-trends-that-will-transform-your-business-in-2026':
    '5-tech-trends-that-will-transform-your-business-in-2026',
  // Las 5 tendencias tecnológicas que transformarán tu negocio en 2026
  'the-5-tech-trends-that-will-transform-your-business-in-2026-1784385835167':
    '5-tech-trends-that-will-transform-your-business-in-2026',
  // Las 5 tendencias tecnológicas que transformarán tu negocio en 2026
  'the-5-tech-trends-that-will-transform-your-business-in-2026-1787149413318':
    '5-tech-trends-that-will-transform-your-business-in-2026',
  // Las tendencias de software que transformarán tu negocio en 2026
  'the-software-trends-that-will-transform-your-business-in-2026':
    '5-tech-trends-that-will-transform-your-business-in-2026',
  // Las tendencias tech que van a transformar tu negocio en 2026
  'the-tech-trends-that-will-transform-your-business-in-2026':
    '5-tech-trends-that-will-transform-your-business-in-2026',
  // Las tendencias tecnológicas que transformarán los negocios en 2026
  'the-technology-trends-that-will-transform-businesses-in-2026':
    '5-tech-trends-that-will-transform-your-business-in-2026',
  // ¿Por qué tu PyME necesita una aplicación móvil en 2026?
  'why-your-smb-needs-a-mobile-app-in-2026':
    'how-to-choose-the-best-platform-for-mobile-app-development-in-2026',
  // ¿Por qué tu PyME necesita una app móvil en 2026?
  'why-your-smb-needs-a-mobile-app-in-2026-1781708631804':
    'how-to-choose-the-right-technology-for-your-mobile-app-in-2026',
  // Por qué tu PyME necesita una app móvil en 2026
  'why-your-smb-needs-a-mobile-app-in-2026-1783093749788':
    'how-to-choose-the-right-technology-for-your-mobile-app-in-2026',
  // ¿Por Qué Tu PyME Necesita Un Sitio Web Profesional en 2026?
  'why-your-smb-needs-a-professional-website-in-2026':
    'nextjs-in-2026-why-your-smb-must-modernize-its-website',
};
