/** An absolute URL (Supabase Storage, Unsplash...) versus a local path under /public. */
export function isRemote(src: string): boolean {
  return /^https?:\/\//i.test(src) || src.startsWith('//');
}
