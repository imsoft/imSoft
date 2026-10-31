import { describe, expect, it } from 'vitest'
import { paymentNotice, taskCompletedNotice } from './notifications'

describe('notices to the client phone', () => {
  it('task done: names the task and the progress, and opens the project (new and legacy keys)', () => {
    expect(taskCompletedNotice({ project: 'Portal de pedidos', task: 'Diseño de pantallas', done: 3, total: 7, projectId: 'p1' })).toEqual({
      title: 'Avance en Portal de pedidos',
      body: 'Terminamos: Diseño de pantallas · 3 de 7',
      data: { screen: 'project', projectId: 'p1', pantalla: 'proyecto', proyecto: 'p1' },
    })
    expect(taskCompletedNotice({ project: 'X', task: 'T', done: 0, total: 0, projectId: 'p1' }).body).toBe('Terminamos: T')
  })

  it('payment received and pending carry the amount with currency; other statuses send nothing', () => {
    const received = paymentNotice({ project: 'Portal', amount: 40000, currency: 'MXN', status: 'completed', projectId: 'p1' })
    expect(received?.title).toBe('Recibimos tu pago')
    expect(received?.body).toBe('$40,000.00 de Portal. ¡Gracias!')
    expect(received?.data).toEqual({ screen: 'payments', projectId: 'p1', pantalla: 'pagos', proyecto: 'p1' })
    const pending = paymentNotice({ project: 'Portal', amount: 1234.5, currency: null, status: 'pending', projectId: 'p1' })
    expect(pending?.title).toBe('Tienes un pago pendiente')
    expect(pending?.body).toContain('$1,234.50')
    expect(paymentNotice({ project: 'Portal', amount: 1, status: 'cancelled', projectId: 'p1' })).toBeNull()
  })
})
