import NextImage, { type ImageProps } from 'next/image';
import { isRemote } from '@/lib/image-src';

/**
 * next/image that doesn't send remote images through Vercel's optimizer.
 *
 * The Hobby plan caps optimized remote images per month; past that Vercel
 * responds 402 and every blog and portfolio cover (Supabase Storage) shows
 * broken. Remote images are served as-is from their origin; local ones (/logos...)
 * stay optimized, which is where the optimizer actually helps.
 */
export default function Image(props: ImageProps) {
  const src = typeof props.src === 'string' ? props.src : '';
  return <NextImage {...props} unoptimized={props.unoptimized ?? isRemote(src)} />;
}
