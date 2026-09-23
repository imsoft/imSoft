'use client'

import { toast } from 'sonner'

/**
 * Unico punto de entrada para escribirle a un contacto: crea (o recupera) su borrador
 * de prospeccion y devuelve la URL de la pestaña Prospección con ese borrador abierto.
 */
export async function prepararCorreo(contactId: string, lang: string): Promise<string | null> {
  // La IA tarda unos segundos en proponer el gancho: sin este aviso parece que el clic no hizo nada.
  const aviso = toast.loading(lang === 'en' ? 'Writing the email with AI… about 10 seconds.' : 'Escribiendo el correo con IA… unos 10 segundos.')
  try {
    const r = await fetch('/api/outreach/drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId }) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || r.statusText)
    if (j.existente) toast.info(lang === 'en' ? 'This contact already has a draft.' : 'Este contacto ya tenía un borrador.')
    return `/${lang}/dashboard/admin/crm/prospeccion?abrir=${j.id}`
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
    return null
  } finally {
    toast.dismiss(aviso)
  }
}
