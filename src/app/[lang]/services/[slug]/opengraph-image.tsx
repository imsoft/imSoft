import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: { lang: string; slug: string }
}) {
  const { lang, slug } = params
  const isEs = lang === 'es'

  let title = ''
  let description = ''
  let icon = ''

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/services?slug=eq.${slug}&select=title_es,title_en,description_es,description_en,icon&limit=1`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        next: { revalidate: 3600 },
      }
    )
    const data = await res.json()
    if (data?.[0]) {
      title = isEs
        ? (data[0].title_es || data[0].title_en || '')
        : (data[0].title_en || data[0].title_es || '')
      description = isEs
        ? (data[0].description_es || data[0].description_en || '')
        : (data[0].description_en || data[0].description_es || '')
      icon = data[0].icon || ''
    }
  } catch {}

  // Fallback si no hay datos en BD
  if (!title) {
    title = isEs ? 'Servicio imSoft' : 'imSoft Service'
  }

  // Recorta la descripción para que quepa en la imagen
  const shortDesc =
    description.length > 110 ? description.slice(0, 107) + '…' : description

  // Tamaño de fuente del título según longitud
  const titleSize = title.length > 35 ? '52px' : title.length > 20 ? '64px' : '72px'

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '64px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top: Logo imSoft */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'white', fontSize: '26px', fontWeight: 700 }}>i</span>
          </div>
          <span style={{ color: 'white', fontSize: '30px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            imSoft
          </span>
        </div>

        {/* Center: Contenido del servicio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
          {/* Badge categoria + icono */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: '100px',
              padding: '8px 22px',
              width: 'fit-content',
            }}
          >
            {icon && (
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{icon}</span>
            )}
            <span style={{ color: '#a5b4fc', fontSize: '15px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {isEs ? 'Servicio' : 'Service'}
            </span>
          </div>

          {/* Título */}
          <div
            style={{
              color: 'white',
              fontSize: titleSize,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-1px',
            }}
          >
            {title}
          </div>

          {/* Descripción corta */}
          {shortDesc && (
            <div
              style={{
                color: '#94a3b8',
                fontSize: '22px',
                lineHeight: 1.55,
                maxWidth: '820px',
              }}
            >
              {shortDesc}
            </div>
          )}
        </div>

        {/* Bottom: URL + separador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '3px',
              borderRadius: '2px',
              background: '#6366f1',
            }}
          />
          <span style={{ color: '#475569', fontSize: '17px', letterSpacing: '0.02em' }}>
            imsoft.io
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
