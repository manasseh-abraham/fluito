import { describe, expect, test } from 'bun:test';
import { ageFromDob, isAtLeast18, isValidIsoDate, parseIsoDate, UNDERAGE_MESSAGE } from './age';

describe('parseIsoDate', () => {
  test('rejects impossible calendar days', () => {
    expect(parseIsoDate('2020-02-31')).toBeNull();
    expect(isValidIsoDate('2020-02-31')).toBe(false);
    expect(isValidIsoDate('2000-01-01')).toBe(true);
  });
});

describe('ageFromDob / isAtLeast18', () => {
  const now = new Date(2026, 10, 3); // 3 Nov 2026

  test('computes whole years from a local calendar date', () => {
    expect(ageFromDob('2008-11-03', now)).toBe(18);
    expect(ageFromDob('2008-11-04', now)).toBe(17);
    expect(ageFromDob(null, now)).toBeNull();
  });

  test('enforces 18+ on the birthday boundary', () => {
    expect(isAtLeast18('2008-11-03', now)).toBe(true);
    expect(isAtLeast18('2008-11-04', now)).toBe(false);
    expect(isAtLeast18('2010-01-01', now)).toBe(false);
    expect(UNDERAGE_MESSAGE).toContain('18');
  });
});
