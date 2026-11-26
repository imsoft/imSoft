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
  return {
    title: { absolute: `${DEMO_SITES[slug].title} · Ejemplo de imSoft` },
    description: 'Página web de ejemplo para un negocio ficticio, hecha por imSoft.',
    robots: { index: false, follow: false },
  }
}

export default async function DemoPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  if (lang !== 'es' || !isDemoSlug(slug)) notFound()
  return <DemoSite slug={slug} />
}
