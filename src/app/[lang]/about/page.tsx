import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../dictionaries';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';
import { Check } from 'lucide-react';
import Magnet from '@/components/ui/magnet';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';
  return generateSEOMetadata({
    title: lang === 'es' ? 'Nosotros — imSoft' : 'About Us — imSoft',
    description: lang === 'es'
      ? 'Somos imSoft, una agencia de desarrollo de software en Guadalajara. Construimos el software exacto que tu negocio necesita con tecnologías modernas y un equipo comprometido con tus resultados.'
      : 'We are imSoft, a software development agency in Guadalajara. We build the exact software your business needs with modern technologies and a team committed to your results.',
    url: `${SITE_URL}/${lang}/about`,
    type: 'website',
    tags: lang === 'es'
      ? ['nosotros', 'equipo', 'agencia de software', 'Guadalajara']
      : ['about', 'team', 'software agency', 'Guadalajara'],
    alternateUrls: {
      es: `${SITE_URL}/es/about`,
      en: `${SITE_URL}/en/about`,
    },
  }, lang);
}

export default async function AboutPage({
  params,
}: {
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

  const isEs = lang === 'es';
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io';

  const whatsappUrl = `https://wa.me/523325365558?text=${encodeURIComponent(
    isEs
      ? 'Hola imSoft, me gustaría conocer más sobre ustedes y cómo pueden ayudarme. ¿Podemos agendar una llamada?'
      : 'Hi imSoft, I would like to learn more about your team and how you can help me. Can we schedule a call?'
  )}`;

  const breadcrumbStructuredData = generateStructuredData({
    type: 'BreadcrumbList',
    data: {
      items: [
        { name: isEs ? 'Inicio' : 'Home', url: `${SITE_URL}/${lang}` },
        { name: isEs ? 'Nosotros' : 'About', url: `${SITE_URL}/${lang}/about` },
      ],
    },
  });

  const values = isEs
    ? [
        { icon: '🎯', title: 'Foco en resultados', description: 'No medimos el éxito en líneas de código entregadas, sino en si tu negocio creció gracias a lo que construimos.' },
        { icon: '🔍', title: 'Transparencia total', description: 'Precio fijo desde el inicio, avances semanales visibles y acceso completo al código. Sin sorpresas ni letra chica.' },
        { icon: '⚡', title: 'Tecnología actual', description: 'Usamos herramientas modernas y probadas que escalan con tu negocio. Nada de tecnología obsoleta que te encadene o que haya que reescribir en dos años.' },
        { icon: '🤝', title: 'Socios, no proveedores', description: 'Nos importa que el proyecto funcione después del lanzamiento. Por eso acompañamos, capacitamos y seguimos disponibles.' },
      ]
    : [
        { icon: '🎯', title: 'Results-focused', description: "We don't measure success in lines of code delivered, but in whether your business grew because of what we built." },
        { icon: '🔍', title: 'Full transparency', description: 'Fixed price from the start, visible weekly progress, and complete code access. No surprises, no fine print.' },
        { icon: '⚡', title: 'Current technology', description: 'We use modern, proven tools that scale with your business. No obsolete technology that locks you in or needs to be rewritten in two years.' },
        { icon: '🤝', title: 'Partners, not vendors', description: "We care that the project works after launch. That's why we accompany, train, and stay available." },
      ];

  const differentiators = isEs
    ? [
        'Precio fijo en cada proyecto — sin cobros sorpresa al cerrar',
        'El código siempre es tuyo, sin licencias ni dependencias',
        'Entregas incrementales: ves avances desde la primera semana',
        'Stack moderno que escala sin reescribir desde cero',
        'Soporte en español, en tu zona horaria, por WhatsApp',
        'Primer mes de soporte post-lanzamiento incluido',
      ]
    : [
        'Fixed price on every project — no surprise charges at close',
        'The code is always yours, no licenses or dependencies',
        'Incremental deliveries: you see progress from week one',
        'Modern stack that scales without rewriting from scratch',
        'Support in your language, your time zone, via WhatsApp',
        'First month of post-launch support included',
      ];

  return (
    <>
      <StructuredData data={breadcrumbStructuredData} id="breadcrumb-structured-data" />
      <div>
        <HeroHeader dict={dict} lang={lang} />
        <main className="pt-24">

          {/* ── Hero ── */}
          <section className="py-20 md:py-28 bg-background">
            <div className="mx-auto max-w-4xl px-6 text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-semibold mb-6">
                <span>🏢</span>
                <span>{isEs ? 'Guadalajara, México' : 'Guadalajara, Mexico'}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {isEs ? 'Construimos el software que tu negocio merece' : 'We build the software your business deserves'}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {isEs
                  ? 'Somos un equipo de desarrolladores y diseñadores en Guadalajara que cree que la tecnología bien hecha cambia negocios reales. Cada proyecto que salimos a construir lo tratamos como si fuera el nuestro.'
                  : "We're a team of developers and designers in Guadalajara who believe that well-crafted technology changes real businesses. Every project we take on, we treat as if it were our own."}
              </p>
            </div>
          </section>

          {/* ── Historia ── */}
          <section className="py-16 md:py-24 bg-muted/50">
            <div className="mx-auto max-w-5xl px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    {isEs ? '¿Por qué existe imSoft?' : 'Why does imSoft exist?'}
                  </h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      {isEs
                        ? 'imSoft nació de una frustración común: negocios que necesitan software a medida pero encuentran agencias que entregan proyectos genéricos, fuera de tiempo y con costos que se disparan al final.'
                        : 'imSoft was born from a common frustration: businesses that need custom software but find agencies that deliver generic projects, late and with costs that spiral at the end.'}
                    </p>
                    <p>
                      {isEs
                        ? 'Decidimos hacer las cosas diferente: precio fijo desde el primer día, entregas semanales visibles, tecnologías modernas que escalan, y código que siempre es propiedad del cliente. Sin sorpresas, sin dependencias, sin letra chica.'
                        : "We decided to do things differently: fixed price from day one, visible weekly deliveries, modern technologies that scale, and code that always belongs to the client. No surprises, no dependencies, no fine print."}
                    </p>
                    <p>
                      {isEs
                        ? 'Hoy trabajamos con empresas de todos los tamaños — desde fundadores que lanzan su primer MVP hasta corporativos que necesitan digitalizar operaciones complejas.'
                        : 'Today we work with companies of all sizes — from founders launching their first MVP to corporations needing to digitize complex operations.'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { number: '50+', label: isEs ? 'Proyectos entregados' : 'Projects delivered' },
                    { number: '6+', label: isEs ? 'Años de experiencia' : 'Years of experience' },
                    { number: '13', label: isEs ? 'Servicios especializados' : 'Specialized services' },
                    { number: '100%', label: isEs ? 'Código tuyo siempre' : 'Always your code' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-background rounded-2xl p-6 text-center border border-border">
                      <div className="text-4xl font-black text-primary mb-2">{stat.number}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Valores ── */}
          <section className="py-16 md:py-24 bg-background">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  {isEs ? 'Lo que nos guía' : 'What guides us'}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {isEs
                    ? 'Cuatro principios que definen cómo trabajamos en cada proyecto.'
                    : 'Four principles that define how we work on every project.'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, i) => (
                  <div key={i} className="bg-muted/40 rounded-2xl p-6 border border-border">
                    <div className="text-4xl mb-4">{value.icon}</div>
                    <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Por qué elegirnos ── */}
          <section className="py-16 md:py-24 bg-muted/50">
            <div className="mx-auto max-w-4xl px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  {isEs ? '¿Por qué trabajar con imSoft?' : 'Why work with imSoft?'}
                </h2>
                <p className="text-muted-foreground">
                  {isEs
                    ? 'Las cosas concretas que nos diferencian de otras agencias.'
                    : 'The concrete things that set us apart from other agencies.'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {differentiators.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-background rounded-xl p-4 border border-border">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA Banner ── */}
          <section className="bg-primary py-20 px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                {isEs ? '¿Listo para trabajar juntos?' : 'Ready to work together?'}
              </h2>
              <p className="text-primary-foreground/75 text-lg mb-10 leading-relaxed">
                {isEs
                  ? 'La primera llamada es gratuita, sin compromiso y sin lenguaje técnico.'
                  : 'The first call is free, no commitment, and no technical jargon.'}
              </p>
              <Magnet padding={50} disabled={false} magnetStrength={10}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-background text-foreground font-semibold px-8 py-4 rounded-xl hover:bg-muted transition-colors text-base"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366]" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {isEs ? 'Agendar llamada gratuita' : 'Schedule a free call'}
                </a>
              </Magnet>
            </div>
          </section>

        </main>
        <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
      </div>
    </>
  );
}
