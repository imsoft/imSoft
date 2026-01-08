import * as React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  dict: Dictionary
  lang: Locale
}


export interface NoiseProps {
  patternSize?: number
  patternScaleX?: number
  patternScaleY?: number
  patternRefreshInterval?: number
  patternAlpha?: number
}

export interface Position {
  x: number
  y: number
}

export interface MagnetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  padding?: number
  disabled?: boolean
  magnetStrength?: number
  activeTransition?: string
  inactiveTransition?: string
  wrapperClassName?: string
  innerClassName?: string
}

export interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`
}

export interface TiltedCardProps {
  imageSrc: React.ComponentProps<'img'>['src']
  altText?: string
  captionText?: string
  containerHeight?: React.CSSProperties['height']
  containerWidth?: React.CSSProperties['width']
  imageHeight?: React.CSSProperties['height']
  imageWidth?: React.CSSProperties['width']
  scaleOnHover?: number
  rotateAmplitude?: number
  showMobileWarning?: boolean
  showTooltip?: boolean
  overlayContent?: React.ReactNode
  displayOverlayContent?: boolean
}


