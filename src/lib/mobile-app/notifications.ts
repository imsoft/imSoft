import type { SupabaseClient } from '@supabase/supabase-js'
import { mxn } from '@/lib/cotizaciones'
import { sendPush, type PushMessage } from './push'

/** Notices the client gets on their phone. Short texts: they're read on the lock screen. */

type Screen = 'project' | 'payments'
const LEGACY_SCREEN: Record<Screen, string> = { project: 'proyecto', payments: 'pagos' }

/**
 * Where the notice takes the app. `pantalla`/`proyecto` are for app versions already in the
 * stores; remove them together with mobile-app/legacy.ts.
 */
export function noticeData(screen: Screen, projectId: string): Record<string, string> {
  return { screen, projectId, pantalla: LEGACY_SCREEN[screen], proyecto: projectId }
}

export function taskCompletedNotice(p: { project: string; task: string; done: number; total: number; projectId: string }): PushMessage {
  const progress = p.total > 0 ? ` · ${p.done} de ${p.total}` : ''
  return {
    title: `Avance en ${p.project}`,
    body: `Terminamos: ${p.task}${progress}`,
    data: noticeData('project', p.projectId),
  }
}

export function paymentNotice(p: { project: string; amount: number; currency?: string | null; status: string; projectId: string }): PushMessage | null {
  const amount = mxn(p.amount, p.currency || 'MXN')
  if (p.status === 'completed') {
    return { title: 'Recibimos tu pago', body: `${amount} de ${p.project}. ¡Gracias!`, data: noticeData('payments', p.projectId) }
  }
  if (p.status === 'pending') {
    return { title: 'Tienes un pago pendiente', body: `${amount} de ${p.project}. Puedes pagarlo desde la app.`, data: noticeData('payments', p.projectId) }
  }
  // Failed or refunded payments are handled by email or WhatsApp, not with a phone notice.
  return null
}

/** Project name and owning user (the client). Null if the project has no client with an account. */
export async function projectOwner(db: SupabaseClient, projectId: string): Promise<{ userId: string; projectName: string } | null> {
  const { data } = await db.from('projects').select('title, title_es, companies ( user_id )').eq('id', projectId).maybeSingle()
  if (!data) return null
  const company = (Array.isArray(data.companies) ? data.companies[0] : data.companies) as { user_id: string | null } | null
  if (!company?.user_id) return null
  return { userId: company.user_id, projectName: (data.title_es as string | null) || (data.title as string) || 'tu proyecto' }
}

/** Push to the project's client. Never throws: with no devices or config, nothing happens. */
export async function notifyClient(db: SupabaseClient, projectId: string, build: (projectName: string) => PushMessage | null): Promise<void> {
  try {
    const owner = await projectOwner(db, projectId)
    if (!owner) return
    const m = build(owner.projectName)
    if (m) await sendPush(db, owner.userId, m)
  } catch (e) {
    console.error('[notifications]', e)
  }
}
