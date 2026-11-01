import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(__dirname, '..', '..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/**
 * These tests make sure that contacting imSoft never again requires navigating.
 *
 * The site came from a SaaS template: the three highlighted header buttons
 * pointed to /signup, meaning a prospect looking for an agency was asked to sign up
 * for the client panel before writing. And the phone and email were only
 * clickable on /contact.
 */

describe('the header pushes to contact, not to sign up', () => {
  const header = read('src/components/blocks/hero-section.tsx');
  const landing = read('src/components/landing/hero-section-landing.tsx');
  const headerButtons = header.slice(header.indexOf('const menuItems'));
  const landingButtons = landing.slice(landing.indexOf('const menuItems'));

  it('the only header button goes to WhatsApp with the page context', () => {
    expect(headerButtons).toMatch(/<Button asChild size="sm">\s*<WhatsAppCtaLink lang=\{lang\}>/);
    expect(landingButtons).toMatch(/<Button asChild size="sm">\s*<WhatsAppCtaLink lang=\{lang\}>/);
  });

  it('sign-in and sign-up no longer compete with the CTA in the header', () => {
    for (const b of [headerButtons, landingButtons]) {
      expect(b).not.toContain('/login`}');
      expect(b).not.toContain('/signup`}');
    }
  });

  it('client sign-in is still available in the footer', () => {
    expect(read('src/components/blocks/footer-section.tsx')).toContain('href={`/${lang}/login`}');
  });

  it('contact clicks are tracked in analytics from the layout', () => {
    expect(read('src/app/[lang]/layout.tsx')).toContain('<CtaTracker />');
    expect(read('src/app/[lang]/contact/contact-form.tsx')).toContain('new CustomEvent(LEAD_EVENT)');
  });
});

describe('the footer allows contacting from any page', () => {
  const footer = read('src/components/blocks/footer-section.tsx');

  it('the phone is a tel: link in E.164', () => {
    expect(footer).toContain('href={`tel:+52');
  });

  it('the email is a mailto: link', () => {
    expect(footer).toContain('href={`mailto:');
  });

  it('there is a WhatsApp link with a prefilled message', () => {
    expect(footer).toContain('wa.me/523325365558');
    expect(footer).toContain('?text=');
  });
});

describe('the contact form does not ask for too much', () => {
  const form = read('src/app/[lang]/contact/contact-form.tsx');
  const api = read('src/app/api/contact/route.ts');

  it('the last name is optional in the form', () => {
    expect(form).toContain('lastName: z.string().optional()');
  });

  it('and the API does not require it either', () => {
    // If the API still required it, the submission would fail with 400 despite the form.
    const guard = api.match(/if \(!firstName[^)]*\)/)?.[0] ?? '';
    expect(guard).not.toContain('lastName');
    expect(guard).toContain('firstName');
    expect(guard).toContain('email');
    expect(guard).toContain('message');
  });

  it('the email to the admin does not leave an "undefined" when the last name is missing', () => {
    expect(api).not.toMatch(/\$\{firstName\} \$\{lastName\}/);
    expect(api).toContain("[firstName, lastName].filter(Boolean).join(' ')");
  });
});
