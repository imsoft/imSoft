import { Resend } from 'resend';

/**
 * Resend client created on demand.
 *
 * `new Resend(undefined)` throws as soon as the module is evaluated, so having it at the
 * top level of a route handler meant the route wouldn't even load without the
 * key: `next build` failed entirely while collecting /api/contact in any environment
 * without `.env` (CI, a clean clone). Creating it inside the handler, a missing key is
 * an error of that request and not something that takes down the build.
 */
let client: Resend | null = null;

export function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Falta RESEND_API_KEY: no se puede enviar el correo.');
  }
  if (!client) {
    client = new Resend(apiKey);
  }
  return client;
}
