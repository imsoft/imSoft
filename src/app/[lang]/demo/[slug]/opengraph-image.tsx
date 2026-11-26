import { ImageResponse } from 'next/og'
import { DEMO_SITES, isDemoSlug, unsplash } from '@/lib/demo-sites'

// Link preview of a sample site (WhatsApp, Instagram, Facebook): the industry's own photo
// and name instead of imSoft's generic card, so the prospect sees what they'll open.
export const alt = 'Ejemplo de página web hecha por imSoft'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Bold weight for the business name; the default font of ImageResponse only has a regular cut.
async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch('https://fonts.googleapis.com/css2?family=Montserrat:wght@800')).text()
    const url = css.match(/src: url\((.+?)\) format/)?.[1]
    return url ? await (await fetch(url)).arrayBuffer() : null
  } catch {
    return null
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isDemoSlug(slug)) return new Response('Not found', { status: 404 })
  const s = DEMO_SITES[slug]
  const bold = await loadFont()

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', fontFamily: 'system-ui, sans-serif' }}>
        <img src={unsplash(s.heroImage, 1200)} alt="" width={1200} height={630} style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, display: 'flex', backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.2) 100%)' }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', width: '100%' }}>
          <div style={{ display: 'flex' }}>
            <span style={{ background: s.colors.accent, color: s.colors.accentFg, fontSize: 22, fontWeight: 700, padding: '8px 20px', borderRadius: 999, letterSpacing: 2, textTransform: 'uppercase' }}>
              Ejemplo de página web
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{ color: 'white', fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -2, fontFamily: bold ? 'Montserrat' : 'system-ui' }}>{s.name}</span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 34 }}>{s.tagline} · {s.rating} estrellas en Google</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'white', fontSize: 26 }}>
            <span style={{ background: '#1e9df1', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>i</span>
            <span style={{ fontWeight: 700 }}>imSoft</span>
            <span style={{ opacity: 0.75 }}>· Páginas web para negocios en Guadalajara</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: bold ? [{ name: 'Montserrat', data: bold, weight: 800, style: 'normal' }] : [] },
  )
}
