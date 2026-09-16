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

/** Dos ráfagas desde los lados con los azules de imSoft. */
export function lanzar(confetti: Confetti) {
  const colores = ['#1e88e5', '#64b5f6', '#0d47a1', '#ffffff', '#ffd54f']
  const base = { particleCount: 70, spread: 65, startVelocity: 45, ticks: 220, colors: colores, zIndex: 60 }
  confetti({ ...base, angle: 60, origin: { x: 0, y: 0.7 } })
  confetti({ ...base, angle: 120, origin: { x: 1, y: 0.7 } })
  setTimeout(() => confetti({ ...base, particleCount: 120, spread: 100, startVelocity: 35, origin: { x: 0.5, y: 0.6 } }), 250)
}
