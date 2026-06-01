'use client'

import { forwardRef } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

interface CaptchaProps {
  /** Se llama con el token cuando el reto se resuelve con éxito */
  onVerify: (token: string) => void
  /** Se llama cuando el token expira o el reto falla (limpia el token) */
  onExpireOrError?: () => void
}

/**
 * Widget de Cloudflare Turnstile para proteger los formularios de auth
 * contra bots. Requiere NEXT_PUBLIC_TURNSTILE_SITE_KEY y que la protección
 * CAPTCHA esté activada en Supabase (Authentication → Attack Protection).
 *
 * El token se consume en cada intento, así que tras un error de auth hay que
 * llamar a `ref.current?.reset()` para volver a generar uno nuevo.
 */
export const Captcha = forwardRef<TurnstileInstance | undefined, CaptchaProps>(
  function Captcha({ onVerify, onExpireOrError }, ref) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

    if (!siteKey) {
      // En desarrollo, si no hay key configurada, no rompemos el formulario.
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Captcha] NEXT_PUBLIC_TURNSTILE_SITE_KEY no está definido')
      }
      return null
    }

    return (
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        onSuccess={onVerify}
        onExpire={onExpireOrError}
        onError={onExpireOrError}
        options={{ size: 'flexible' }}
      />
    )
  }
)
