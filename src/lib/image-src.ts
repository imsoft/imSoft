/** Una URL absoluta (Supabase Storage, Unsplash...) frente a una ruta local de /public. */
export function esRemota(src: string): boolean {
  return /^https?:\/\//i.test(src) || src.startsWith('//');
}
