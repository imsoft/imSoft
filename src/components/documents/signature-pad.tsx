'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'

/**
 * Box to sign with a finger or the mouse. Returns the stroke as a PNG data URL (null
 * when empty). Draws with pointer events, so it works the same on phone, tablet and
 * desktop; on the phone it blocks scrolling while signing.
 */
export function SignaturePad({ onChange, lang }: { onChange: (png: string | null) => void; lang: string }) {
  const es = lang !== 'en'
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [empty, setEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const ratio = Math.max(1, window.devicePixelRatio || 1)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      // Resizing clears the canvas; the drawing is kept and painted again.
      const previous = canvas.width > 0 ? canvas.toDataURL() : null
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(ratio, ratio)
      ctx.lineWidth = 2.2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#1a1a1a'
      if (previous) {
        const img = new Image()
        img.onload = () => ctx.drawImage(img, 0, 0, width, height)
        img.src = previous
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = e.currentTarget.getContext('2d')
    if (!ctx) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    const p = point(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    // A tap without dragging also leaves a mark (a dot).
    ctx.lineTo(p.x + 0.1, p.y + 0.1)
    ctx.stroke()
    if (empty) setEmpty(false)
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    const ctx = e.currentTarget.getContext('2d')
    if (!ctx) return
    const p = point(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  function end(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    drawing.current = false
    onChange(e.currentTarget.toDataURL('image/png'))
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setEmpty(true)
    onChange(null)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="h-40 w-full touch-none rounded-lg border-2 border-neutral-300 bg-white"
          style={{ touchAction: 'none' }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={end}
          aria-label={es ? 'Cuadro para dibujar tu firma' : 'Signature drawing box'}
        />
        {empty && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-neutral-400">
            {es ? 'Firma aquí con el dedo o el mouse' : 'Sign here with your finger or mouse'}
          </p>
        )}
        <div className="pointer-events-none absolute inset-x-6 bottom-8 border-b border-neutral-300" />
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={empty} className="text-neutral-600">
          <Eraser className="size-4 mr-1" />{es ? 'Borrar firma' : 'Clear signature'}
        </Button>
      </div>
    </div>
  )
}
