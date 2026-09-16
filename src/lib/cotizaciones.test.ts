import { describe, it, expect } from 'vitest';
import {
  PROMOCIONES, descuentoValido, estaVencida, featuresValidas, fechaVigencia, hitosValidos, importesHitos, itemsDesdePrecio, itemsValidos, motivoNoAceptable,
  plazoEntrega, porcentajeDescuento, precioProyecto, renderContrato, siguienteFolio, textoFormaDePago, totales, type QuoteLike,
} from './cotizaciones';
import { CONDICIONES_DEFAULT } from '@/config/emisor';

const q: QuoteLike = {
  folio: 'COT-2026-001', status: 'sent', lang: 'es',
  client_name: 'Ana Pérez', client_company: 'Clínica Dental Sonrisa', client_email: 'ana@ejemplo.mx', client_rfc: 'CDS200101ABC', client_address: 'Zapopan, Jalisco',
  title: 'Página web corporativa', intro: 'Sitio de 6 secciones con formulario de citas.',
  items: [{ concepto: 'Diseño y desarrollo', cantidad: 1, precio: 15000 }, { concepto: 'Sesión de fotos', descripcion: 'Media jornada', cantidad: 1, precio: 3000 }],
  currency: 'MXN', apply_iva: true,
  payment: { hitos: [{ label: 'Anticipo', pct: 50 }, { label: 'Liquidación', pct: 50 }], msi: true },
  terms: { ...CONDICIONES_DEFAULT, hitos: undefined as never, penalizacion_dia: 500 } as never,
  notes: null, valid_until: '2026-09-30',
};

describe('cotizaciones', () => {
  it('calcula subtotal, IVA y total', () => {
    expect(totales(q)).toEqual({ lista: 18000, descuento: 0, subtotal: 18000, iva: 2880, total: 20880 });
    expect(totales({ ...q, apply_iva: false }).total).toBe(18000);
  });

  it('el descuento baja el precio antes del IVA y se reparte en los hitos', () => {
    const conPct = { ...q, discount: { motivo: 'Cliente desde 2023', tipo: 'pct' as const, valor: 10 } };
    expect(totales(conPct)).toEqual({ lista: 18000, descuento: 1800, subtotal: 16200, iva: 2592, total: 18792 });
    expect(porcentajeDescuento(conPct)).toBe(10);
    const conMonto = { ...q, discount: { motivo: 'Promoción', tipo: 'monto' as const, valor: 3000 } };
    expect(totales(conMonto).subtotal).toBe(15000);
    expect(porcentajeDescuento(conMonto)).toBeCloseTo(16.67, 2);
    // Nunca mas que el precio, nunca negativo
    expect(totales({ ...q, discount: { motivo: 'x', tipo: 'monto', valor: 99999 } }).subtotal).toBe(0);
    expect(totales({ ...q, discount: { motivo: 'x', tipo: 'pct', valor: -5 } }).descuento).toBe(0);
    // Los hitos se calculan sobre el total con descuento
    const h = importesHitos(totales(conPct).total, q.payment.hitos);
    expect(h.reduce((s, x) => s + x.importe, 0)).toBe(18792);
    // Validacion: motivo obligatorio
    expect(descuentoValido({ motivo: '', tipo: 'pct', valor: 10 })).toMatch(/motivo/);
    expect(descuentoValido({ motivo: 'Referido', tipo: 'pct', valor: 100 })).toMatch(/100/);
    expect(descuentoValido({ motivo: 'Referido', tipo: 'pct', valor: 5 })).toBeNull();
    expect(descuentoValido(null)).toBeNull();
    expect(PROMOCIONES.every((p) => p.motivo && p.valor > 0)).toBe(true);
    // El contrato explica el descuento
    const html = renderContrato({ ...conPct, status: 'accepted', accepted_at: '2026-09-16T00:00:00Z', accepted_name: 'Ana Pérez' }, 'CON-2026-001');
    expect(html).toContain('precio de lista de $18,000.00');
    expect(html).toContain('Cliente desde 2023');
    expect(html).toContain('$18,792.00');
  });

  it('reparte los hitos y el ultimo absorbe el redondeo', () => {
    const h = importesHitos(20880, [{ label: 'A', pct: 40 }, { label: 'B', pct: 30 }, { label: 'C', pct: 30 }]);
    expect(h.map((x) => x.importe)).toEqual([8352, 6264, 6264]);
    expect(h.reduce((s, x) => s + x.importe, 0)).toBe(20880);
    const impar = importesHitos(100.01, [{ label: 'A', pct: 33 }, { label: 'B', pct: 33 }, { label: 'C', pct: 34 }]);
    expect(impar.reduce((s, x) => s + x.importe, 0)).toBeCloseTo(100.01, 2);
  });

  it('valida hitos y conceptos', () => {
    expect(hitosValidos([{ label: 'A', pct: 60 }, { label: 'B', pct: 50 }])).toMatch(/suman 110/);
    expect(hitosValidos([{ label: '', pct: 100 }])).toMatch(/nombre/);
    expect(hitosValidos(q.payment.hitos)).toBeNull();
    expect(itemsValidos([])).toMatch(/al menos/);
    expect(itemsValidos([{ concepto: 'x', cantidad: 0, precio: 1 }])).toMatch(/válidos/);
    expect(itemsValidos(q.items)).toBeNull();
  });

  it('precio unico y caracteristicas', () => {
    const items = itemsDesdePrecio('Página web', 18000);
    expect(items).toEqual([{ concepto: 'Página web', cantidad: 1, precio: 18000 }]);
    expect(precioProyecto({ items })).toBe(18000);
    expect(featuresValidas(['', '  '])).toMatch(/al menos/);
    expect(featuresValidas(['6 secciones'])).toBeNull();
    const html = renderContrato({ ...q, items, features: ['6 secciones', 'Formulario de citas', '<script>'] }, 'CON-2026-009');
    expect(html).toContain('las siguientes 3 características');
    expect(html).toContain('<ol><li>6 secciones</li><li>Formulario de citas</li><li>&lt;script&gt;</li></ol>');
    expect(html).not.toContain('Sesión de fotos');
  });

  it('el plazo de entrega se calcula desde la cotizacion hasta la fecha limite', () => {
    const conFecha = { terms: { ...q.terms, fecha_limite: '2026-10-12' }, created_at: '2026-09-14T18:00:00Z' };
    const p = plazoEntrega(conFecha);
    expect(p).toMatchObject({ fechaLimite: '2026-10-12', dias: 28, semanas: 4 });
    expect(p.texto).toBe('12 de octubre de 2026 (4 semanas a partir de la cotización)');
    // 30 dias redondean a 5 semanas; un plazo minimo es 1 semana
    expect(plazoEntrega({ terms: { ...q.terms, fecha_limite: '2026-10-14' }, created_at: '2026-09-14' }).semanas).toBe(5);
    expect(plazoEntrega({ terms: { ...q.terms, fecha_limite: '2026-09-15' }, created_at: '2026-09-14' }).semanas).toBe(1);
    // Sin fecha limite (cotizaciones viejas) se usa entrega_semanas desde la creacion
    const sin = plazoEntrega({ terms: { ...q.terms, fecha_limite: null, entrega_semanas: 4 }, created_at: '2026-09-14T18:00:00Z' });
    expect(sin.fechaLimite).toBe('2026-10-12');
    const html = renderContrato({ ...q, ...conFecha }, 'CON-2026-010');
    expect(html).toContain('a más tardar el <strong>12 de octubre de 2026</strong>, es decir, en un plazo de 4 semanas');
  });

  it('folios consecutivos por ano', () => {
    const hoy = new Date('2026-09-14T12:00:00Z');
    expect(siguienteFolio('COT', null, hoy)).toBe('COT-2026-001');
    expect(siguienteFolio('COT', 'COT-2026-009', hoy)).toBe('COT-2026-010');
    expect(siguienteFolio('COT', 'COT-2025-042', hoy)).toBe('COT-2026-001');
    expect(siguienteFolio('CON', 'basura', hoy)).toBe('CON-2026-001');
  });

  it('vigencia y aceptacion', () => {
    expect(fechaVigencia(15, new Date('2026-09-14T12:00:00Z'))).toBe('2026-09-29');
    expect(estaVencida(q, new Date('2026-09-30T23:00:00Z'))).toBe(false);
    expect(estaVencida(q, new Date('2026-10-01T00:00:00Z'))).toBe(true);
    expect(motivoNoAceptable(q, new Date('2026-09-20T00:00:00Z'))).toBeNull();
    expect(motivoNoAceptable({ ...q, status: 'draft' })).toMatch(/no se ha enviado/);
    expect(motivoNoAceptable({ ...q, status: 'accepted' }, new Date('2027-01-01'))).toMatch(/ya fue aceptada/);
    expect(motivoNoAceptable(q, new Date('2026-10-05T00:00:00Z'))).toMatch(/venció el 30 de septiembre de 2026/);
  });

  it('describe la forma de pago con hitos y MSI', () => {
    const t = textoFormaDePago(q);
    expect(t[0]).toBe('Anticipo: 50% ($10,440.00)');
    expect(t[1]).toBe('Liquidación: 50% ($10,440.00)');
    expect(t[2]).toMatch(/3, 6 o 12 meses sin intereses/);
    expect(t[2]).toMatch(/6 pagos de \$3,480/);
    expect(t[3]).toContain('facturacion@imsoft.io');
    expect(textoFormaDePago({ ...q, payment: { ...q.payment, msi: false } })).toHaveLength(3);
  });

  it('el contrato lleva las partes, el alcance, los pagos y las condiciones', () => {
    const html = renderContrato(q, 'CON-2026-001', new Date('2026-09-14T18:00:00Z'));
    expect(html).toContain('Brandon Uriel García Ramos');
    expect(html).toContain('GARB9703155ZA');
    expect(html).toContain('Ana Pérez');
    expect(html).toContain('Clínica Dental Sonrisa');
    expect(html).toContain('<strong>$20,880.00</strong>');
    expect(html).toContain('Anticipo: 50% del total, $10,440.00.');
    expect(html).toContain('$500.00 por cada día hábil adicional');
    expect(html).toContain('30 días naturales');
    expect(html).toContain('Guadalajara, Jalisco, México');
    expect(html).toContain('Col. Parques del Nilo, C.P. 44860');
    expect(html).toContain('propiedad del cliente');
    expect(html).toContain('facturacion@imsoft.io');
    expect(html).toContain('soporte@imsoft.io');
    // Sin penalizacion el texto cambia
    expect(renderContrato({ ...q, terms: { ...q.terms, penalizacion_dia: 0 } }, 'CON-2026-002')).not.toContain('por cada día hábil adicional');
    // Escapa HTML del cliente
    expect(renderContrato({ ...q, client_name: '<b>x</b>' }, 'CON-2026-003')).toContain('&lt;b&gt;x&lt;/b&gt;');
  });
});
