'use client'

import { forwardRef } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

interface CaptchaProps {
  /** Called with the token when the challenge is solved successfully */
  onVerify: (token: string) => void
  /** Called when the token expires or the challenge fails (clears the token) */
  onExpireOrError?: () => void
}

/**
 * Cloudflare Turnstile widget to protect the auth forms
 * from bots. Requires NEXT_PUBLIC_TURNSTILE_SITE_KEY and CAPTCHA
 * protection enabled in Supabase (Authentication → Attack Protection).
 *
 * The token is consumed on every attempt, so after an auth error you must
 * call `ref.current?.reset()` to generate a new one.
 */
export const Captcha = forwardRef<TurnstileInstance | undefined, CaptchaProps>(
  function Captcha({ onVerify, onExpireOrError }, ref) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

    if (!siteKey) {
      // In development, without a configured key, we don't break the form.
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
