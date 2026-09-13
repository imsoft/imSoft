import { ImageResponse } from 'next/og';
import { localizedServiceTitle } from '@/lib/service-seo';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Imagen para compartir de cada servicio. Antes era la foto de stock de Unsplash del
 * servicio: al compartir el enlace se veia una foto ajena sin marca ni titulo.
 */
export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const isEs = lang === 'es';
  let title = '';
  let description = '';

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/services?slug=eq.${encodeURIComponent(slug)}&select=title_es,title_en,description_es,description_en&limit=1`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        next: { revalidate: 3600 },
      },
    );
    const data = await res.json();
    const row = data?.[0];
    if (row) {
      title = localizedServiceTitle(slug, (isEs ? row.title_es : row.title_en) || row.title_es || '', lang);
      description = (isEs ? row.description_es : row.description_en) || '';
    }
  } catch {}

  if (!title) title = isEs ? 'Servicios de software en Guadalajara' : 'Software services in Guadalajara, Mexico';
  const short = description.length > 120 ? `${description.slice(0, 117)}…` : description;
  const titleSize = title.length > 48 ? 48 : title.length > 32 ? 58 : 68;

  return new ImageResponse(
    (
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#1565c0', fontSize: 34, fontWeight: 800 }}>S</span>
          </div>
          <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>imSoft</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: titleSize, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1 }}>{title}</div>
          {short && <div style={{ fontSize: 26, lineHeight: 1.35, opacity: 0.9, maxWidth: 980 }}>{short}</div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, opacity: 0.85 }}>
          <span>{isEs ? 'Guadalajara, Jalisco · propuesta con precio fijo en 48 h' : 'Guadalajara, Mexico · fixed-price proposal in 48 h'}</span>
          <span>imsoft.io</span>
        </div>
      </div>
    ),
    size,
  );
}
