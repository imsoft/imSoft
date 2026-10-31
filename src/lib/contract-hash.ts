import { createHash } from 'node:crypto';

/** Hex SHA-256 of the contract text exactly as stored. Server only. */
export function contractHash(bodyHtml: string): string {
  return createHash('sha256').update(bodyHtml, 'utf8').digest('hex');
}
