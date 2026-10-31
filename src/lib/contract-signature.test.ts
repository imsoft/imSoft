import { describe, it, expect } from 'vitest';
import { SIGNATURE_MAX_BYTES, shortHash, signatureError } from './contract-signature';
import { contractHash } from './contract-hash';

const png = 'data:image/png;base64,iVBORw0KGgo' + 'A'.repeat(400) + '==';

describe('contractHash', () => {
  it('is a deterministic SHA-256 that changes with any edit', () => {
    const h = contractHash('<p>Hola</p>');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(contractHash('<p>Hola</p>')).toBe(h);
    expect(contractHash('<p>Hola.</p>')).not.toBe(h);
  });

  it('the short hash groups characters four by four', () => {
    expect(shortHash('0123456789abcdef0000')).toBe('0123 4567 89ab cdef');
  });
});

describe('signatureError', () => {
  it('accepts a reasonably sized PNG data URL', () => {
    expect(signatureError(png)).toBeNull();
  });

  it('rejects empty values, other formats, broken base64, empty strokes and huge files', () => {
    expect(signatureError(undefined)).toMatch(/Dibuja tu firma/);
    expect(signatureError('')).toMatch(/Dibuja tu firma/);
    expect(signatureError('data:image/jpeg;base64,' + 'A'.repeat(400))).toMatch(/formato/);
    expect(signatureError('data:image/png;base64,iVBORw0KGgo' + 'A'.repeat(400) + '<script>')).toMatch(/formato/);
    expect(signatureError('data:image/png;base64,' + 'A'.repeat(400))).toMatch(/formato/);
    expect(signatureError('data:image/png;base64,iVBORw0KGgoAAA')).toMatch(/vacía/);
    expect(signatureError('data:image/png;base64,iVBORw0KGgo' + 'A'.repeat(SIGNATURE_MAX_BYTES))).toMatch(/demasiado grande/);
  });
});
