'use client'

import { useState, type ComponentProps } from 'react'
import { Input } from '@/components/ui/input'

interface NumberInputProps extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> {
  value: number
  onValueChange: (n: number) => void
}

const formatear = (n: number) => (Number.isFinite(n) && n !== 0 ? String(n) : '')

/**
 * Campo numerico que guarda lo tecleado como texto y entrega un numero.
 *
 * Con <input type="number" value={numero}> el navegador conserva lo escrito ("01000")
 * mientras React manda otro valor, el cursor salta al inicio y un estado en 0 pinta un
 * "0" que luego hay que borrar. Aqui el texto es del usuario y el numero es derivado.
 */
export function NumberInput({ value, onValueChange, ...props }: NumberInputProps) {
  const [text, setText] = useState(() => formatear(value))
  const [prev, setPrev] = useState(value)
  // Si el valor cambia desde fuera (cargar una cotizacion, restaurar localStorage), se
  // vuelve a derivar el texto. Ajuste de estado durante el render, no en un efecto.
  if (value !== prev) {
    setPrev(value)
    if (Number(text || 0) !== value) setText(formatear(value))
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
