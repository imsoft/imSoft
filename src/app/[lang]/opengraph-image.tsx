import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'imSoft - Soluciones Tecnológicas Modernas'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { lang: string } }) {
  const { lang } = params
  const isEs = lang === 'es'

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
          padding: '72px 80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top: Logo + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ color: 'white', fontSize: '28px', fontWeight: 700 }}>i</div>
          </div>
          <span style={{ color: 'white', fontSize: '32px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            imSoft
          </span>
        </div>

        {/* Center: Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '100px',
              padding: '6px 20px',
              width: 'fit-content',
            }}
          >
            <span style={{ color: '#a5b4fc', fontSize: '16px', fontWeight: 500 }}>
              {isEs ? 'Desarrollo de Software' : 'Software Development'}
            </span>
          </div>
          <h1
            style={{
              color: 'white',
              fontSize: '64px',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-1px',
              margin: 0,
              maxWidth: '800px',
            }}
          >
            {isEs
              ? 'Soluciones Tecnológicas Modernas'
              : 'Modern Technology Solutions'}
          </h1>
          <p
            style={{
              color: '#94a3b8',
              fontSize: '24px',
              lineHeight: 1.5,
              margin: 0,
              maxWidth: '700px',
            }}
          >
            {isEs
              ? 'Transformamos tu negocio con software a medida, consultoría tecnológica y soluciones digitales.'
              : 'We transform your business with custom software, technology consulting and digital solutions.'}
          </p>
        </div>

        {/* Bottom: URL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
          <span style={{ color: '#64748b', fontSize: '18px' }}>imsoft.io</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
