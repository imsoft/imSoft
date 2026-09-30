'use client'

import { toast } from 'sonner'

/**
 * Unico punto de entrada para escribirle a un contacto: crea (o recupera) su borrador
 * de prospeccion y devuelve la URL de la pestaña Prospección con ese borrador abierto.
 */
export async function prepararCorreo(contactId: string, lang: string, opts: { seguimiento?: boolean } = {}): Promise<string | null> {
  const es = lang !== 'en'
  // La IA tarda unos segundos en proponer el gancho: sin este aviso parece que el clic no hizo nada.
  const aviso = toast.loading(opts.seguimiento ? (es ? 'Preparando el seguimiento…' : 'Preparing the follow-up…') : es ? 'Escribiendo el correo con IA… unos 10 segundos.' : 'Writing the email with AI… about 10 seconds.')
  try {
    const r = await fetch('/api/outreach/drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId, seguimiento: opts.seguimiento === true }) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || r.statusText)
    if (j.existente) toast.info(es ? 'Este contacto ya tenía un borrador.' : 'This contact already has a draft.')
    // Seguimiento antes de su fecha: se permite, pero que sea a sabiendas.
    if (j.adelantado) toast.warning(es ? `Este seguimiento tocaba el ${j.adelantado}. Insistir antes de tiempo suele molestar; revísalo antes de enviarlo.` : `This follow-up was due on ${j.adelantado}.`, { duration: 10_000 })
    return `/${lang}/dashboard/admin/crm/prospeccion?abrir=${j.id}`
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
    return null
  } finally {
    toast.dismiss(aviso)
  }
}
