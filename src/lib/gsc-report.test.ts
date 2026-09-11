import { describe, it, expect } from 'vitest';
import {
  BASELINE,
  classifyQuery,
  coverageSummary,
  deltaVsBaseline,
  outageImpact,
  pickProperty,
  renderReport,
  summarizeQueries,
  type InspectionRow,
  type QueryRow,
} from './gsc-report';

const q = (query: string, impressions = 10, clicks = 0): QueryRow => ({
  query,
  impressions,
  clicks,
  ctr: impressions ? clicks / impressions : 0,
  position: 30,
});

describe('classifyQuery', () => {
  it('reconoce la marca propia, con y sin errata', () => {
    expect(classifyQuery('imsoft')).toBe('marca');
    expect(classifyQuery('imSoft Guadalajara')).toBe('marca');
    expect(classifyQuery('imsof')).toBe('marca');
  });

  it('separa las busquedas de IMS, que es otra empresa', () => {
    // Son las consultas reales de GSC que traian impresiones y cero clics.
    for (const query of [
      'ims software',
      'ims technology',
      'ims tech',
      'soluciones ims',
      'software ims',
      'i soft',
      'im software',
      'ims 소프트웨어',
    ]) {
      expect(classifyQuery(query), query).toBe('colision-ims');
    }
  });

  it('atrapa las erratas de marca y las variantes de IMS que vio el primer reporte real', () => {
    // Salieron como "comerciales" en el reporte del 11-sep-2026 y no lo son.
    expect(classifyQuery('insoft')).toBe('marca');
    for (const query of [
      'i.soft',
      "i'm soft",
      'i-software',
      'imsdatawise',
      'imhosys',
      'imhio',
      'inisoft',
      'iosoft',
      'oisoft',
      'oims software',
      'international micro systems',
      'iomify limited',
    ]) {
      expect(classifyQuery(query), query).toBe('colision-ims');
    }
  });

  it('todo lo demas es comercial: el trafico que si se puede ganar', () => {
    expect(classifyQuery('empresas de desarrollo de software en guadalajara')).toBe('comercial');
    expect(classifyQuery('páginas web zapopan')).toBe('comercial');
    expect(classifyQuery('desarrollo de páginas web guadalajara')).toBe('comercial');
    expect(classifyQuery('servicios de desarrollo de software para logistica')).toBe('comercial');
    expect(classifyQuery('diseño web zapopan')).toBe('comercial');
    expect(classifyQuery('consultoria integral tecnologica')).toBe('comercial');
    // Termina en "soft" pero es una consulta de verdad, no una marca de cuatro letras.
    expect(classifyQuery('empresas de software')).toBe('comercial');
  });

  it('no confunde palabras que contienen "ims" sin ser la sigla', () => {
    expect(classifyQuery('sistemas de gestión')).toBe('comercial');
  });
});

describe('summarizeQueries', () => {
  it('acumula por clase y ordena las comerciales por impresiones', () => {
    const { porClase, comerciales } = summarizeQueries([
      q('imsoft', 86, 12),
      q('ims software', 88, 0),
      q('paginas web guadalajara', 40, 2),
      q('desarrollo de software guadalajara', 70, 1),
    ]);
    expect(porClase.marca).toEqual({ clicks: 12, impressions: 86, consultas: 1 });
    expect(porClase['colision-ims']).toEqual({ clicks: 0, impressions: 88, consultas: 1 });
    expect(porClase.comercial).toEqual({ clicks: 3, impressions: 110, consultas: 2 });
    expect(comerciales.map((r) => r.query)).toEqual([
      'desarrollo de software guadalajara',
      'paginas web guadalajara',
    ]);
  });

  it('limita el top comercial a 15', () => {
    const rows = Array.from({ length: 30 }, (_, i) => q(`consulta ${i}`, 30 - i));
    expect(summarizeQueries(rows).comerciales).toHaveLength(15);
  });
});

describe('pickProperty', () => {
  it('prefiere la propiedad de dominio', () => {
    expect(
      pickProperty([{ siteUrl: 'https://www.imsoft.io/' }, { siteUrl: 'sc-domain:imsoft.io' }]),
    ).toBe('sc-domain:imsoft.io');
  });

  it('cae al prefijo www si no hay dominio, y a null si no hay nada', () => {
    expect(pickProperty([{ siteUrl: 'https://www.imsoft.io/' }])).toBe('https://www.imsoft.io/');
    expect(pickProperty([])).toBeNull();
    expect(pickProperty([{ siteUrl: null }])).toBeNull();
  });
});

describe('deltaVsBaseline', () => {
  it('calcula porcentajes contra el baseline del 27-ago', () => {
    const d = deltaVsBaseline({ clicks: 30, impressions: 994, ctr: 0.03, position: 29.4 });
    expect(d.clicks.pct).toBe(100);
    expect(d.impressions.pct).toBe(100);
    expect(d.position.diff).toBe(-10);
    expect(d.clicks.base).toBe(BASELINE.rendimiento28d.clicks);
  });
});

describe('outageImpact', () => {
  const dia = (date: string, impressions: number) => ({ date, clicks: 0, impressions });

  it('separa antes, durante y despues de la caida del dominio', () => {
    const r = outageImpact([
      dia('2026-08-30', 20),
      dia('2026-09-01', 30),
      dia('2026-09-02', 5),
      dia('2026-09-08', 1),
      dia('2026-09-09', 15),
    ]);
    expect(r.antes).toBe(25);
    expect(r.durante).toBe(3);
    expect(r.despues).toBe(15);
    expect(r.dias).toEqual({ antes: 2, durante: 2, despues: 1 });
  });

  it('deja "despues" en null cuando GSC aun no entrega esos dias', () => {
    const r = outageImpact([dia('2026-09-01', 10), dia('2026-09-05', 2)]);
    expect(r.despues).toBeNull();
    expect(r.dias.despues).toBe(0);
  });

  it('ignora dias anteriores a la ventana de referencia', () => {
    expect(outageImpact([dia('2026-08-01', 999)]).antes).toBeNull();
  });
});

describe('coverageSummary', () => {
  const insp = (url: string, coverageState: string, lastCrawlTime: string | null): InspectionRow => ({
    url,
    verdict: 'PASS',
    coverageState,
    lastCrawlTime,
  });

  it('distingue lo que Google ya volvio a rastrear tras la caida, cortando por la hora', () => {
    const r = coverageSummary([
      insp('https://www.imsoft.io/es', 'Submitted and indexed', '2026-09-09T10:00:00Z'),
      // El sitio volvio el 8 a las 16:30Z: un rastreo de esa tarde ya vio el sitio real...
      insp('https://www.imsoft.io/es/about', 'Submitted and indexed', '2026-09-08T20:00:00Z'),
      // ...y uno de esa manana vio el parking.
      insp('https://www.imsoft.io/es/contact', 'Submitted and indexed', '2026-09-08T09:00:00Z'),
      insp('https://www.imsoft.io/es/zapopan/paginas-web', 'URL is unknown to Google', null),
    ]);
    expect(r.porEstado).toEqual({ 'Submitted and indexed': 3, 'URL is unknown to Google': 1 });
    expect(r.rastreadasTrasCaida).toEqual(['https://www.imsoft.io/es', 'https://www.imsoft.io/es/about']);
    expect(r.sinRastrearTrasCaida).toHaveLength(2);
  });
});

describe('renderReport', () => {
  it('produce un informe legible con todas las secciones', () => {
    const rows = [q('imsoft', 86, 12), q('paginas web guadalajara', 40, 2)];
    const { porClase, comerciales } = summarizeQueries(rows);
    const texto = renderReport({
      propiedad: 'sc-domain:imsoft.io',
      rango: { start: '2026-08-12', end: '2026-09-08' },
      totales: { clicks: 14, impressions: 126, ctr: 0.111, position: 28.3 },
      porClase,
      comerciales,
      paginas: [{ page: 'https://www.imsoft.io/es', clicks: 10, impressions: 90, position: 12 }],
      impacto: outageImpact([]),
      cobertura: coverageSummary([]),
      inspecciones: [],
    });
    for (const seccion of ['RENDIMIENTO', 'CONSULTAS', 'COMERCIALES', 'TOP páginas', 'CAÍDA', 'INDEXACIÓN']) {
      expect(texto).toContain(seccion);
    }
    expect(texto).toContain('paginas web guadalajara');
    expect(texto).toContain('/es');
    expect(texto).toContain('11.1%');
  });

  it('muestra la canonica que eligio Google cuando difiere de la declarada', () => {
    const texto = renderReport({
      propiedad: 'sc-domain:imsoft.io',
      rango: { start: '2026-08-12', end: '2026-09-08' },
      totales: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      porClase: summarizeQueries([]).porClase,
      comerciales: [],
      paginas: [],
      impacto: outageImpact([]),
      cobertura: coverageSummary([]),
      inspecciones: [
        {
          url: 'https://www.imsoft.io/es/contact',
          verdict: 'NEUTRAL',
          coverageState: 'Duplicate, Google chose different canonical than user',
          lastCrawlTime: '2026-09-08T18:00:00Z',
          userCanonical: 'https://www.imsoft.io/es/contact',
          googleCanonical: 'https://imsoft.io/es/contact',
        },
      ],
    });
    expect(texto).toContain('Google eligió: https://imsoft.io/es/contact');
  });
});
