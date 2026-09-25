/**
 * A que panel va alguien que ya tiene sesion. Lo usan el login (para no mostrarle el
 * formulario a quien ya entro) y el regreso de Google.
 */
export function panelDe(role: unknown, lang: string): string {
  const l = lang === 'en' ? 'en' : 'es'
  return role === 'admin' ? `/${l}/dashboard/admin` : `/${l}/dashboard/client`
}
