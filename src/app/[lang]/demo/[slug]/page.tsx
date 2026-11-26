import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DEMO_SITES, isDemoSlug } from '@/lib/demo-sites'
import { DemoSite } from '@/components/demo/demo-site'

// Sample sites for prospects: Spanish only, static, never indexed.
export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(DEMO_SITES).map((slug) => ({ lang: 'es', slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!isDemoSlug(slug)) return {}
  const s = DEMO_SITES[slug]
  // What WhatsApp and Instagram show in the link preview; the image is opengraph-image.tsx.
  const title = `${s.name} · Ejemplo de página web`
  const description = `Así puede verse la página de tu negocio: servicios, fotos, reseñas, ubicación y botón de WhatsApp. Hecha por imSoft.`
  return {
    title: { absolute: `${s.title} · Ejemplo de imSoft` },
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: 'website', siteName: 'imSoft', locale: 'es_MX', url: `/es/demo/${slug}` },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function DemoPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  if (lang !== 'es' || !isDemoSlug(slug)) notFound()
  return <DemoSite slug={slug} />
}
