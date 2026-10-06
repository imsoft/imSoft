import { describe, expect, it } from 'vitest'
import { avisoPago, avisoTareaCompletada } from './notificaciones'

describe('avisos al telefono del cliente', () => {
  it('tarea terminada: nombra la tarea y el avance, y abre el proyecto', () => {
    expect(avisoTareaCompletada({ proyecto: 'Portal de pedidos', tarea: 'Diseño de pantallas', hechas: 3, total: 7, proyectoId: 'p1' })).toEqual({
      titulo: 'Avance en Portal de pedidos',
      cuerpo: 'Terminamos: Diseño de pantallas · 3 de 7',
      datos: { pantalla: 'proyecto', proyecto: 'p1' },
    })
    expect(avisoTareaCompletada({ proyecto: 'X', tarea: 'T', hechas: 0, total: 0, proyectoId: 'p1' }).cuerpo).toBe('Terminamos: T')
  })

  it('pago recibido y pago pendiente llevan el importe con moneda; otros estados no avisan', () => {
    const recibido = avisoPago({ proyecto: 'Portal', monto: 40000, moneda: 'MXN', status: 'completed', proyectoId: 'p1' })
    expect(recibido?.titulo).toBe('Recibimos tu pago')
    expect(recibido?.cuerpo).toBe('$40,000.00 de Portal. ¡Gracias!')
    expect(recibido?.datos).toEqual({ pantalla: 'pagos', proyecto: 'p1' })
    const pendiente = avisoPago({ proyecto: 'Portal', monto: 1234.5, moneda: null, status: 'pending', proyectoId: 'p1' })
    expect(pendiente?.titulo).toBe('Tienes un pago pendiente')
    expect(pendiente?.cuerpo).toContain('$1,234.50')
    expect(avisoPago({ proyecto: 'Portal', monto: 1, status: 'cancelled', proyectoId: 'p1' })).toBeNull()
  })
})
