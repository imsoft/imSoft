/**
 * Which panel someone already signed in goes to. Used by the login (so it doesn't show the
 * form to someone already in) and the Google callback.
 */
export function panelFor(role: unknown, lang: string): string {
  const l = lang === 'en' ? 'en' : 'es'
  return role === 'admin' ? `/${l}/dashboard/admin` : `/${l}/dashboard/client`
}
