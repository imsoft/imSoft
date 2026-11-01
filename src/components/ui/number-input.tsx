'use client'

import { useState, type ComponentProps } from 'react'
import { Input } from '@/components/ui/input'

interface NumberInputProps extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> {
  value: number
  onValueChange: (n: number) => void
}

const formatNumber = (n: number) => (Number.isFinite(n) && n !== 0 ? String(n) : '')

/**
 * Numeric field that keeps what was typed as text and hands back a number.
 *
 * With <input type="number" value={number}> the browser keeps what was typed ("01000")
 * while React sends another value, the cursor jumps to the start, and a state of 0 paints
 * a "0" you then have to delete. Here the text belongs to the user and the number is derived.
 */
export function NumberInput({ value, onValueChange, ...props }: NumberInputProps) {
  const [text, setText] = useState(() => formatNumber(value))
  const [prev, setPrev] = useState(value)
  // If the value changes from outside (loading a quote, restoring localStorage), the
  // text is derived again. State adjusted during render, not in an effect.
  if (value !== prev) {
    setPrev(value)
    if (Number(text || 0) !== value) setText(formatNumber(value))
  }
  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9.]/g, '')
        setText(raw)
        const n = Number(raw)
        onValueChange(raw === '' || !Number.isFinite(n) ? 0 : n)
      }}
    />
  )
}
