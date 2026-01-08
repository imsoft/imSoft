import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../dictionaries';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
  const url = lang === 'es' 
    ? `${SITE_URL}/es/aviso-de-privacidad`
    : `${SITE_URL}/en/privacy-policy`;

  return generateSEOMetadata({
    title: lang === 'es' 
      ? 'Aviso de Privacidad'
      : 'Privacy Policy',
    description: lang === 'es'
      ? 'Aviso de privacidad de imSoft. Conoce cómo protegemos y manejamos tu información personal.'
      : 'imSoft privacy policy. Learn how we protect and handle your personal information.',
    url,
    type: 'website',
    noindex: true, // Las páginas legales generalmente no se indexan
  }, lang);
}

export default async function PrivacyPolicyPage({ params }: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const supabase = await createClient();

  // Obtener datos de contacto
  const { data: contactData } = await supabase
    .from('contact')
    .select('*')
    .limit(1)
    .maybeSingle();

  const title = lang === 'es' ? 'Aviso de Privacidad' : 'Privacy Policy';

  return (
    <div>
      <HeroHeader dict={dict} lang={lang} />
      <main className="pt-24">
        <article className="py-16 md:py-24 bg-background">
          <div className="mx-auto max-w-4xl px-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              {title}
            </h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {lang === 'es'
                  ? 'imSoft, Inc. (en adelante, "la Empresa", "nosotros", "nuestro" o "nos") se compromete a proteger su privacidad y sus datos personales. Este Aviso de Privacidad describe cómo recopilamos, utilizamos, almacenamos, protegemos y compartimos su información personal cuando utiliza nuestro sitio web y servicios. Al utilizar nuestros servicios, usted acepta las prácticas descritas en este aviso. Le recomendamos leer este documento cuidadosamente para comprender nuestras prácticas de privacidad.'
                  : 'imSoft, Inc. (hereinafter, "the Company", "we", "our" or "us") is committed to protecting your privacy and personal data. This Privacy Notice describes how we collect, use, store, protect, and share your personal information when you use our website and services. By using our services, you agree to the practices described in this notice. We recommend that you read this document carefully to understand our privacy practices.'}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '1. Responsable del Tratamiento de Datos Personales' : '1. Data Controller'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'El responsable del tratamiento de sus datos personales es imSoft, Inc., con domicilio en México. Para cualquier asunto relacionado con el tratamiento de sus datos personales, puede contactarnos a través de nuestra página de contacto.'
                    : 'The controller of your personal data is imSoft, Inc., with address in Mexico. For any matter related to the processing of your personal data, you can contact us through our contact page.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '2. Información que Recopilamos' : '2. Information We Collect'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Recopilamos diferentes tipos de información personal y no personal:'
                    : 'We collect different types of personal and non-personal information:'}
                </p>
                
                <h3 className="text-xl font-semibold mb-3 mt-4">
                  {lang === 'es' ? '2.1. Información que Usted Nos Proporciona Directamente' : '2.1. Information You Provide Directly to Us'}
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{lang === 'es' ? 'Datos de identificación: nombre completo, dirección de correo electrónico, número de teléfono, dirección postal.' : 'Identification data: full name, email address, phone number, postal address.'}</li>
                  <li>{lang === 'es' ? 'Información de cuenta: nombre de usuario, contraseña (encriptada), preferencias de cuenta.' : 'Account information: username, password (encrypted), account preferences.'}</li>
                  <li>{lang === 'es' ? 'Información de contacto: cuando se comunica con nosotros a través de formularios, correo electrónico o chat.' : 'Contact information: when you communicate with us through forms, email, or chat.'}</li>
                  <li>{lang === 'es' ? 'Información de pago: datos de facturación, información de tarjeta de crédito (procesada de forma segura a través de proveedores de pago certificados), historial de transacciones.' : 'Payment information: billing data, credit card information (processed securely through certified payment providers), transaction history.'}</li>
                  <li>{lang === 'es' ? 'Información del proyecto: detalles sobre proyectos solicitados, requisitos, especificaciones técnicas.' : 'Project information: details about requested projects, requirements, technical specifications.'}</li>
                  <li>{lang === 'es' ? 'Contenido proporcionado: cualquier información, archivos, documentos o contenido que usted envíe o cargue a través de nuestros servicios.' : 'Provided content: any information, files, documents, or content that you submit or upload through our services.'}</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-4">
                  {lang === 'es' ? '2.2. Información Recopilada Automáticamente' : '2.2. Automatically Collected Information'}
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{lang === 'es' ? 'Datos de uso: páginas visitadas, tiempo de permanencia, enlaces en los que hace clic, patrones de navegación.' : 'Usage data: pages visited, time spent, links clicked, browsing patterns.'}</li>
                  <li>{lang === 'es' ? 'Información del dispositivo: tipo de dispositivo, sistema operativo, navegador, dirección IP, identificadores únicos del dispositivo.' : 'Device information: device type, operating system, browser, IP address, unique device identifiers.'}</li>
                  <li>{lang === 'es' ? 'Información de ubicación: ubicación geográfica aproximada basada en su dirección IP (no recopilamos ubicación GPS precisa sin su consentimiento explícito).' : 'Location information: approximate geographic location based on your IP address (we do not collect precise GPS location without your explicit consent).'}</li>
                  <li>{lang === 'es' ? 'Cookies y tecnologías similares: utilizamos cookies, web beacons, píxeles de seguimiento y tecnologías similares para recopilar información sobre su interacción con nuestro sitio web.' : 'Cookies and similar technologies: we use cookies, web beacons, tracking pixels, and similar technologies to collect information about your interaction with our website.'}</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-4">
                  {lang === 'es' ? '2.3. Información de Terceros' : '2.3. Third-Party Information'}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Podemos recibir información sobre usted de terceros, como proveedores de servicios de pago, plataformas de redes sociales (si se conecta a través de ellas), servicios de autenticación y otros proveedores de servicios que utilizamos para operar nuestro negocio.'
                    : 'We may receive information about you from third parties, such as payment service providers, social media platforms (if you connect through them), authentication services, and other service providers we use to operate our business.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '3. Finalidades del Tratamiento de Datos Personales' : '3. Purposes of Personal Data Processing'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Utilizamos su información personal para las siguientes finalidades:'
                    : 'We use your personal information for the following purposes:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Prestación de servicios:' : 'Service provision:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Proporcionar, mantener, mejorar y personalizar nuestros servicios, procesar sus solicitudes, gestionar su cuenta y cumplir con nuestras obligaciones contractuales.'
                      : 'Provide, maintain, improve, and personalize our services, process your requests, manage your account, and fulfill our contractual obligations.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Comunicación:' : 'Communication:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Responder a sus consultas, enviarle información sobre nuestros servicios, notificaciones importantes, actualizaciones y comunicaciones relacionadas con el servicio.'
                      : 'Respond to your inquiries, send you information about our services, important notifications, updates, and service-related communications.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Procesamiento de pagos:' : 'Payment processing:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Procesar pagos, gestionar facturas, prevenir fraudes y cumplir con obligaciones fiscales y legales relacionadas con transacciones.'
                      : 'Process payments, manage invoices, prevent fraud, and comply with tax and legal obligations related to transactions.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Mejora de servicios:' : 'Service improvement:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Analizar el uso de nuestros servicios, realizar investigaciones, desarrollar nuevas funcionalidades y mejorar la experiencia del usuario.'
                      : 'Analyze the use of our services, conduct research, develop new features, and improve user experience.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Seguridad:' : 'Security:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Proteger nuestros servicios, detectar y prevenir fraudes, abusos, actividades ilegales y garantizar la seguridad de nuestros sistemas y usuarios.'
                      : 'Protect our services, detect and prevent fraud, abuse, illegal activities, and ensure the security of our systems and users.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Cumplimiento legal:' : 'Legal compliance:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Cumplir con obligaciones legales, responder a solicitudes gubernamentales, hacer cumplir nuestros términos y condiciones y proteger nuestros derechos legales.'
                      : 'Comply with legal obligations, respond to government requests, enforce our terms and conditions, and protect our legal rights.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Marketing (con su consentimiento):' : 'Marketing (with your consent):'}</strong>{' '}
                    {lang === 'es'
                      ? 'Enviarle comunicaciones de marketing, promociones, ofertas especiales y boletines informativos, solo si ha dado su consentimiento explícito.'
                      : 'Send you marketing communications, promotions, special offers, and newsletters, only if you have given your explicit consent.'}
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '4. Base Legal para el Tratamiento' : '4. Legal Basis for Processing'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Procesamos su información personal basándonos en las siguientes bases legales:'
                    : 'We process your personal information based on the following legal bases:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{lang === 'es' ? 'Ejecución de contrato: cuando es necesario para cumplir con un contrato que tiene con nosotros o para tomar medidas antes de celebrar un contrato.' : 'Contract performance: when necessary to fulfill a contract you have with us or to take steps before entering into a contract.'}</li>
                  <li>{lang === 'es' ? 'Consentimiento: cuando ha dado su consentimiento explícito para el tratamiento de sus datos personales para fines específicos.' : 'Consent: when you have given your explicit consent for the processing of your personal data for specific purposes.'}</li>
                  <li>{lang === 'es' ? 'Obligación legal: cuando el tratamiento es necesario para cumplir con una obligación legal a la que estamos sujetos.' : 'Legal obligation: when processing is necessary to comply with a legal obligation to which we are subject.'}</li>
                  <li>{lang === 'es' ? 'Interés legítimo: cuando el tratamiento es necesario para nuestros intereses legítimos o los de un tercero, siempre que no se anulen sus intereses o derechos fundamentales.' : 'Legitimate interest: when processing is necessary for our legitimate interests or those of a third party, provided that your interests or fundamental rights are not overridden.'}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '5. Compartir y Divulgación de Información' : '5. Sharing and Disclosure of Information'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'No vendemos, alquilamos ni comercializamos su información personal a terceros. Sin embargo, podemos compartir su información en las siguientes circunstancias:'
                    : 'We do not sell, rent, or market your personal information to third parties. However, we may share your information in the following circumstances:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Proveedores de servicios:' : 'Service providers:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Compartimos información con proveedores de servicios de confianza que nos ayudan a operar nuestro negocio, como proveedores de hosting, servicios de pago, servicios de análisis, servicios de email y otros proveedores técnicos. Estos proveedores están contractualmente obligados a mantener la confidencialidad y seguridad de su información.'
                      : 'We share information with trusted service providers who help us operate our business, such as hosting providers, payment services, analytics services, email services, and other technical providers. These providers are contractually obligated to maintain the confidentiality and security of your information.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Cumplimiento legal:' : 'Legal compliance:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Podemos divulgar información si es requerido por ley, orden judicial, proceso legal o solicitud gubernamental, o para proteger nuestros derechos, propiedad o seguridad, o la de nuestros usuarios o terceros.'
                      : 'We may disclose information if required by law, court order, legal process, or government request, or to protect our rights, property, or safety, or that of our users or third parties.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Transferencias comerciales:' : 'Business transfers:'}</strong>{' '}
                    {lang === 'es'
                      ? 'En caso de fusión, adquisición, reorganización, quiebra o venta de activos, su información puede ser transferida como parte de esa transacción.'
                      : 'In the event of a merger, acquisition, reorganization, bankruptcy, or sale of assets, your information may be transferred as part of that transaction.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Con su consentimiento:' : 'With your consent:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Podemos compartir su información con terceros cuando usted nos haya dado su consentimiento explícito para hacerlo.'
                      : 'We may share your information with third parties when you have given us your explicit consent to do so.'}
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '6. Transferencias Internacionales de Datos' : '6. International Data Transfers'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Sus datos personales pueden ser transferidos y almacenados en servidores ubicados fuera de su país de residencia, incluyendo países que pueden tener leyes de protección de datos diferentes. Al utilizar nuestros servicios, usted consiente la transferencia de su información a estos países. Implementamos salvaguardas apropiadas, incluyendo cláusulas contractuales estándar y otras medidas de seguridad, para proteger su información personal durante estas transferencias.'
                    : 'Your personal data may be transferred and stored on servers located outside your country of residence, including countries that may have different data protection laws. By using our services, you consent to the transfer of your information to these countries. We implement appropriate safeguards, including standard contractual clauses and other security measures, to protect your personal information during these transfers.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '7. Seguridad de los Datos' : '7. Data Security'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Implementamos medidas de seguridad técnicas, administrativas y físicas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación, pérdida o destrucción. Estas medidas incluyen:'
                    : 'We implement appropriate technical, administrative, and physical security measures to protect your personal information against unauthorized access, alteration, disclosure, loss, or destruction. These measures include:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{lang === 'es' ? 'Cifrado de datos en tránsito y en reposo utilizando tecnologías de cifrado estándar de la industria.' : 'Data encryption in transit and at rest using industry-standard encryption technologies.'}</li>
                  <li>{lang === 'es' ? 'Controles de acceso estrictos y autenticación de múltiples factores para sistemas que contienen información sensible.' : 'Strict access controls and multi-factor authentication for systems containing sensitive information.'}</li>
                  <li>{lang === 'es' ? 'Monitoreo regular de nuestros sistemas para detectar y prevenir actividades no autorizadas.' : 'Regular monitoring of our systems to detect and prevent unauthorized activities.'}</li>
                  <li>{lang === 'es' ? 'Capacitación regular de nuestro personal sobre prácticas de seguridad y privacidad de datos.' : 'Regular training of our staff on data security and privacy practices.'}</li>
                  <li>{lang === 'es' ? 'Copias de seguridad regulares y planes de recuperación ante desastres.' : 'Regular backups and disaster recovery plans.'}</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {lang === 'es'
                    ? 'Sin embargo, ningún método de transmisión por Internet o método de almacenamiento electrónico es 100% seguro. Aunque nos esforzamos por proteger su información personal, no podemos garantizar su seguridad absoluta.'
                    : 'However, no method of transmission over the Internet or method of electronic storage is 100% secure. Although we strive to protect your personal information, we cannot guarantee its absolute security.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '8. Retención de Datos' : '8. Data Retention'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Conservamos su información personal durante el tiempo necesario para cumplir con las finalidades descritas en este aviso, a menos que la ley requiera o permita un período de retención más largo. Los criterios que utilizamos para determinar los períodos de retención incluyen: (a) el tiempo necesario para proporcionar nuestros servicios; (b) si existe una obligación legal que nos obligue a retener los datos; (c) si existe una necesidad legítima de negocio para retener los datos; y (d) si existe un riesgo de litigio o investigación. Cuando ya no necesitemos su información personal, la eliminaremos o anonimizaremos de forma segura.'
                    : 'We retain your personal information for as long as necessary to fulfill the purposes described in this notice, unless the law requires or permits a longer retention period. The criteria we use to determine retention periods include: (a) the time necessary to provide our services; (b) whether there is a legal obligation requiring us to retain the data; (c) whether there is a legitimate business need to retain the data; and (d) whether there is a risk of litigation or investigation. When we no longer need your personal information, we will securely delete or anonymize it.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '9. Sus Derechos de Protección de Datos' : '9. Your Data Protection Rights'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Usted tiene los siguientes derechos respecto a sus datos personales:'
                    : 'You have the following rights regarding your personal data:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Derecho de acceso:' : 'Right of access:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Tiene derecho a solicitar una copia de la información personal que tenemos sobre usted.'
                      : 'You have the right to request a copy of the personal information we have about you.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Derecho de rectificación:' : 'Right of rectification:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Tiene derecho a solicitar la corrección de información inexacta o incompleta.'
                      : 'You have the right to request the correction of inaccurate or incomplete information.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Derecho de cancelación:' : 'Right of erasure:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Tiene derecho a solicitar la eliminación de su información personal en ciertas circunstancias, sujeto a nuestras obligaciones legales de retención.'
                      : 'You have the right to request the deletion of your personal information in certain circumstances, subject to our legal retention obligations.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Derecho de oposición:' : 'Right to object:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Tiene derecho a oponerse al tratamiento de sus datos personales para ciertos fines, como marketing directo.'
                      : 'You have the right to object to the processing of your personal data for certain purposes, such as direct marketing.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Derecho a la limitación del tratamiento:' : 'Right to restriction of processing:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Tiene derecho a solicitar la limitación del tratamiento de sus datos personales en ciertas circunstancias.'
                      : 'You have the right to request the restriction of processing of your personal data in certain circumstances.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Derecho a la portabilidad de datos:' : 'Right to data portability:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Tiene derecho a recibir sus datos personales en un formato estructurado y comúnmente utilizado, y a transmitirlos a otro responsable del tratamiento.'
                      : 'You have the right to receive your personal data in a structured and commonly used format, and to transmit it to another data controller.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Derecho a retirar el consentimiento:' : 'Right to withdraw consent:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Cuando el tratamiento se base en su consentimiento, tiene derecho a retirarlo en cualquier momento, sin que esto afecte la licitud del tratamiento basado en el consentimiento antes de su retirada.'
                      : 'When processing is based on your consent, you have the right to withdraw it at any time, without affecting the lawfulness of processing based on consent before its withdrawal.'}
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {lang === 'es'
                    ? 'Para ejercer cualquiera de estos derechos, puede contactarnos a través de nuestra página de contacto. Responderemos a su solicitud dentro de un plazo razonable y de acuerdo con la ley aplicable. Podemos solicitarle información adicional para verificar su identidad antes de procesar su solicitud.'
                    : 'To exercise any of these rights, you can contact us through our contact page. We will respond to your request within a reasonable time and in accordance with applicable law. We may request additional information from you to verify your identity before processing your request.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '10. Cookies y Tecnologías de Seguimiento' : '10. Cookies and Tracking Technologies'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Utilizamos cookies, web beacons, píxeles de seguimiento y tecnologías similares para recopilar información sobre su uso de nuestro sitio web. Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web. Utilizamos los siguientes tipos de cookies:'
                    : 'We use cookies, web beacons, tracking pixels, and similar technologies to collect information about your use of our website. Cookies are small text files that are stored on your device when you visit our website. We use the following types of cookies:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Cookies esenciales:' : 'Essential cookies:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Necesarias para el funcionamiento básico del sitio web y no se pueden desactivar.'
                      : 'Necessary for the basic functioning of the website and cannot be disabled.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Cookies de funcionalidad:' : 'Functionality cookies:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Permiten que el sitio web recuerde sus preferencias y proporcionen funcionalidades mejoradas.'
                      : 'Allow the website to remember your preferences and provide enhanced functionality.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Cookies de análisis:' : 'Analytics cookies:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web recopilando información de forma anónima.'
                      : 'Help us understand how visitors interact with our website by collecting information anonymously.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Cookies de marketing:' : 'Marketing cookies:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Se utilizan para rastrear a los visitantes a través de sitios web con la intención de mostrar anuncios relevantes (solo con su consentimiento).'
                      : 'Used to track visitors across websites with the intention of displaying relevant ads (only with your consent).'}
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {lang === 'es'
                    ? 'Puede configurar su navegador para rechazar cookies o para alertarle cuando se envían cookies. Sin embargo, si rechaza las cookies, es posible que algunas partes de nuestro sitio web no funcionen correctamente.'
                    : 'You can set your browser to refuse cookies or to alert you when cookies are being sent. However, if you refuse cookies, some parts of our website may not function properly.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '11. Privacidad de Menores' : '11. Children\'s Privacy'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos conscientemente información personal de menores de 18 años. Si descubrimos que hemos recopilado información personal de un menor sin el consentimiento verificable de los padres, tomaremos medidas para eliminar esa información de nuestros servidores. Si cree que hemos recopilado información de un menor, por favor contáctenos inmediatamente.'
                    : 'Our services are not directed to children under 18 years of age. We do not knowingly collect personal information from children under 18. If we discover that we have collected personal information from a child without verifiable parental consent, we will take steps to delete that information from our servers. If you believe we have collected information from a child, please contact us immediately.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '12. Enlaces a Sitios Web de Terceros' : '12. Links to Third-Party Websites'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Nuestro sitio web puede contener enlaces a sitios web de terceros que no son operados por nosotros. No tenemos control sobre el contenido, las políticas de privacidad o las prácticas de estos sitios web de terceros. Le recomendamos encarecidamente que revise las políticas de privacidad de cualquier sitio web de terceros que visite. No somos responsables de las prácticas de privacidad o el contenido de sitios web de terceros.'
                    : 'Our website may contain links to third-party websites that are not operated by us. We have no control over the content, privacy policies, or practices of these third-party websites. We strongly recommend that you review the privacy policies of any third-party websites you visit. We are not responsible for the privacy practices or content of third-party websites.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '13. Cambios a este Aviso de Privacidad' : '13. Changes to this Privacy Notice'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Podemos actualizar este Aviso de Privacidad ocasionalmente para reflejar cambios en nuestras prácticas, servicios o por razones legales, operativas o regulatorias. Le notificaremos de cualquier cambio material publicando el nuevo Aviso de Privacidad en esta página y actualizando la fecha de "Última actualización" en la parte superior. En caso de cambios materiales, también podemos notificarle por correo electrónico o mediante un aviso prominente en nuestro sitio web. Le recomendamos revisar periódicamente este aviso para estar informado sobre cómo protegemos su información.'
                    : 'We may update this Privacy Notice occasionally to reflect changes in our practices, services, or for legal, operational, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Notice on this page and updating the "Last updated" date at the top. In case of material changes, we may also notify you by email or through a prominent notice on our website. We recommend that you periodically review this notice to be informed about how we protect your information.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '14. Autoridad Supervisora' : '14. Supervisory Authority'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Si considera que el tratamiento de sus datos personales viola la ley aplicable de protección de datos, tiene derecho a presentar una queja ante la autoridad supervisora de protección de datos en su país de residencia. Sin embargo, le recomendamos que primero se comunique con nosotros para intentar resolver cualquier preocupación que pueda tener.'
                    : 'If you believe that the processing of your personal data violates applicable data protection law, you have the right to file a complaint with the data protection supervisory authority in your country of residence. However, we recommend that you first contact us to try to resolve any concerns you may have.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '15. Contacto' : '15. Contact'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Si tiene preguntas, comentarios, inquietudes o solicitudes relacionadas con este Aviso de Privacidad o nuestras prácticas de privacidad, puede contactarnos a través de nuestra página de contacto. Nos comprometemos a responder a sus consultas de manera oportuna y a trabajar con usted para resolver cualquier preocupación que pueda tener sobre el tratamiento de sus datos personales.'
                    : 'If you have questions, comments, concerns, or requests related to this Privacy Notice or our privacy practices, you can contact us through our contact page. We are committed to responding to your inquiries in a timely manner and working with you to resolve any concerns you may have about the processing of your personal data.'}
                </p>
              </section>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {lang === 'es'
                    ? 'Última actualización: Enero 2026. Al utilizar nuestros servicios, usted reconoce que ha leído, entendido y acepta las prácticas descritas en este Aviso de Privacidad.'
                    : 'Last updated: January 2026. By using our services, you acknowledge that you have read, understood, and agree to the practices described in this Privacy Notice.'}
                </p>
              </div>
            </div>
          </div>
        </article>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
  );
}
