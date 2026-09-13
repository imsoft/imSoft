import { describe, it, expect } from 'vitest';
import { esRemota } from './image-src';

describe('esRemota', () => {
  it('distingue URLs absolutas de rutas locales', () => {
    expect(esRemota('https://wuttmqoohdsgbsdbanoj.supabase.co/storage/v1/object/public/blog-images/x.jpg')).toBe(true);
    expect(esRemota('http://images.unsplash.com/a')).toBe(true);
    expect(esRemota('//cdn.example.com/a.png')).toBe(true);
    expect(esRemota('/logos/logo-imsoft-blue.png')).toBe(false);
    expect(esRemota('data:image/png;base64,AAAA')).toBe(false);
  });
});
