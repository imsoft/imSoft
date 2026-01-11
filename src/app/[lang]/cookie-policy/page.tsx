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
  const url = `${SITE_URL}/${lang}/cookie-policy`;

  return generateSEOMetadata({
    title: lang === 'es'
      ? 'Política de Cookies'
      : 'Cookie Policy',
    description: lang === 'es'
      ? 'Política de cookies de imSoft. Conoce qué cookies utilizamos y cómo puedes gestionarlas.'
      : 'imSoft cookie policy. Learn about the cookies we use and how you can manage them.',
    url,
    type: 'website',
    noindex: true,
  }, lang);
}

export default async function CookiePolicyPage({ params }: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const supabase = await createClient();

  const { data: contactData } = await supabase
    .from('contact')
    .select('*')
    .limit(1)
    .maybeSingle();

  const title = lang === 'es' ? 'Política de Cookies' : 'Cookie Policy';

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
                  ? 'Esta Política de Cookies explica qué son las cookies, cómo las utilizamos en nuestro sitio web, los tipos de cookies que empleamos, la información que recopilamos mediante cookies y cómo se utiliza esa información. También describe las opciones que tienes para aceptar o rechazar cookies.'
                  : 'This Cookie Policy explains what cookies are, how we use them on our website, the types of cookies we employ, the information we collect through cookies, and how that information is used. It also describes the options you have to accept or reject cookies.'}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '1. ¿Qué son las Cookies?' : '1. What are Cookies?'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (computadora, tablet o móvil) cuando visitas un sitio web. Las cookies permiten que el sitio web reconozca tu dispositivo y recuerde información sobre tu visita, como tus preferencias, idioma, y otra información que puede hacer que tu próxima visita sea más fácil y el sitio más útil para ti.'
                    : 'Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. Cookies allow the website to recognize your device and remember information about your visit, such as your preferences, language, and other information that can make your next visit easier and the site more useful to you.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '2. ¿Cómo Utilizamos las Cookies?' : '2. How Do We Use Cookies?'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Utilizamos cookies para varios propósitos, incluyendo mejorar tu experiencia en nuestro sitio web, analizar cómo se utiliza el sitio y personalizar contenido. Las cookies nos ayudan a:'
                    : 'We use cookies for various purposes, including improving your experience on our website, analyzing how the site is used, and personalizing content. Cookies help us to:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>{lang === 'es' ? 'Mantener tu sesión iniciada mientras navegas por el sitio' : 'Keep you logged in as you browse the site'}</li>
                  <li>{lang === 'es' ? 'Recordar tus preferencias de idioma y tema (oscuro/claro)' : 'Remember your language and theme preferences (dark/light)'}</li>
                  <li>{lang === 'es' ? 'Entender cómo interactúas con nuestro sitio web' : 'Understand how you interact with our website'}</li>
                  <li>{lang === 'es' ? 'Mejorar el rendimiento y funcionalidad del sitio' : 'Improve site performance and functionality'}</li>
                  <li>{lang === 'es' ? 'Proporcionar funcionalidades personalizadas' : 'Provide personalized features'}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '3. Tipos de Cookies que Utilizamos' : '3. Types of Cookies We Use'}
                </h2>

                <div className="space-y-6">
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {lang === 'es' ? '3.1. Cookies Esenciales (Necesarias)' : '3.1. Essential (Necessary) Cookies'}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      {lang === 'es'
                        ? 'Estas cookies son estrictamente necesarias para el funcionamiento del sitio web y no se pueden desactivar en nuestros sistemas. Por lo general, solo se configuran en respuesta a acciones realizadas por ti, como establecer tus preferencias de privacidad, iniciar sesión o completar formularios.'
                        : 'These cookies are strictly necessary for the website to function and cannot be disabled in our systems. They are usually only set in response to actions you take, such as setting your privacy preferences, logging in, or filling out forms.'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>{lang === 'es' ? 'Ejemplos:' : 'Examples:'}</strong>
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                      <li>
                        <strong>supabase-auth-token:</strong> {lang === 'es' ? 'Cookie de autenticación de Supabase para mantener tu sesión activa' : 'Supabase authentication cookie to keep your session active'}
                      </li>
                      <li>
                        <strong>imsoft_cookie_consent:</strong> {lang === 'es' ? 'Almacena tus preferencias de cookies' : 'Stores your cookie preferences'}
                      </li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {lang === 'es' ? '3.2. Cookies Funcionales' : '3.2. Functional Cookies'}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      {lang === 'es'
                        ? 'Estas cookies permiten que el sitio web proporcione funcionalidades mejoradas y personalización. Pueden ser configuradas por nosotros o por terceros cuyos servicios hemos agregado a nuestras páginas.'
                        : 'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>{lang === 'es' ? 'Ejemplos:' : 'Examples:'}</strong>
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                      <li>
                        <strong>theme:</strong> {lang === 'es' ? 'Recuerda tu preferencia de tema (oscuro/claro/sistema)' : 'Remembers your theme preference (dark/light/system)'}
                      </li>
                      <li>
                        <strong>language:</strong> {lang === 'es' ? 'Almacena tu idioma preferido' : 'Stores your preferred language'}
                      </li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {lang === 'es' ? '3.3. Cookies Analíticas' : '3.3. Analytics Cookies'}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      {lang === 'es'
                        ? 'Estas cookies nos permiten contar visitas y fuentes de tráfico para poder medir y mejorar el rendimiento de nuestro sitio. Nos ayudan a saber qué páginas son las más y las menos populares y ver cómo los visitantes se mueven por el sitio. Toda la información que estas cookies recopilan es agregada y, por lo tanto, anónima.'
                        : 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous.'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>{lang === 'es' ? 'Servicios que utilizamos:' : 'Services we use:'}</strong>
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                      <li>
                        <strong>Vercel Analytics:</strong> {lang === 'es' ? 'Analíticas sin cookies que respetan tu privacidad' : 'Cookie-free analytics that respect your privacy'}
                      </li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {lang === 'es' ? '3.4. Cookies de Marketing' : '3.4. Marketing Cookies'}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      {lang === 'es'
                        ? 'Estas cookies pueden ser configuradas a través de nuestro sitio por nuestros socios publicitarios. Pueden ser utilizadas por esas empresas para construir un perfil de tus intereses y mostrarte anuncios relevantes en otros sitios.'
                        : 'These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant ads on other sites.'}
                    </p>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {lang === 'es'
                        ? '⚠️ Actualmente NO utilizamos cookies de marketing en nuestro sitio web.'
                        : '⚠️ We currently DO NOT use marketing cookies on our website.'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '4. Duración de las Cookies' : '4. Cookie Duration'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Utilizamos tanto cookies de sesión como cookies persistentes:'
                    : 'We use both session cookies and persistent cookies:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Cookies de Sesión:' : 'Session Cookies:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Son cookies temporales que se eliminan cuando cierras tu navegador.'
                      : 'These are temporary cookies that are deleted when you close your browser.'}
                  </li>
                  <li>
                    <strong className="text-foreground">{lang === 'es' ? 'Cookies Persistentes:' : 'Persistent Cookies:'}</strong>{' '}
                    {lang === 'es'
                      ? 'Permanecen en tu dispositivo durante un período de tiempo específico o hasta que las elimines manualmente. La duración varía según el propósito de cada cookie.'
                      : 'These remain on your device for a specific period of time or until you manually delete them. The duration varies depending on the purpose of each cookie.'}
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '5. Cómo Gestionar las Cookies' : '5. How to Manage Cookies'}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Tienes varias opciones para gestionar las cookies:'
                    : 'You have several options to manage cookies:'}
                </p>

                <h3 className="text-xl font-semibold mb-3">
                  {lang === 'es' ? '5.1. A través de Nuestro Banner de Cookies' : '5.1. Through Our Cookie Banner'}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Cuando visites nuestro sitio web por primera vez, verás un banner de cookies que te permite:'
                    : 'When you first visit our website, you will see a cookie banner that allows you to:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-4">
                  <li>{lang === 'es' ? 'Aceptar todas las cookies' : 'Accept all cookies'}</li>
                  <li>{lang === 'es' ? 'Rechazar cookies opcionales (mantener solo las esenciales)' : 'Reject optional cookies (keep only essential ones)'}</li>
                  <li>{lang === 'es' ? 'Personalizar tus preferencias por categoría de cookies' : 'Customize your preferences by cookie category'}</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'Puedes cambiar tus preferencias en cualquier momento haciendo clic en el enlace "Configuración de Cookies" en el pie de página de nuestro sitio web.'
                    : 'You can change your preferences at any time by clicking on the "Cookie Settings" link in the footer of our website.'}
                </p>

                <h3 className="text-xl font-semibold mb-3">
                  {lang === 'es' ? '5.2. A través de tu Navegador' : '5.2. Through Your Browser'}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {lang === 'es'
                    ? 'La mayoría de los navegadores web te permiten controlar las cookies a través de su configuración. Puedes configurar tu navegador para rechazar cookies o para alertarte cuando se envíen cookies. Sin embargo, ten en cuenta que si desactivas o rechazas las cookies, algunas partes de nuestro sitio web pueden no funcionar correctamente.'
                    : 'Most web browsers allow you to control cookies through their settings. You can set your browser to reject cookies or to alert you when cookies are being sent. However, please note that if you disable or reject cookies, some parts of our website may not function properly.'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lang === 'es' ? 'Instrucciones para navegadores populares:' : 'Instructions for popular browsers:'}
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                  <li>Google Chrome: Settings → Privacy and security → Cookies and other site data</li>
                  <li>Firefox: Settings → Privacy & Security → Cookies and Site Data</li>
                  <li>Safari: Preferences → Privacy → Cookies and website data</li>
                  <li>Microsoft Edge: Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '6. Cookies de Terceros' : '6. Third-Party Cookies'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Además de nuestras propias cookies, también podemos utilizar cookies de terceros confiables para ayudarnos a analizar cómo se utiliza nuestro sitio web y mejorar nuestros servicios. Estos terceros tienen sus propias políticas de privacidad y te recomendamos revisarlas. Actualmente utilizamos:'
                    : 'In addition to our own cookies, we may also use trusted third-party cookies to help us analyze how our website is used and improve our services. These third parties have their own privacy policies and we recommend reviewing them. We currently use:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mt-4">
                  <li>
                    <strong className="text-foreground">Supabase:</strong>{' '}
                    {lang === 'es'
                      ? 'Para autenticación y gestión de base de datos'
                      : 'For authentication and database management'}
                  </li>
                  <li>
                    <strong className="text-foreground">Vercel Analytics:</strong>{' '}
                    {lang === 'es'
                      ? 'Para análisis de tráfico sin cookies invasivas'
                      : 'For traffic analysis without invasive cookies'}
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '7. Actualizaciones de esta Política' : '7. Updates to this Policy'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios en las cookies que utilizamos o por razones operativas, legales o regulatorias. Te recomendamos revisar esta política periódicamente para estar informado sobre cómo utilizamos las cookies. Si realizamos cambios materiales, actualizaremos la versión de la política y te solicitaremos que aceptes nuevamente tus preferencias de cookies.'
                    : 'We may update this Cookie Policy occasionally to reflect changes in the cookies we use or for operational, legal, or regulatory reasons. We recommend reviewing this policy periodically to stay informed about how we use cookies. If we make material changes, we will update the policy version and request that you accept your cookie preferences again.'}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  {lang === 'es' ? '8. Contacto' : '8. Contact'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {lang === 'es'
                    ? 'Si tienes preguntas sobre esta Política de Cookies o sobre cómo manejamos las cookies, por favor contáctanos a través de nuestra página de contacto o envíanos un correo a contacto@imsoft.io.'
                    : 'If you have questions about this Cookie Policy or how we handle cookies, please contact us through our contact page or send us an email at contacto@imsoft.io.'}
                </p>
              </section>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {lang === 'es'
                    ? 'Última actualización: Enero 2026. Versión 1.0.0'
                    : 'Last updated: January 2026. Version 1.0.0'}
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
