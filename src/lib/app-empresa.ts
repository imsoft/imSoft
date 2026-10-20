/** Empresa del cliente desde la app movil: validar el nombre y resumir la fila. */

export const MAX_NOMBRE_EMPRESA = 120

export interface EmpresaApp {
  id: string
  nombre: string
  logo: string | null
}

export function validarNombreEmpresa(nombre: unknown): string | null {
  const n = typeof nombre === 'string' ? nombre.trim() : ''
  if (n.length < 2) return 'Escribe el nombre de tu empresa.'
  if (n.length > MAX_NOMBRE_EMPRESA) return `El nombre es muy largo (máximo ${MAX_NOMBRE_EMPRESA} caracteres).`
  return null
}

export function empresaParaApp(r: { id: string; name: string | null; logo_url: string | null }): EmpresaApp {
  return { id: r.id, nombre: r.name ?? '', logo: r.logo_url?.trim() || null }
}
