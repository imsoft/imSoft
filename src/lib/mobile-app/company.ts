/** The client's company from the mobile app: validate the name and summarize the row. */

export const MAX_COMPANY_NAME = 120

export interface AppCompany {
  id: string
  name: string
  logo: string | null
}

export function validateCompanyName(name: unknown): string | null {
  const n = typeof name === 'string' ? name.trim() : ''
  if (n.length < 2) return 'Escribe el nombre de tu empresa.'
  if (n.length > MAX_COMPANY_NAME) return `El nombre es muy largo (máximo ${MAX_COMPANY_NAME} caracteres).`
  return null
}

export function companyForApp(r: { id: string; name: string | null; logo_url: string | null }): AppCompany {
  return { id: r.id, name: r.name ?? '', logo: r.logo_url?.trim() || null }
}
