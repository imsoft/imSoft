/**
 * Un correo queda invalido por dos caminos: la etiqueta `correo-invalido` (rebotes y
 * dominios sin correo que detecta la prospeccion) o la lista `invalid_emails` (marcado a
 * mano en la ficha). La tabla, la ficha y el tablero preguntan aqui para no ofrecer
 * "Escribir correo" a quien ya se sabe que rebota.
 */
export const TAG_CORREO_INVALIDO = 'correo-invalido'

export function correoInvalido(c: { email?: string | null; tags?: string[] | null; invalid_emails?: string[] | null }): boolean {
  const email = (c.email ?? '').trim().toLowerCase()
  if (!email) return false
  if ((c.tags ?? []).includes(TAG_CORREO_INVALIDO)) return true
  return (c.invalid_emails ?? []).some((e) => e.trim().toLowerCase() === email)
}

/** Etiquetas del contacto tras cambiarle el correo principal: el nuevo aun no ha rebotado. */
export function tagsTrasCambiarCorreo(tags: string[] | null | undefined, anterior: string | null | undefined, nuevo: string | null | undefined): string[] | null {
  const mismo = (anterior ?? '').trim().toLowerCase() === (nuevo ?? '').trim().toLowerCase()
  const out = mismo ? [...(tags ?? [])] : (tags ?? []).filter((t) => t !== TAG_CORREO_INVALIDO)
  return out.length ? out : null
}
