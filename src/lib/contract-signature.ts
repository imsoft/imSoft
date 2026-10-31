/**
 * Drawn signature and integrity hash of a contract accepted online. Pure logic (no I/O):
 * the acceptance route and the document pages use it.
 *
 * Click acceptance is already a valid simple electronic signature in Mexico (Código de
 * Comercio, art. 89 et seq.). The stroke adds no validity, but the client feels they
 * signed and the PDF looks like a traditional contract. The SHA-256 hash does add
 * evidentiary value: it proves the accepted text is identical to the one on file. The
 * hash is computed in `contract-hash.ts` (it uses node:crypto); this file is also
 * imported by browser components.
 */
/** Maximum size of the signature PNG (data URL). A normal stroke weighs 5-30 KB. */
export const SIGNATURE_MAX_BYTES = 200_000;

const PNG_PREFIX = 'data:image/png;base64,';

/** Short hash to show on the document (first 16 characters, in groups of 4). */
export function shortHash(hash: string): string {
  return (hash.slice(0, 16).match(/.{1,4}/g) ?? []).join(' ');
}

/**
 * Validates the signature the browser sends: it must be a PNG data URL, with well-formed
 * base64 and a reasonable size. Returns the rejection reason, or null if it is valid.
 */
export function signatureError(signature: unknown): string | null {
  if (typeof signature !== 'string' || signature.length === 0) return 'Dibuja tu firma para aceptar.';
  if (!signature.startsWith(PNG_PREFIX)) return 'La firma no tiene un formato válido.';
  const b64 = signature.slice(PNG_PREFIX.length);
  if (b64.length < 200) return 'La firma está vacía: dibújala con el dedo o el mouse.';
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) return 'La firma no tiene un formato válido.';
  if (signature.length > SIGNATURE_MAX_BYTES) return 'La firma es demasiado grande; vuelve a dibujarla.';
  // PNG header: the first 8 bytes are 89 50 4E 47 0D 0A 1A 0A -> "iVBORw0KGgo" in base64.
  if (!b64.startsWith('iVBORw0KGgo')) return 'La firma no tiene un formato válido.';
  return null;
}
