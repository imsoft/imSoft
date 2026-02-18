'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import React, { useRef, useEffect } from 'react'
import enDict from './dictionaries/en.json'
import esDict from './dictionaries/es.json'

function NoiseContainer() {
  const grainRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = grainRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let frame = 0
    let animationId: number

    const patternSize = 250
    const patternRefreshInterval = 2
    const patternAlpha = 15

    const resize = () => {
      if (!canvas) return
      canvas.width = 600
      canvas.height = 400
    }

    const drawGrain = () => {
      const imageData = ctx.createImageData(600, 400)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        data[i + 3] = patternAlpha
      }

      ctx.putImageData(imageData, 0, 0)
    }

    const loop = () => {
      if (frame % patternRefreshInterval === 0) {
        drawGrain()
      }
      frame++
      animationId = window.requestAnimationFrame(loop)
    }

    resize()
    loop()

    return () => {
      window.cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={grainRef}
      className="pointer-events-none absolute top-0 left-0 w-full h-full"
      style={{
        imageRendering: 'pixelated'
      }}
    />
  )
}

const dicts = { en: enDict, es: esDict }

export default function NotFound() {
  const pathname = usePathname()
  const lang = (pathname?.split('/')[1] === 'en' ? 'en' : 'es') as 'en' | 'es'
  const dict = (dicts[lang] as { notFound?: { title?: string; message?: string; goBackHome?: string } }).notFound ?? { title: 'Not Found', message: 'The page you are looking for does not exist.', goBackHome: 'Go back home' }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div style={{width: '600px', height: '400px', position: 'relative', overflow: 'hidden'}}>
        <NoiseContainer />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="text-center px-6">
          <h1 className="text-9xl font-bold text-foreground mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-foreground mb-4">
            {dict.title}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            {dict.message}
          </p>
          <Button asChild size="lg">
            <Link href={`/${lang}`}>
              {dict.goBackHome}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

