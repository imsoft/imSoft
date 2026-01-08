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
    ? `${SITE_URL}/es/terminos-y-condiciones`
    : `${SITE_URL}/en/terms-and-conditions`;

  return generateSEOMetadata({
    title: lang === 'es' 
      ? 'Términos y Condiciones'
      : 'Terms and Conditions',
    description: lang === 'es'
      ? 'Términos y condiciones de uso de los servicios de imSoft. Lee nuestros términos legales antes de utilizar nuestros servicios.'
      : 'Terms and conditions for using imSoft services. Read our legal terms before using our services.',
    url,
    type: 'website',
    noindex: true, // Las páginas legales generalmente no se indexan
  }, lang);
}

export default async function TermsAndConditionsPage({ params }: {
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

  const title = lang === 'es' ? 'Términos y Condiciones' : 'Terms and Conditions';

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
                  ? 'Los presentes Términos y Condiciones regulan el uso del sitio web y los servicios proporcionados por imSoft, Inc. (en adelante, "la Empresa", "nosotros", "nuestro" o "nos"). Al acceder, navegar o utilizar este sitio web y nuestros servicios, usted (en adelante, "el Usuario", "usted" o "su") acepta estar sujeto a estos términos. Si no está de acuerdo con alguna parte de estos términos, debe cesar inmediatamente el uso de nuestros servicios.'
                  : 'These Terms and Conditions govern the use of the website and services provided by imSoft, Inc. (hereinafter, "the Company", "we", "our" or "us"). By accessing, browsing, or using this website and our services, you (hereinafter, "the User", "you" or "your") agree to be bound by these terms. If you do not agree with any part of these terms, you must immediately cease using our services.'}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '1. Definiciones' : '1. Definitions'}
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Servicios:' : 'Services:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Se refiere a todos los servicios, productos, software, aplicaciones y contenido proporcionado por imSoft, Inc., incluyendo pero no limitado a desarrollo web, aplicaciones móviles, consultoría tecnológica y servicios relacionados.'
                      : 'Refers to all services, products, software, applications, and content provided by imSoft, Inc., including but not limited to web development, mobile applications, technology consulting, and related services.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Contenido:' : 'Content:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Incluye todo el material presente en el sitio web, incluyendo textos, gráficos, logos, iconos, imágenes, audio, video, software, código fuente y cualquier otra información o material.'
                      : 'Includes all material present on the website, including text, graphics, logos, icons, images, audio, video, software, source code, and any other information or material.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Usuario:' : 'User:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Cualquier persona que acceda, navegue o utilice el sitio web o nuestros servicios, ya sea como visitante, cliente o de cualquier otra forma.'
                      : 'Any person who accesses, browses, or uses the website or our services, whether as a visitor, client, or in any other capacity.'}
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '2. Aceptación de los Términos' : '2. Acceptance of Terms'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Al acceder y utilizar este sitio web o nuestros servicios, usted declara y garantiza que:'
                    : 'By accessing and using this website or our services, you declare and warrant that:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{lang === 'es' ? 'Tiene la capacidad legal para celebrar contratos vinculantes.' : 'You have the legal capacity to enter into binding contracts.'}</li>
                  <li>{lang === 'es' ? 'Ha leído, entendido y acepta estar sujeto a estos términos y condiciones.' : 'You have read, understood, and agree to be bound by these terms and conditions.'}</li>
                  <li>{lang === 'es' ? 'Cumplirá con todas las leyes y regulaciones aplicables en su jurisdicción.' : 'You will comply with all applicable laws and regulations in your jurisdiction.'}</li>
                  <li>{lang === 'es' ? 'Toda la información proporcionada es veraz, precisa y actualizada.' : 'All information provided is truthful, accurate, and up-to-date.'}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '3. Descripción de los Servicios' : '3. Description of Services'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'imSoft, Inc. proporciona servicios de desarrollo de software, aplicaciones web y móviles, consultoría tecnológica y servicios relacionados. Nos reservamos el derecho de:'
                    : 'imSoft, Inc. provides software development, web and mobile applications, technology consulting, and related services. We reserve the right to:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{lang === 'es' ? 'Modificar, suspender o discontinuar cualquier aspecto de nuestros servicios en cualquier momento sin previo aviso.' : 'Modify, suspend, or discontinue any aspect of our services at any time without prior notice.'}</li>
                  <li>{lang === 'es' ? 'Rechazar, limitar o cancelar el acceso a nuestros servicios a cualquier usuario, por cualquier motivo, a nuestra sola discreción.' : 'Refuse, limit, or cancel access to our services to any user, for any reason, at our sole discretion.'}</li>
                  <li>{lang === 'es' ? 'Establecer límites en el uso de nuestros servicios, incluyendo pero no limitado a límites de almacenamiento, ancho de banda o número de solicitudes.' : 'Establish limits on the use of our services, including but not limited to storage limits, bandwidth, or number of requests.'}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '4. Uso Aceptable' : '4. Acceptable Use'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Usted se compromete a utilizar nuestros servicios únicamente para fines legales y de acuerdo con estos términos. Está estrictamente prohibido:'
                    : 'You agree to use our services only for lawful purposes and in accordance with these terms. It is strictly prohibited to:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{lang === 'es' ? 'Utilizar nuestros servicios para cualquier actividad ilegal, fraudulenta o que viole derechos de terceros.' : 'Use our services for any illegal, fraudulent activity or that violates third-party rights.'}</li>
                  <li>{lang === 'es' ? 'Intentar acceder no autorizado a nuestros sistemas, cuentas de otros usuarios o información confidencial.' : 'Attempt unauthorized access to our systems, other users\' accounts, or confidential information.'}</li>
                  <li>{lang === 'es' ? 'Transmitir virus, malware, código malicioso o cualquier otro elemento dañino.' : 'Transmit viruses, malware, malicious code, or any other harmful element.'}</li>
                  <li>{lang === 'es' ? 'Interferir con, interrumpir o sobrecargar nuestros servicios, servidores o redes.' : 'Interfere with, disrupt, or overload our services, servers, or networks.'}</li>
                  <li>{lang === 'es' ? 'Realizar ingeniería inversa, descompilar o desensamblar cualquier software proporcionado por nosotros.' : 'Reverse engineer, decompile, or disassemble any software provided by us.'}</li>
                  <li>{lang === 'es' ? 'Utilizar robots, scrapers o cualquier método automatizado para acceder a nuestros servicios sin autorización.' : 'Use robots, scrapers, or any automated method to access our services without authorization.'}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '5. Propiedad Intelectual' : '5. Intellectual Property'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Todo el contenido del sitio web, incluyendo pero no limitado a textos, gráficos, logos, iconos, imágenes, fotografías, audio, video, software, código fuente, compilaciones de datos, diseño y disposición del sitio, es propiedad exclusiva de imSoft, Inc. o de sus licenciantes y está protegido por leyes de derechos de autor, marcas registradas, patentes y otras leyes de propiedad intelectual.'
                    : 'All content on the website, including but not limited to text, graphics, logos, icons, images, photographs, audio, video, software, source code, data compilations, site design and layout, is the exclusive property of imSoft, Inc. or its licensors and is protected by copyright, trademark, patent, and other intellectual property laws.'}
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Se le otorga una licencia limitada, no exclusiva, no transferible y revocable para acceder y utilizar el sitio web únicamente para fines personales y no comerciales. Esta licencia no incluye:'
                    : 'You are granted a limited, non-exclusive, non-transferable, and revocable license to access and use the website solely for personal and non-commercial purposes. This license does not include:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{lang === 'es' ? 'El derecho de reproducir, distribuir, modificar, crear obras derivadas, mostrar públicamente o utilizar comercialmente cualquier contenido.' : 'The right to reproduce, distribute, modify, create derivative works, publicly display, or commercially use any content.'}</li>
                  <li>{lang === 'es' ? 'El uso de cualquier marca registrada, logo o nombre comercial sin nuestro consentimiento previo por escrito.' : 'The use of any trademark, logo, or trade name without our prior written consent.'}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '6. Contratos y Pagos' : '6. Contracts and Payments'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Cuando contrata nuestros servicios:'
                    : 'When you contract our services:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{lang === 'es' ? 'Los términos específicos del proyecto, incluyendo alcance, plazos, precios y condiciones de pago, se establecerán en un contrato por escrito separado.' : 'Specific project terms, including scope, deadlines, prices, and payment conditions, will be established in a separate written contract.'}</li>
                  <li>{lang === 'es' ? 'Todos los precios están sujetos a cambios sin previo aviso hasta que se firme un contrato formal.' : 'All prices are subject to change without prior notice until a formal contract is signed.'}</li>
                  <li>{lang === 'es' ? 'Los pagos deben realizarse según los términos acordados en el contrato. El incumplimiento en el pago puede resultar en la suspensión o terminación de los servicios.' : 'Payments must be made according to the terms agreed in the contract. Failure to pay may result in suspension or termination of services.'}</li>
                  <li>{lang === 'es' ? 'Todos los precios están expresados en la moneda especificada en el contrato y pueden estar sujetos a impuestos aplicables.' : 'All prices are expressed in the currency specified in the contract and may be subject to applicable taxes.'}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '7. Cancelaciones y Reembolsos' : '7. Cancellations and Refunds'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Las políticas de cancelación y reembolso se establecerán en el contrato específico de cada proyecto. En general:'
                    : 'Cancellation and refund policies will be established in the specific contract for each project. In general:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{lang === 'es' ? 'Las cancelaciones deben notificarse por escrito con la anticipación especificada en el contrato.' : 'Cancellations must be notified in writing with the advance notice specified in the contract.'}</li>
                  <li>{lang === 'es' ? 'Los reembolsos, si aplican, se calcularán según el trabajo completado y los costos incurridos hasta la fecha de cancelación.' : 'Refunds, if applicable, will be calculated based on completed work and costs incurred up to the cancellation date.'}</li>
                  <li>{lang === 'es' ? 'No se realizarán reembolsos por servicios ya entregados y aceptados por el cliente.' : 'No refunds will be made for services already delivered and accepted by the client.'}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '8. Garantías y Limitación de Responsabilidad' : '8. Warranties and Limitation of Liability'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Nuestros servicios se proporcionan "tal cual" y "según disponibilidad". En la máxima medida permitida por la ley aplicable:'
                    : 'Our services are provided "as is" and "as available". To the maximum extent permitted by applicable law:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{lang === 'es' ? 'RENUNCIAMOS A TODAS LAS GARANTÍAS, EXPRESAS O IMPLÍCITAS, incluyendo pero no limitado a garantías de comerciabilidad, idoneidad para un propósito particular, no infracción y seguridad.' : 'WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, and security.'}</li>
                  <li>{lang === 'es' ? 'NO SEREMOS RESPONSABLES de ningún daño directo, indirecto, incidental, especial, consecuente o punitivo, incluyendo pero no limitado a pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles, resultantes del uso o la imposibilidad de usar nuestros servicios.' : 'WE SHALL NOT BE LIABLE for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from the use or inability to use our services.'}</li>
                  <li>{lang === 'es' ? 'Nuestra responsabilidad total hacia usted por cualquier reclamo relacionado con nuestros servicios no excederá el monto total pagado por usted a nosotros en los doce (12) meses anteriores al evento que dio lugar al reclamo.' : 'Our total liability to you for any claim related to our services shall not exceed the total amount paid by you to us in the twelve (12) months preceding the event giving rise to the claim.'}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '9. Indemnización' : '9. Indemnification'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Usted acepta indemnizar, defender y eximir de responsabilidad a imSoft, Inc., sus afiliados, directores, empleados, agentes y licenciantes de y contra cualquier reclamo, demanda, pérdida, responsabilidad y gasto (incluyendo honorarios legales razonables) que surjan de o estén relacionados con: (a) su uso de nuestros servicios; (b) su violación de estos términos; (c) su violación de cualquier derecho de terceros; o (d) cualquier contenido que usted proporcione o transmita a través de nuestros servicios.'
                    : 'You agree to indemnify, defend, and hold harmless imSoft, Inc., its affiliates, directors, employees, agents, and licensors from and against any claim, demand, loss, liability, and expense (including reasonable legal fees) arising from or related to: (a) your use of our services; (b) your violation of these terms; (c) your violation of any third-party rights; or (d) any content that you provide or transmit through our services.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '10. Privacidad y Protección de Datos' : '10. Privacy and Data Protection'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'El uso de nuestros servicios también está sujeto a nuestro Aviso de Privacidad, que forma parte integral de estos términos. Al utilizar nuestros servicios, usted acepta las prácticas descritas en nuestro Aviso de Privacidad. Le recomendamos leer cuidadosamente nuestro Aviso de Privacidad para comprender cómo recopilamos, utilizamos y protegemos su información personal.'
                    : 'The use of our services is also subject to our Privacy Policy, which is an integral part of these terms. By using our services, you agree to the practices described in our Privacy Policy. We recommend that you carefully read our Privacy Policy to understand how we collect, use, and protect your personal information.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '11. Terminación' : '11. Termination'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Nos reservamos el derecho de terminar o suspender su acceso a nuestros servicios, sin previo aviso, por cualquier motivo, incluyendo pero no limitado a:'
                    : 'We reserve the right to terminate or suspend your access to our services, without prior notice, for any reason, including but not limited to:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{lang === 'es' ? 'Violación de estos términos y condiciones.' : 'Violation of these terms and conditions.'}</li>
                  <li>{lang === 'es' ? 'Uso fraudulento, ilegal o no autorizado de nuestros servicios.' : 'Fraudulent, illegal, or unauthorized use of our services.'}</li>
                  <li>{lang === 'es' ? 'Incumplimiento en el pago de servicios contratados.' : 'Failure to pay for contracted services.'}</li>
                  <li>{lang === 'es' ? 'Cualquier actividad que, a nuestra sola discreción, pueda dañar nuestra reputación o la de nuestros usuarios.' : 'Any activity that, in our sole discretion, may harm our reputation or that of our users.'}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '12. Modificaciones de los Términos' : '12. Modifications to Terms'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en este sitio web. Su uso continuado de nuestros servicios después de la publicación de modificaciones constituye su aceptación de los términos modificados. Si no está de acuerdo con las modificaciones, debe cesar el uso de nuestros servicios inmediatamente. Le recomendamos revisar periódicamente estos términos para estar informado de cualquier cambio.'
                    : 'We reserve the right to modify these terms and conditions at any time. Modifications will take effect immediately after being posted on this website. Your continued use of our services after the posting of modifications constitutes your acceptance of the modified terms. If you do not agree with the modifications, you must cease using our services immediately. We recommend that you periodically review these terms to be informed of any changes.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '13. Ley Aplicable y Jurisdicción' : '13. Applicable Law and Jurisdiction'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Estos términos y condiciones se regirán e interpretarán de acuerdo con las leyes de México, sin dar efecto a sus disposiciones sobre conflictos de leyes. Cualquier disputa que surja de o esté relacionada con estos términos o nuestros servicios será sometida a la jurisdicción exclusiva de los tribunales competentes de México. Si alguna disposición de estos términos se considera inválida o inaplicable, las disposiciones restantes permanecerán en pleno vigor y efecto.'
                    : 'These terms and conditions shall be governed by and construed in accordance with the laws of Mexico, without giving effect to its conflict of law provisions. Any dispute arising from or related to these terms or our services shall be submitted to the exclusive jurisdiction of the competent courts of Mexico. If any provision of these terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '14. Disposiciones Generales' : '14. General Provisions'}
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{lang === 'es' ? 'Estos términos constituyen el acuerdo completo entre usted y imSoft, Inc. respecto al uso de nuestros servicios y reemplazan todos los acuerdos anteriores.' : 'These terms constitute the entire agreement between you and imSoft, Inc. regarding the use of our services and supersede all prior agreements.'}</li>
                  <li>{lang === 'es' ? 'Nuestra falta de ejercer o hacer valer cualquier derecho o disposición de estos términos no constituirá una renuncia a tal derecho o disposición.' : 'Our failure to exercise or enforce any right or provision of these terms shall not constitute a waiver of such right or provision.'}</li>
                  <li>{lang === 'es' ? 'Usted no puede transferir o ceder estos términos o sus derechos u obligaciones bajo estos términos sin nuestro consentimiento previo por escrito.' : 'You may not transfer or assign these terms or your rights or obligations under these terms without our prior written consent.'}</li>
                  <li>{lang === 'es' ? 'Si alguna disposición de estos términos se considera inválida, ilegal o inaplicable, las disposiciones restantes continuarán en pleno vigor y efecto.' : 'If any provision of these terms is found to be invalid, illegal, or unenforceable, the remaining provisions will continue in full force and effect.'}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '15. Contacto' : '15. Contact'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Si tiene preguntas, comentarios o inquietudes sobre estos términos y condiciones, puede contactarnos a través de nuestra página de contacto o por correo electrónico. Nos comprometemos a responder a sus consultas en un plazo razonable.'
                    : 'If you have questions, comments, or concerns about these terms and conditions, you can contact us through our contact page or by email. We are committed to responding to your inquiries within a reasonable time.'}
                </p>
              </section>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {lang === 'es'
                    ? 'Última actualización: Enero 2026. Al utilizar nuestros servicios, usted reconoce que ha leído, entendido y acepta estar sujeto a estos términos y condiciones.'
                    : 'Last updated: January 2026. By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.'}
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
