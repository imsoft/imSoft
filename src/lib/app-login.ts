/**
 * Inicio de sesion de la app movil de clientes: correo + codigo de un solo uso.
 *
 * La web entra con contraseña y captcha; una app nativa no puede resolver el captcha, y
 * Supabase lo exige para pedir cualquier inicio de sesion. Por eso el codigo lo genera el
 * servidor (con la llave de servicio) y lo manda por correo; la app solo lo verifica, que
 * no pide captcha. No hay registro desde la app: las cuentas las crea imSoft.
 */

export const ESPERA_ENTRE_CODIGOS_MS = 60_000
export const MAX_CODIGOS_POR_HORA = 5

export function normalizarCorreo(email: unknown): string | null {
  const e = String(email ?? '').trim().toLowerCase()
  return /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(e) && e.length <= 254 ? e : null
}

/**
 * Freno contra el abuso (bombardear a alguien con correos, o adivinar codigos pidiendo
 * muchos): uno por minuto y cinco por hora por cuenta. `historial` son las marcas de
 * tiempo (ms) de los codigos ya pedidos.
 */
export function puedePedirCodigo(historial: number[], ahora: number): { ok: true } | { ok: false; esperarSegundos: number } {
  const recientes = historial.filter((t) => ahora - t < 3_600_000).sort((a, b) => a - b)
  const ultimo = recientes[recientes.length - 1]
  if (ultimo !== undefined && ahora - ultimo < ESPERA_ENTRE_CODIGOS_MS) {
    return { ok: false, esperarSegundos: Math.ceil((ESPERA_ENTRE_CODIGOS_MS - (ahora - ultimo)) / 1000) }
  }
  if (recientes.length >= MAX_CODIGOS_POR_HORA) {
    return { ok: false, esperarSegundos: Math.ceil((3_600_000 - (ahora - recientes[0])) / 1000) }
  }
  return { ok: true }
}

/** Historial a guardar tras pedir un codigo: solo la ultima hora. */
export function historialTras(historial: number[], ahora: number): number[] {
  return [...historial.filter((t) => ahora - t < 3_600_000), ahora]
}
