'use client'

import { useEffect } from 'react'

/** Lluvia de confeti al abrir la pagina (cotizacion o contrato). Se importa canvas-confetti solo en el navegador. */
export function Confetti({ delayMs = 350 }: { delayMs?: number }) {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let cancelado = false
    const t = setTimeout(async () => {
      const { default: confetti } = await import('canvas-confetti')
      if (cancelado) return
      lanzar(confetti)
    }, delayMs)
    return () => {
      cancelado = true
      clearTimeout(t)
    }
  }, [delayMs])
  return null
}

type Confetti = typeof import('canvas-confetti')

/**
 * Confeti en toda la pantalla: estallidos desde abajo y desde los lados hacia todas
 * las direcciones, escalonados en ~1.5 s. Sin cortina desde arriba.
 */
export function lanzar(confetti: Confetti) {
  const colors = ['#1e88e5', '#64b5f6', '#0d47a1', '#90caf9', '#ffffff', '#ffd54f']

  // Estallido inicial desde abajo, en todas direcciones
  confetti({ particleCount: 220, spread: 360, startVelocity: 55, ticks: 260, gravity: 0.9, scalar: 1.1, colors, zIndex: 60, origin: { x: 0.5, y: 0.65 } })
  confetti({ particleCount: 120, angle: 60, spread: 80, startVelocity: 60, ticks: 260, colors, zIndex: 60, origin: { x: 0, y: 0.9 } })
  confetti({ particleCount: 120, angle: 120, spread: 80, startVelocity: 60, ticks: 260, colors, zIndex: 60, origin: { x: 1, y: 0.9 } })

  // Dos rafagas mas desde los lados, escalonadas
  setTimeout(() => confetti({ particleCount: 90, angle: 45, spread: 70, startVelocity: 55, ticks: 260, colors, zIndex: 60, origin: { x: 0, y: 0.5 } }), 600)
  setTimeout(() => confetti({ particleCount: 90, angle: 135, spread: 70, startVelocity: 55, ticks: 260, colors, zIndex: 60, origin: { x: 1, y: 0.5 } }), 600)
  setTimeout(() => confetti({ particleCount: 160, spread: 360, startVelocity: 45, ticks: 260, colors, zIndex: 60, origin: { x: 0.5, y: 0.4 } }), 1200)
}
