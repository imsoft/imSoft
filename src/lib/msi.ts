/**
 * Meses sin intereses (Stripe Mexico, activados en el Dashboard el 13-sep-2026).
 *
 * Stripe cobra una comision extra sobre la venta segun el plazo (3 m: 5 %, 6 m: 7.5 %,
 * 12 m: 12.5 %), asi que en el sitio se anuncian solo los plazos que tienen sentido y
 * a partir de un monto minimo. Los planes reales los decide la configuracion de Stripe.
 */

/** Plazos que se ofrecen en el sitio. */
export const MSI_PLAZOS = [3, 6, 12] as const;
/** Por debajo de esto no se anuncian meses sin intereses en el sitio. */
export const MSI_MINIMO_MXN = 15000;
/** Plazo que se muestra en las tarjetas de precios como ejemplo de mensualidad. */
export const MSI_PLAZO_EJEMPLO = 6;

const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export function formatoPesos(monto: number): string {
  return pesos.format(monto).replace(/ /g, ' ');
}

/** "6 pagos de $2,500 sin intereses", o null si el monto no alcanza el minimo. */
export function msiEtiqueta(totalMxn: number, meses: number = MSI_PLAZO_EJEMPLO, lang: string = 'es'): string | null {
  if (!Number.isFinite(totalMxn) || totalMxn < MSI_MINIMO_MXN) return null;
  const mensual = Math.ceil(totalMxn / meses);
  return lang === 'en'
    ? `or ${meses} interest-free payments of ${formatoPesos(mensual)} MXN`
    : `o ${meses} pagos de ${formatoPesos(mensual)} sin intereses`;
}

/** Saca el numero de un precio como "Desde $15,000 MXN". */
export function montoDesde(precio: string): number | null {
  const m = precio.replace(/,/g, '').match(/\$\s?(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}
