/**
 * Firma dibujada y huella de integridad de un contrato aceptado en linea. Logica pura
 * (sin E/S): la ruta de aceptacion y las paginas del documento la usan.
 *
 * La aceptacion por clic ya es una firma electronica simple valida en Mexico (Codigo de
 * Comercio, art. 89 y ss.). El trazo no agrega validez, pero el cliente siente que firmo
 * y el PDF se ve como un contrato tradicional. La huella SHA-256 si agrega valor
 * probatorio: demuestra que el texto aceptado es identico al que se conserva. La huella
 * se calcula en `huella-contrato.ts` (usa node:crypto); este archivo lo importan tambien
 * componentes del navegador.
 */
/** Tamano maximo del PNG de la firma (data URL). Un trazo normal pesa 5-30 KB. */
export const FIRMA_MAX_BYTES = 200_000;

const PREFIJO_PNG = 'data:image/png;base64,';

/** Huella corta para mostrar en el documento (primeros 16 caracteres, en grupos de 4). */
export function huellaCorta(hash: string): string {
  return (hash.slice(0, 16).match(/.{1,4}/g) ?? []).join(' ');
}

/**
 * Valida la firma que manda el navegador: debe ser un PNG en data URL, con base64
 * bien formado y de tamano razonable. Devuelve el motivo del rechazo o null si es valida.
 */
export function motivoFirmaInvalida(firma: unknown): string | null {
  if (typeof firma !== 'string' || firma.length === 0) return 'Dibuja tu firma para aceptar.';
  if (!firma.startsWith(PREFIJO_PNG)) return 'La firma no tiene un formato válido.';
  const b64 = firma.slice(PREFIJO_PNG.length);
  if (b64.length < 200) return 'La firma está vacía: dibújala con el dedo o el mouse.';
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) return 'La firma no tiene un formato válido.';
  if (firma.length > FIRMA_MAX_BYTES) return 'La firma es demasiado grande; vuelve a dibujarla.';
  // Cabecera PNG: los primeros 8 bytes son 89 50 4E 47 0D 0A 1A 0A -> "iVBORw0KGgo" en base64.
  if (!b64.startsWith('iVBORw0KGgo')) return 'La firma no tiene un formato válido.';
  return null;
}
