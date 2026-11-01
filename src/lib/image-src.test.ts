import { describe, it, expect } from 'vitest';
import { isRemote } from './image-src';

describe('isRemote', () => {
  it('tells absolute URLs from local paths', () => {
    expect(isRemote('https://wuttmqoohdsgbsdbanoj.supabase.co/storage/v1/object/public/blog-images/x.jpg')).toBe(true);
    expect(isRemote('http://images.unsplash.com/a')).toBe(true);
    expect(isRemote('//cdn.example.com/a.png')).toBe(true);
    expect(isRemote('/logos/logo-imsoft-blue.png')).toBe(false);
    expect(isRemote('data:image/png;base64,AAAA')).toBe(false);
  });
});
