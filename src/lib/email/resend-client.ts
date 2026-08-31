import { Resend } from 'resend';

/**
 * Cliente de Resend instanciado bajo demanda.
 *
 * `new Resend(undefined)` lanza en cuanto se evalua el modulo, asi que tenerlo en el
 * ambito superior de una route handler hacia que la ruta ni siquiera cargara sin la
 * clave: `next build` fallaba entero al recolectar /api/contact en cualquier entorno
 * sin `.env` (CI, un clon limpio). Creandolo dentro del handler, la falta de clave es
 * un error de esa peticion y no algo que tumbe el build.
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
