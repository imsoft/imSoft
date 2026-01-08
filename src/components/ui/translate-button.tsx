'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Languages, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TranslateButtonProps {
  text: string | undefined
  targetValue: string | undefined
  onTranslate: (translatedText: string) => void
  disabled?: boolean
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function TranslateButton({
  text,
  targetValue,
  onTranslate,
  disabled = false,
  className,
  variant = 'outline',
  size = 'sm',
}: TranslateButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false)
  const [lastTranslatedText, setLastTranslatedText] = useState<string>('')
  const [translationState, setTranslationState] = useState<'idle' | 'modified' | 'translated'>('idle')

  // Detectar cambios en el texto fuente y destino
  useEffect(() => {
    if (!text || !text.trim()) {
      setTranslationState('idle')
      return
    }

    // Si el targetValue fue modificado manualmente después de traducir
    if (lastTranslatedText && targetValue !== lastTranslatedText) {
      setTranslationState('modified')
    } else if (targetValue && targetValue.trim() && lastTranslatedText === targetValue) {
      setTranslationState('translated')
    } else {
      setTranslationState('idle')
    }
  }, [text, targetValue, lastTranslatedText])

  const handleTranslate = async () => {
    if (!text || !text.trim()) {
      return
    }

    const textToTranslate = text.trim()

    if (!textToTranslate) {
      return
    }

    setIsTranslating(true)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToTranslate,
          targetLanguage: 'en',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al traducir')
      }

      const data = await response.json()
      // Guardar el HTML traducido completo, no solo el texto plano
      setLastTranslatedText(data.translatedText)
      onTranslate(data.translatedText)
    } catch (error) {
      console.error('Translation error:', error)
      alert(error instanceof Error ? error.message : 'Error al traducir el texto')
    } finally {
      setIsTranslating(false)
    }
  }

  // Determinar variante y contenido basado en el estado
  const getButtonVariant = () => {
    if (translationState === 'translated') return 'default'
    if (translationState === 'modified') return 'secondary'
    return variant
  }

  const getButtonContent = () => {
    if (isTranslating) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Traduciendo...</span>
        </>
      )
    }

    switch (translationState) {
      case 'translated':
        return (
          <>
            <Check className="h-4 w-4" />
            <span>Traducido</span>
          </>
        )
      case 'modified':
        return (
          <>
            <AlertCircle className="h-4 w-4" />
            <span>Re-traducir</span>
          </>
        )
      default:
        return (
          <>
            <Languages className="h-4 w-4" />
            <span>Traducir</span>
          </>
        )
    }
  }

  return (
    <Button
      type="button"
      variant={getButtonVariant()}
      size={size}
      onClick={handleTranslate}
      disabled={disabled || isTranslating || !text || !text.trim() || text.trim().length === 0}
      className={cn('gap-2', className)}
    >
      {getButtonContent()}
    </Button>
  )
}

