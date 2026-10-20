'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'

/**
 * Cuadro para firmar con el dedo o el mouse. Entrega el trazo como PNG en data URL
 * (null cuando esta vacio). Dibuja con eventos de puntero, asi que sirve igual en
 * telefono, tableta y escritorio; en el telefono bloquea el scroll mientras se firma.
 */
export function SignaturePad({ onChange, lang }: { onChange: (png: string | null) => void; lang: string }) {
  const es = lang !== 'en'
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dibujando = useRef(false)
  const [vacio, setVacio] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ajustar = () => {
      const ratio = Math.max(1, window.devicePixelRatio || 1)
      const ancho = canvas.clientWidth
      const alto = canvas.clientHeight
      // Cambiar el tamano borra el lienzo; se conserva el dibujo y se vuelve a pintar.
      const previo = canvas.width > 0 ? canvas.toDataURL() : null
      canvas.width = Math.round(ancho * ratio)
      canvas.height = Math.round(alto * ratio)
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(ratio, ratio)
      ctx.lineWidth = 2.2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#1a1a1a'
      if (previo) {
        const img = new Image()
        img.onload = () => ctx.drawImage(img, 0, 0, ancho, alto)
        img.src = previo
      }
    }
    ajustar()
    window.addEventListener('resize', ajustar)
    return () => window.removeEventListener('resize', ajustar)
  }, [])

  function punto(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function empezar(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = e.currentTarget.getContext('2d')
    if (!ctx) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dibujando.current = true
    const p = punto(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    // Un toque sin arrastre tambien deja marca (un punto).
    ctx.lineTo(p.x + 0.1, p.y + 0.1)
    ctx.stroke()
    if (vacio) setVacio(false)
  }

  function mover(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dibujando.current) return
    const ctx = e.currentTarget.getContext('2d')
    if (!ctx) return
    const p = punto(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  function terminar(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dibujando.current) return
    dibujando.current = false
    onChange(e.currentTarget.toDataURL('image/png'))
  }

  function limpiar() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setVacio(true)
    onChange(null)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="h-40 w-full touch-none rounded-lg border-2 border-neutral-300 bg-white"
          style={{ touchAction: 'none' }}
          onPointerDown={empezar}
          onPointerMove={mover}
          onPointerUp={terminar}
          onPointerCancel={terminar}
          onPointerLeave={terminar}
          aria-label={es ? 'Cuadro para dibujar tu firma' : 'Signature drawing box'}
        />
        {vacio && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-neutral-400">
            {es ? 'Firma aquí con el dedo o el mouse' : 'Sign here with your finger or mouse'}
          </p>
        )}
        <div className="pointer-events-none absolute inset-x-6 bottom-8 border-b border-neutral-300" />
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={limpiar} disabled={vacio} className="text-neutral-600">
          <Eraser className="size-4 mr-1" />{es ? 'Borrar firma' : 'Clear signature'}
        </Button>
      </div>
    </div>
  )
}
