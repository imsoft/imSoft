/**
 * Tarjeta para compartir (WhatsApp, correo, Slack) de cotizaciones y contratos.
 * Sin importes: la vista previa la puede ver cualquiera a quien le reenvíen el enlace.
 * Se usa desde las rutas opengraph-image (edge), por eso no depende de nada del servidor.
 */

export interface OgDocumento {
  tipo: 'Cotización' | 'Contrato'
  folio: string
  titulo: string
  cliente: string
  pie: string
}

export const OG_SIZE = { width: 1200, height: 630 }

export function tarjetaDocumento(d: OgDocumento) {
  const titleSize = d.titulo.length > 60 ? 44 : d.titulo.length > 40 ? 52 : 60
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 80px',
        background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#1565c0', fontSize: 34, fontWeight: 800 }}>S</span>
          </div>
          <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>imSoft</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 20, letterSpacing: 4, opacity: 0.8, textTransform: 'uppercase' }}>{d.tipo}</span>
          <span style={{ fontSize: 34, fontWeight: 700, fontFamily: 'ui-monospace, Menlo, monospace' }}>{d.folio}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 24, opacity: 0.85 }}>{`Para ${d.cliente}`}</div>
        <div style={{ fontSize: titleSize, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, maxWidth: 1040 }}>{d.titulo}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, opacity: 0.85 }}>
        <span>{d.pie}</span>
        <span>imsoft.io</span>
      </div>
    </div>
  )
}

export function acortar(s: string, max: number): string {
  const t = s.trim()
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}
