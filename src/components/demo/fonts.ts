import { Anton, Archivo, Barlow, Cormorant_Garamond, DM_Serif_Display, Figtree, Fraunces, Karla, Manrope } from 'next/font/google'

// Each sample site uses one pair. `preload: false` keeps a demo from downloading the
// other pairs up front; `display: swap` shows text right away. next/font needs literal
// options in every call, so they are repeated instead of spread from a shared object.

const fraunces = Fraunces({ subsets: ['latin'], display: 'swap', preload: false, weight: ['400', '600'], style: ['normal', 'italic'], variable: '--demo-display' })
const figtree = Figtree({ subsets: ['latin'], display: 'swap', preload: false, weight: ['400', '500', '600'], variable: '--demo-body' })
const anton = Anton({ subsets: ['latin'], display: 'swap', preload: false, weight: '400', variable: '--demo-display' })
const barlow = Barlow({ subsets: ['latin'], display: 'swap', preload: false, weight: ['400', '500', '600', '700'], variable: '--demo-body' })
const dmSerif = DM_Serif_Display({ subsets: ['latin'], display: 'swap', preload: false, weight: '400', style: ['normal', 'italic'], variable: '--demo-display' })
const karla = Karla({ subsets: ['latin'], display: 'swap', preload: false, weight: ['400', '500', '700'], variable: '--demo-body' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], display: 'swap', preload: false, weight: ['500', '600'], style: ['normal', 'italic'], variable: '--demo-display' })
const manrope = Manrope({ subsets: ['latin'], display: 'swap', preload: false, weight: ['400', '500', '600', '700'], variable: '--demo-body' })
const archivoDisplay = Archivo({ subsets: ['latin'], display: 'swap', preload: false, weight: ['800'], variable: '--demo-display' })
const archivoBody = Archivo({ subsets: ['latin'], display: 'swap', preload: false, weight: ['400', '500', '600'], variable: '--demo-body' })

export const DEMO_FONTS = {
  /** Soft editorial serif: health, beauty. */
  serif: `${fraunces.variable} ${figtree.variable}`,
  /** Condensed and loud: garages, hardware stores. */
  condensed: `${anton.variable} ${barlow.variable}`,
  /** Warm display serif: restaurants, food. */
  warm: `${dmSerif.variable} ${karla.variable}`,
  /** Classic serif: law firms, accountants. */
  classic: `${cormorant.variable} ${manrope.variable}`,
  /** Heavy grotesk: construction, architecture. */
  grotesk: `${archivoDisplay.variable} ${archivoBody.variable}`,
} as const

export type DemoFont = keyof typeof DEMO_FONTS
