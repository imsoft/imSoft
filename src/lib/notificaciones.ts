import type { SupabaseClient } from '@supabase/supabase-js'
import { mxn } from '@/lib/cotizaciones'
import { enviarPush, type Mensaje } from '@/lib/push'

/** Avisos que recibe el cliente en su telefono. Textos cortos: se leen en la pantalla bloqueada. */

export function avisoTareaCompletada(p: { proyecto: string; tarea: string; hechas: number; total: number; proyectoId: string }): Mensaje {
  const avance = p.total > 0 ? ` · ${p.hechas} de ${p.total}` : ''
  return {
    titulo: `Avance en ${p.proyecto}`,
    cuerpo: `Terminamos: ${p.tarea}${avance}`,
    datos: { pantalla: 'proyecto', proyecto: p.proyectoId },
  }
}

export function avisoPago(p: { proyecto: string; monto: number; moneda?: string | null; status: string; proyectoId: string }): Mensaje | null {
  const importe = mxn(p.monto, p.moneda || 'MXN')
  if (p.status === 'completed') {
    return { titulo: 'Recibimos tu pago', cuerpo: `${importe} de ${p.proyecto}. ¡Gracias!`, datos: { pantalla: 'pagos', proyecto: p.proyectoId } }
  }
  if (p.status === 'pending') {
    return { titulo: 'Tienes un pago pendiente', cuerpo: `${importe} de ${p.proyecto}. Puedes pagarlo desde la app.`, datos: { pantalla: 'pagos', proyecto: p.proyectoId } }
  }
  // Pagos fallidos o reembolsados se tratan por correo o por WhatsApp, no con un aviso en el telefono.
  return null
}

/** Nombre del proyecto y usuario dueño (el cliente). Null si el proyecto no tiene cliente con cuenta. */
export async function duenoDelProyecto(db: SupabaseClient, projectId: string): Promise<{ userId: string; nombre: string } | null> {
  const { data } = await db.from('projects').select('title, title_es, companies ( user_id )').eq('id', projectId).maybeSingle()
  if (!data) return null
  const empresa = (Array.isArray(data.companies) ? data.companies[0] : data.companies) as { user_id: string | null } | null
  if (!empresa?.user_id) return null
  return { userId: empresa.user_id, nombre: (data.title_es as string | null) || (data.title as string) || 'tu proyecto' }
}

/** Push al cliente del proyecto. No lanza: si no hay dispositivos o configuracion, no pasa nada. */
export async function avisarAlCliente(db: SupabaseClient, projectId: string, mensaje: (nombreProyecto: string) => Mensaje | null): Promise<void> {
  try {
    const dueno = await duenoDelProyecto(db, projectId)
    if (!dueno) return
    const m = mensaje(dueno.nombre)
    if (m) await enviarPush(db, dueno.userId, m)
  } catch (e) {
    console.error('[notificaciones]', e)
  }
}
