'use client'

import { animate, motion, MotionConfig, useInView, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import { useEffect, useRef, useState, type ReactNode } from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

/** Root of a sample site: turns animations off for visitors who ask for reduced motion. */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0, y = 28 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Container whose <StaggerItem> children come in one after another. */
export function Stagger({ children, className, gap = 0.09, onMount = false }: { children: ReactNode; className?: string; gap?: number; onMount?: boolean }) {
  const variants = { hidden: {}, shown: { transition: { staggerChildren: gap } } }
  return onMount ? (
    <motion.div className={className} variants={variants} initial="hidden" animate="shown">{children}</motion.div>
  ) : (
    <motion.div className={className} variants={variants} initial="hidden" whileInView="shown" viewport={{ once: true, margin: '-60px' }}>{children}</motion.div>
  )
}

export function StaggerItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' | 'figure' }) {
  const Tag = motion[as]
  return (
    <Tag className={className} variants={{ hidden: { opacity: 0, y: 30 }, shown: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } }}>
      {children}
    </Tag>
  )
}

/**
 * Counts a stat up from zero when it scrolls into view. Keeps whatever surrounds the
 * number ("+", " meses"); years and values without a number are shown as they are.
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const m = value.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/)
  const target = m ? Number(m[2].replace(/,/g, '')) : NaN
  const animated = m !== null && !(target >= 1900 && target <= 2100 && !m[2].includes(','))
  const decimals = m?.[2].includes('.') ? m[2].split('.')[1].length : 0
  const [shown, setShown] = useState(animated ? `${m![1]}0${m![3]}` : value)

  useEffect(() => {
    if (!animated || !inView) return
    const controls = animate(0, target, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => setShown(`${m![1]}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${m![3]}`),
    })
    return () => controls.stop()
    // The parsed parts derive from `value`, which is the only real input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value])

  return <span ref={ref}>{shown}</span>
}

/** Full-bleed hero photo that drifts and zooms slowly as the page scrolls. */
export function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.2])
  return (
    <div ref={ref} className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y, scale }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
        <Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover" />
      </motion.div>
    </div>
  )
}

/** Endless band of words, e.g. the list of services. */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = [...items, ...items]
  return (
    <div className={`flex overflow-hidden ${className ?? ''}`} aria-hidden>
      <motion.div className="flex shrink-0 items-center gap-10 pr-10" animate={{ x: ['0%', '-50%'] }} transition={{ duration: items.length * 4, ease: 'linear', repeat: Infinity }}>
        {[...row, ...row].map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-10 whitespace-nowrap">
            {item}<span className="opacity-50">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/** Sticky header that tightens and gets a shadow once the page scrolls. */
export function ScrollHeader({ children, className }: { children: ReactNode; className?: string }) {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40))
  return (
    <header data-scrolled={scrolled} className={`group/header sticky top-0 z-40 transition-[box-shadow,background-color] duration-300 data-[scrolled=true]:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.35)] ${className ?? ''}`}>
      {children}
    </header>
  )
}

/** Soft blurred blob that floats behind a section. */
export function FloatingBlob({ className }: { className: string }) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], scale: [1, 1.08, 0.96, 1] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
