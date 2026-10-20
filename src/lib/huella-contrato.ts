import { createHash } from 'node:crypto';

/** SHA-256 en hexadecimal del texto del contrato tal cual se guarda. Solo servidor. */
export function huellaContrato(bodyHtml: string): string {
  return createHash('sha256').update(bodyHtml, 'utf8').digest('hex');
}
