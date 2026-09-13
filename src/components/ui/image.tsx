import NextImage, { type ImageProps } from 'next/image';
import { esRemota } from '@/lib/image-src';

/**
 * next/image que no pasa las imagenes remotas por el optimizador de Vercel.
 *
 * El plan Hobby limita las imagenes remotas optimizadas al mes; al superarlo Vercel
 * responde 402 y todas las portadas del blog y del portafolio (Supabase Storage) se
 * ven rotas. Las remotas se sirven tal cual desde su origen; las locales (/logos...)
 * siguen optimizadas, que es donde el optimizador si aporta.
 */
export default function Image(props: ImageProps) {
  const src = typeof props.src === 'string' ? props.src : '';
  return <NextImage {...props} unoptimized={props.unoptimized ?? esRemota(src)} />;
}
