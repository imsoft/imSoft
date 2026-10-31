import { describe, it, expect } from 'vitest';
import { linkNotes, pendingBalance, suggestedLabel, suggestedMilestone, urlFromNotes, validateLinkAmount } from './payment-links';

const c = (amount: number) => ({ amount, status: 'completed' as const });
const p = (amount: number) => ({ amount, status: 'pending' as const });
const x = (amount: number) => ({ amount, status: 'cancelled' as const });

describe('milestone billing', () => {
  it('the balance subtracts what was collected and already linked, not what was cancelled', () => {
    expect(pendingBalance(18000, [])).toBe(18000);
    expect(pendingBalance(18000, [c(9000)])).toBe(9000);
    expect(pendingBalance(18000, [c(9000), p(4500), x(9000)])).toBe(4500);
    expect(pendingBalance(18000, [c(20000)])).toBe(0);
  });

  it('suggests half as the deposit and then the rest', () => {
    expect(suggestedMilestone(18000, [])).toBe(9000);
    expect(suggestedMilestone(18000, [c(9000)])).toBe(9000);
    expect(suggestedMilestone(18000, [c(9000), p(4500)])).toBe(4500);
    expect(suggestedLabel([], 'es')).toBe('Anticipo (50%)');
    expect(suggestedLabel([c(1)], 'es')).toBe('Liquidación');
    expect(suggestedLabel([], 'en')).toBe('Deposit (50%)');
  });

  it('rejects invalid amounts or amounts above the balance', () => {
    expect(validateLinkAmount(0, 18000, [])).toMatch(/mayor a cero/);
    expect(validateLinkAmount(9001, 18000, [c(9000)])).toMatch(/supera/);
    expect(validateLinkAmount(9000, 18000, [c(9000)])).toBeNull();
  });

  it('stores and recovers the link URL in the payment notes', () => {
    const notes = linkNotes(' Anticipo (50%) ', 'https://buy.stripe.com/abc123');
    expect(notes).toBe('Anticipo (50%) · Enlace Stripe: https://buy.stripe.com/abc123');
    expect(urlFromNotes(notes)).toBe('https://buy.stripe.com/abc123');
    expect(urlFromNotes('Transferencia BBVA')).toBeNull();
    expect(urlFromNotes(null)).toBeNull();
  });
});
