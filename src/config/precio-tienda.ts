/**
 * Precio de tienda en linea. Brandon dio lo que cobro por las tres tiendas del portafolio
 * (26-sep-2026): van de $19,000 a $60,000 MXN. Se publica el rango, no el precio de cada cliente.
 * Archivo aparte para que city-services y guias-precio lo compartan sin importarse entre si.
 */
export const PRECIO_TIENDA_EN_LINEA = {
  title: 'Cuánto cuesta una tienda en línea',
  description: 'Precio de referencia publicado; el precio final se fija por escrito antes de empezar.',
  items: [{ name: 'Tienda en línea', price: 'Desde $19,000 MXN', includes: 'Catálogo por categorías, carrito y proceso de compra, búsqueda de productos y envíos a todo México, con diseño de tu marca.' }],
  note: 'Las tiendas que hemos entregado van de $19,000 a $60,000 MXN, según el tamaño del catálogo y las integraciones.',
};
