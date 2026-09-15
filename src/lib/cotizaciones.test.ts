import { describe, it, expect } from 'vitest';
import {
  estaVencida, fechaVigencia, hitosValidos, importesHitos, itemsValidos, motivoNoAceptable,
  renderContrato, siguienteFolio, textoFormaDePago, totales, type QuoteLike,
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
    expect(totales(q)).toEqual({ subtotal: 18000, iva: 2880, total: 20880 });
    expect(totales({ ...q, apply_iva: false }).total).toBe(18000);
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
    // Sin penalizacion el texto cambia
    expect(renderContrato({ ...q, terms: { ...q.terms, penalizacion_dia: 0 } }, 'CON-2026-002')).not.toContain('por cada día hábil adicional');
    // Escapa HTML del cliente
    expect(renderContrato({ ...q, client_name: '<b>x</b>' }, 'CON-2026-003')).toContain('&lt;b&gt;x&lt;/b&gt;');
  });
});
