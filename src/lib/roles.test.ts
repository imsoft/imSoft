import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { esAdmin, rolDe } from './roles'

describe('roles', () => {
  it('solo es admin quien lo tiene en app_metadata', () => {
    expect(esAdmin({ app_metadata: { role: 'admin' } })).toBe(true)
    expect(rolDe({ app_metadata: { role: 'admin' } })).toBe('admin')
    expect(rolDe({ app_metadata: { provider: 'google' } })).toBe('client')
    expect(rolDe(null)).toBe('client')
  })

  it('lo que el usuario escriba en user_metadata no lo vuelve admin', () => {
    // supabase.auth.updateUser({ data: { role: 'admin' } }) lo puede hacer cualquiera sobre si mismo.
    const tramposo = { user_metadata: { role: 'admin' }, app_metadata: {} }
    expect(esAdmin(tramposo)).toBe(false)
  })

  it('ningun archivo decide permisos leyendo el rol de user_metadata', () => {
    const raiz = path.join(__dirname, '..')
    const malos: string[] = []
    const recorrer = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) recorrer(p)
        else if (/\.(ts|tsx)$/.test(e.name) && !e.name.includes('.test.')) {
          const s = fs.readFileSync(p, 'utf8')
          // Unica excepcion: los callbacks de Google usan `!user_metadata.role` como marca de "primera vez", no como permiso.
          const sinMarca = s.replace(/!user\.user_metadata\?\.role/g, '')
          if (/user_metadata\??\.role/.test(sinMarca)) malos.push(path.relative(raiz, p))
        }
      }
    }
    recorrer(raiz)
    expect(malos).toEqual([])
  })
})
