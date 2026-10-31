/**
 * Online store price. Minimum set by Brandon on 2026-09-28: $9,999 MXN, for a basic store
 * from a template. The three full stores in the portfolio cost $19,000 to $60,000 MXN; that
 * range is published, not each client's price.
 * Separate file so city-services and price-guides can share it without importing each other.
 */
export const ONLINE_STORE_PRICE = {
  title: 'Cuánto cuesta una tienda en línea',
  description: 'Precio de referencia publicado; el precio final se fija por escrito antes de empezar.',
  items: [{ name: 'Tienda en línea básica', price: 'Desde $9,999 MXN', includes: 'Tienda básica con plantilla personalizada: catálogo por categorías, carrito, pago en línea y panel para administrar productos y pedidos.' }],
  note: 'Con más productos, diseño propio o integraciones, el precio sube: las tiendas completas que hemos entregado van de $19,000 a $60,000 MXN.',
};
