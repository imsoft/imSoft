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
  it('recognizes our own brand, with and without typos', () => {
    expect(classifyQuery('imsoft')).toBe('brand');
    expect(classifyQuery('imSoft Guadalajara')).toBe('brand');
    expect(classifyQuery('imsof')).toBe('brand');
  });

  it('separates the searches for IMS, which is another company', () => {
    // These are the real GSC queries that brought impressions and zero clicks.
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
      expect(classifyQuery(query), query).toBe('ims-collision');
    }
  });

  it('catches the brand typos and the IMS variants the first real report saw', () => {
    // They showed up as "comerciales" in the 2026-09-11 report and they aren't.
    expect(classifyQuery('insoft')).toBe('brand');
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
      expect(classifyQuery(query), query).toBe('ims-collision');
    }
  });

  it('everything else is commercial: the traffic that can actually be won', () => {
    expect(classifyQuery('empresas de desarrollo de software en guadalajara')).toBe('commercial');
    expect(classifyQuery('páginas web zapopan')).toBe('commercial');
    expect(classifyQuery('desarrollo de páginas web guadalajara')).toBe('commercial');
    expect(classifyQuery('servicios de desarrollo de software para logistica')).toBe('commercial');
    expect(classifyQuery('diseño web zapopan')).toBe('commercial');
    expect(classifyQuery('consultoria integral tecnologica')).toBe('commercial');
    // Ends in "soft" but it's a real query, not a four-letter brand.
    expect(classifyQuery('empresas de software')).toBe('commercial');
  });

  it('does not confuse words that contain "ims" without being the acronym', () => {
    expect(classifyQuery('sistemas de gestión')).toBe('commercial');
  });
});

describe('summarizeQueries', () => {
  it('accumulates by class and sorts the commercial ones by impressions', () => {
    const { byClass, commercial } = summarizeQueries([
      q('imsoft', 86, 12),
      q('ims software', 88, 0),
      q('paginas web guadalajara', 40, 2),
      q('desarrollo de software guadalajara', 70, 1),
    ]);
    expect(byClass.brand).toEqual({ clicks: 12, impressions: 86, queries: 1 });
    expect(byClass['ims-collision']).toEqual({ clicks: 0, impressions: 88, queries: 1 });
    expect(byClass.commercial).toEqual({ clicks: 3, impressions: 110, queries: 2 });
    expect(commercial.map((r) => r.query)).toEqual([
      'desarrollo de software guadalajara',
      'paginas web guadalajara',
    ]);
  });

  it('caps the commercial top at 15', () => {
    const rows = Array.from({ length: 30 }, (_, i) => q(`consulta ${i}`, 30 - i));
    expect(summarizeQueries(rows).commercial).toHaveLength(15);
  });
});

describe('pickProperty', () => {
  it('prefers the domain property', () => {
    expect(
      pickProperty([{ siteUrl: 'https://www.imsoft.io/' }, { siteUrl: 'sc-domain:imsoft.io' }]),
    ).toBe('sc-domain:imsoft.io');
  });

  it('falls back to the www prefix if there is no domain, and to null if there is nothing', () => {
    expect(pickProperty([{ siteUrl: 'https://www.imsoft.io/' }])).toBe('https://www.imsoft.io/');
    expect(pickProperty([])).toBeNull();
    expect(pickProperty([{ siteUrl: null }])).toBeNull();
  });
});

describe('deltaVsBaseline', () => {
  it('computes percentages against the Aug 27 baseline', () => {
    const d = deltaVsBaseline({ clicks: 30, impressions: 994, ctr: 0.03, position: 29.4 });
    expect(d.clicks.pct).toBe(100);
    expect(d.impressions.pct).toBe(100);
    expect(d.position.diff).toBe(-10);
    expect(d.clicks.base).toBe(BASELINE.performance28d.clicks);
  });
});

describe('outageImpact', () => {
  const day = (date: string, impressions: number) => ({ date, clicks: 0, impressions });

  it('separates before, during and after the domain outage', () => {
    const r = outageImpact([
      day('2026-08-30', 20),
      day('2026-09-01', 30),
      day('2026-09-02', 5),
      day('2026-09-08', 1),
      day('2026-09-09', 15),
    ]);
    expect(r.before).toBe(25);
    expect(r.during).toBe(3);
    expect(r.after).toBe(15);
    expect(r.days).toEqual({ before: 2, during: 2, after: 1 });
  });

  it('leaves "after" as null when GSC does not deliver those days yet', () => {
    const r = outageImpact([day('2026-09-01', 10), day('2026-09-05', 2)]);
    expect(r.after).toBeNull();
    expect(r.days.after).toBe(0);
  });

  it('ignores days before the baseline window', () => {
    expect(outageImpact([day('2026-08-01', 999)]).before).toBeNull();
  });
});

describe('coverageSummary', () => {
  const insp = (url: string, coverageState: string, lastCrawlTime: string | null): InspectionRow => ({
    url,
    verdict: 'PASS',
    coverageState,
    lastCrawlTime,
  });

  it('tells what Google already recrawled after the outage, cutting by the hour', () => {
    const r = coverageSummary([
      insp('https://www.imsoft.io/es', 'Submitted and indexed', '2026-09-09T10:00:00Z'),
      // The site came back on the 8th at 16:30Z: a crawl that afternoon already saw the real site...
      insp('https://www.imsoft.io/es/about', 'Submitted and indexed', '2026-09-08T20:00:00Z'),
      // ...and one that morning saw the parking page.
      insp('https://www.imsoft.io/es/contact', 'Submitted and indexed', '2026-09-08T09:00:00Z'),
      insp('https://www.imsoft.io/es/zapopan/paginas-web', 'URL is unknown to Google', null),
    ]);
    expect(r.byState).toEqual({ 'Submitted and indexed': 3, 'URL is unknown to Google': 1 });
    expect(r.crawledAfterOutage).toEqual(['https://www.imsoft.io/es', 'https://www.imsoft.io/es/about']);
    expect(r.notCrawledAfterOutage).toHaveLength(2);
  });
});

describe('renderReport', () => {
  it('produces a readable report with all the sections', () => {
    const rows = [q('imsoft', 86, 12), q('paginas web guadalajara', 40, 2)];
    const { byClass, commercial } = summarizeQueries(rows);
    const report = renderReport({
      property: 'sc-domain:imsoft.io',
      range: { start: '2026-08-12', end: '2026-09-08' },
      totals: { clicks: 14, impressions: 126, ctr: 0.111, position: 28.3 },
      byClass,
      commercial,
      pages: [{ page: 'https://www.imsoft.io/es', clicks: 10, impressions: 90, position: 12 }],
      impact: outageImpact([]),
      coverage: coverageSummary([]),
      inspections: [],
    });
    for (const section of ['RENDIMIENTO', 'CONSULTAS', 'COMERCIALES', 'TOP páginas', 'CAÍDA', 'INDEXACIÓN']) {
      expect(report).toContain(section);
    }
    expect(report).toContain('paginas web guadalajara');
    expect(report).toContain('/es');
    expect(report).toContain('11.1%');
  });

  it('shows the canonical Google chose when it differs from the declared one', () => {
    const report = renderReport({
      property: 'sc-domain:imsoft.io',
      range: { start: '2026-08-12', end: '2026-09-08' },
      totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      byClass: summarizeQueries([]).byClass,
      commercial: [],
      pages: [],
      impact: outageImpact([]),
      coverage: coverageSummary([]),
      inspections: [
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
    expect(report).toContain('Google eligió: https://imsoft.io/es/contact');
  });
});
