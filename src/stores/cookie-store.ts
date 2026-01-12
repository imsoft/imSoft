import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  CookieConsent,
  CookiePreferences,
  CookieCategory
} from '@/types/cookies'
import {
  defaultConsent,
  COOKIE_CONSENT_KEY,
  COOKIE_VERSION
} from '@/types/cookies'

interface CookieStore {
  consent: CookieConsent
  hasConsent: boolean
  showBanner: boolean
  showPreferences: boolean
  acceptAll: () => void
  rejectAll: () => void
  updateConsent: (category: CookieCategory, value: boolean) => void
  savePreferences: () => void
  openPreferences: () => void
  closePreferences: () => void
  resetConsent: () => void
}

export const useCookieStore = create<CookieStore>()(
  persist(
    (set, get) => ({
      consent: defaultConsent,
      hasConsent: false,
      showBanner: true,
      showPreferences: false,

      acceptAll: () => {
        const allAccepted: CookieConsent = {
          essential: true,
          functional: true,
          analytics: true,
          marketing: true,
        }
        set({
          consent: allAccepted,
          hasConsent: true,
          showBanner: false,
          showPreferences: false,
        })
      },

      rejectAll: () => {
        const allRejected: CookieConsent = {
          essential: true, // Essential cookies siempre activas
          functional: false,
          analytics: false,
          marketing: false,
        }
        set({
          consent: allRejected,
          hasConsent: true,
          showBanner: false,
          showPreferences: false,
        })
      },

      updateConsent: (category: CookieCategory, value: boolean) => {
        // No permitir desactivar cookies esenciales
        if (category === 'essential') return

        set((state) => ({
          consent: {
            ...state.consent,
            [category]: value,
          },
        }))
      },

      savePreferences: () => {
        set({
          hasConsent: true,
          showBanner: false,
          showPreferences: false,
        })
      },

      openPreferences: () => {
        set({ showPreferences: true })
      },

      closePreferences: () => {
        set({ showPreferences: false })
      },

      resetConsent: () => {
        set({
          consent: defaultConsent,
          hasConsent: false,
          showBanner: true,
          showPreferences: false,
        })
      },
    }),
    {
      name: COOKIE_CONSENT_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        consent: state.consent,
        hasConsent: state.hasConsent,
      }),
      version: COOKIE_VERSION,
      migrate: (persistedState: any, version: number) => {
        // Si la versión es diferente, resetear y mostrar banner
        if (version !== COOKIE_VERSION) {
          return {
            consent: defaultConsent,
            hasConsent: false,
            showBanner: true,
            showPreferences: false,
          }
        }
        return persistedState
      },
    }
  )
)
