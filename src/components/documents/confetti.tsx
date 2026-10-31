'use client'

import { useEffect } from 'react'

/** Confetti shower when the page opens (quote or contract). canvas-confetti is imported only in the browser. */
export function Confetti({ delayMs = 350 }: { delayMs?: number }) {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let cancelled = false
    const t = setTimeout(async () => {
      const { default: confetti } = await import('canvas-confetti')
      if (cancelled) return
      launch(confetti)
    }, delayMs)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [delayMs])
  return null
}

type Confetti = typeof import('canvas-confetti')

/**
 * Full-screen confetti: bursts from the bottom and the sides in every direction,
 * staggered over ~1.5 s. No curtain from the top.
 */
export function launch(confetti: Confetti) {
  const colors = ['#1e88e5', '#64b5f6', '#0d47a1', '#90caf9', '#ffffff', '#ffd54f']

  // Initial burst from the bottom, in every direction
  confetti({ particleCount: 220, spread: 360, startVelocity: 55, ticks: 260, gravity: 0.9, scalar: 1.1, colors, zIndex: 60, origin: { x: 0.5, y: 0.65 } })
  confetti({ particleCount: 120, angle: 60, spread: 80, startVelocity: 60, ticks: 260, colors, zIndex: 60, origin: { x: 0, y: 0.9 } })
  confetti({ particleCount: 120, angle: 120, spread: 80, startVelocity: 60, ticks: 260, colors, zIndex: 60, origin: { x: 1, y: 0.9 } })

  // Two more bursts from the sides, staggered
  setTimeout(() => confetti({ particleCount: 90, angle: 45, spread: 70, startVelocity: 55, ticks: 260, colors, zIndex: 60, origin: { x: 0, y: 0.5 } }), 600)
  setTimeout(() => confetti({ particleCount: 90, angle: 135, spread: 70, startVelocity: 55, ticks: 260, colors, zIndex: 60, origin: { x: 1, y: 0.5 } }), 600)
  setTimeout(() => confetti({ particleCount: 160, spread: 360, startVelocity: 45, ticks: 260, colors, zIndex: 60, origin: { x: 0.5, y: 0.4 } }), 1200)
}
