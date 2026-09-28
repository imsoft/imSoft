/**
 * Precio de tienda en linea. Minimo fijado por Brandon el 28-sep-2026: $9,999 MXN, para una
 * tienda basica con plantilla. Las tres tiendas completas del portafolio costaron de $19,000 a
 * $60,000 MXN; se publica ese rango, no el precio de cada cliente.
 * Archivo aparte para que city-services y guias-precio lo compartan sin importarse entre si.
 */
export const PRECIO_TIENDA_EN_LINEA = {
  title: 'Cuánto cuesta una tienda en línea',
  description: 'Precio de referencia publicado; el precio final se fija por escrito antes de empezar.',
  items: [{ name: 'Tienda en línea básica', price: 'Desde $9,999 MXN', includes: 'Tienda básica con plantilla personalizada: catálogo por categorías, carrito, pago en línea y panel para administrar productos y pedidos.' }],
  note: 'Con más productos, diseño propio o integraciones, el precio sube: las tiendas completas que hemos entregado van de $19,000 a $60,000 MXN.',
};
