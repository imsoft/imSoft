import { describe, it, expect } from 'vitest';
import { businessSchema, websiteSchema } from './structured-data';
import { BUSINESS } from '@/config/business';

const SITE = 'https://www.imsoft.io';

/**
 * These tests exist mainly to stop a made-up fact from slipping in again.
 * The previous schema declared coordinates of downtown Guadalajara and a 50 km
 * service radius nobody confirmed; if that doesn't match Google Business Profile,
 * it takes credibility away from the listing instead of adding it.
 */
describe('business schema', () => {
  const org = businessSchema('es');

  it('does not declare data nobody confirmed', () => {
    for (const schema of [org] as Record<string, unknown>[]) {
      expect(schema).not.toHaveProperty('geo');
      expect(schema).not.toHaveProperty('serviceArea');
      expect(schema).not.toHaveProperty('priceRange');
      expect(schema).not.toHaveProperty('aggregateRating');
    }
  });

  it('does not declare a visitable address: there is no premises that receives clients', () => {
    expect(org).not.toHaveProperty('geo');
    expect(org).not.toHaveProperty('hasMap');
    expect(org.address).not.toHaveProperty('streetAddress');
  });

  it('publishes the exact Google Business Profile hours, Sunday included', () => {
    const [weekdays, sunday] = org.openingHoursSpecification;
    expect(weekdays.dayOfWeek).toHaveLength(6);
    expect(weekdays.dayOfWeek).toContain('Saturday');
    expect(weekdays.opens).toBe('09:00');
    expect(weekdays.closes).toBe('18:00');

    // Sunday closes earlier; declaring it the same as the rest would contradict the listing.
    expect(sunday.dayOfWeek).toEqual(['Sunday']);
    expect(sunday.closes).toBe('13:00');
  });

  it('all seven days are covered, without repeats', () => {
    const days = org.openingHoursSpecification.flatMap((s) => s.dayOfWeek);
    expect(new Set(days).size).toBe(7);
    expect(days).toHaveLength(7);
  });

  it('the phone is in E.164', () => {
    expect(org.telephone).toBe('+523325365558');
    expect(org.telephone).toMatch(/^\+[1-9]\d{7,14}$/);
  });

  it('sameAs only carries public URLs', () => {
    expect(org.sameAs.length).toBeGreaterThan(0);
    for (const url of org.sameAs) {
      expect(url).toMatch(/^https:\/\//);
      // The LinkedIn URL that was in the DB was the admin panel.
      expect(url).not.toContain('/admin');
      expect(url).not.toContain('/dashboard');
    }
  });

  it('is a single ProfessionalService node, not two linked companies', () => {
    // ProfessionalService already inherits from Organization. A second node joined by
    // parentOrganization would declare that imSoft has a parent company called imSoft.
    expect(org['@type']).toBe('ProfessionalService');
    expect(org['@id']).toBe(`${SITE}/#organization`);
    expect(org).not.toHaveProperty('parentOrganization');
  });

  it('the @type is a string, not an array', () => {
    // validator.schema.org drops the whole node, without an error, when @type is
    // an array of types. Verified in production.
    expect(Array.isArray(org['@type'])).toBe(false);
  });

  it('does not use availableLanguage outside ContactPoint', () => {
    // The schema.org validator flags it as UNKNOWN_FIELD on LocalBusiness.
    expect(org).not.toHaveProperty('availableLanguage');
    expect(org.contactPoint[0].availableLanguage).toEqual(['Spanish', 'English']);
    expect(org.contactPoint.map((c: { contactType: string }) => c.contactType)).toEqual(['customer service', 'sales', 'billing support', 'technical support']);
    expect(org.contactPoint[3].email).toBe('soporte@imsoft.io');
  });

  it('the @id does not collide with the URL of a real page', () => {
    // LocalBusiness used to use `@id: https://www.imsoft.io/es`, which is the home page.
    for (const schema of [org, websiteSchema('es')]) {
      expect(schema['@id']).toContain('#');
    }
  });

  it('the address declares Guadalajara, Jalisco, MX', () => {
    expect(org.address).toMatchObject({
      '@type': 'PostalAddress',
      addressLocality: 'Guadalajara',
      addressRegion: 'Jalisco',
      addressCountry: 'MX',
    });
  });

  it('areaServed matches the Google Business Profile areas', () => {
    // If the listing and the schema declare different areas, Google gets two versions
    // of the business's reach.
    const names = org.areaServed.map((a) => a.name);
    for (const area of [
      'Guadalajara',
      'Zapopan',
      'Tlaquepaque',
      'Tonalá',
      'Tlajomulco de Zúñiga',
      'Mexico City',
      'Monterrey',
    ]) {
      expect(names).toContain(area);
    }
    expect(names).toContain('Jalisco');
  });

  it('the whole block serializes to valid JSON', () => {
    for (const schema of [org, websiteSchema('en')]) {
      expect(() => JSON.parse(JSON.stringify(schema))).not.toThrow();
      expect(schema['@context']).toBe('https://schema.org');
    }
  });

  it('the email matches the configured one', () => {
    expect(org.email).toBe(BUSINESS.email);
  });
});

describe('references between blocks', () => {
  it('WebSite does not reference the business by @id', () => {
    // See the comment in structured-data.ts: a `{'@id': ...}` reference from another
    // block makes validator.schema.org silently drop the business node.
    expect(websiteSchema('es')).not.toHaveProperty('publisher');
  });
});
