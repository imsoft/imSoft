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
 * Lluvia de confeti en toda la pantalla durante ~2.5 s: rafagas desde abajo hacia
 * todas las direcciones y una cortina que cae desde arriba a todo lo ancho.
 */
export function lanzar(confetti: Confetti) {
  const colors = ['#1e88e5', '#64b5f6', '#0d47a1', '#90caf9', '#ffffff', '#ffd54f']
  const fin = Date.now() + 2500

  // Estallido inicial desde abajo, en todas direcciones
  confetti({ particleCount: 220, spread: 360, startVelocity: 55, ticks: 260, gravity: 0.9, scalar: 1.1, colors, zIndex: 60, origin: { x: 0.5, y: 0.65 } })
  confetti({ particleCount: 120, angle: 60, spread: 80, startVelocity: 60, ticks: 260, colors, zIndex: 60, origin: { x: 0, y: 0.9 } })
  confetti({ particleCount: 120, angle: 120, spread: 80, startVelocity: 60, ticks: 260, colors, zIndex: 60, origin: { x: 1, y: 0.9 } })

  // Cortina que cae desde arriba, a lo ancho, durante 2.5 s
  const cuadro = () => {
    confetti({ particleCount: 6, angle: 90, spread: 160, startVelocity: 12, gravity: 1, drift: (Math.random() - 0.5) * 1.5, ticks: 300, scalar: 1.05, colors, zIndex: 60, origin: { x: Math.random(), y: -0.05 } })
    confetti({ particleCount: 4, angle: 90, spread: 160, startVelocity: 12, gravity: 1, ticks: 300, colors, zIndex: 60, origin: { x: Math.random(), y: -0.05 } })
    if (Date.now() < fin) requestAnimationFrame(cuadro)
  }
  cuadro()

  // Dos rafagas mas desde los lados, escalonadas
  setTimeout(() => confetti({ particleCount: 90, angle: 45, spread: 70, startVelocity: 55, ticks: 260, colors, zIndex: 60, origin: { x: 0, y: 0.5 } }), 600)
  setTimeout(() => confetti({ particleCount: 90, angle: 135, spread: 70, startVelocity: 55, ticks: 260, colors, zIndex: 60, origin: { x: 1, y: 0.5 } }), 600)
  setTimeout(() => confetti({ particleCount: 160, spread: 360, startVelocity: 45, ticks: 260, colors, zIndex: 60, origin: { x: 0.5, y: 0.4 } }), 1200)
}
