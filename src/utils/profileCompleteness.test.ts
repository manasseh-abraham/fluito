import { describe, expect, test } from 'bun:test';
import { profileCompleteness, withProfileCompleteness } from './profileCompleteness';

describe('profileCompleteness', () => {
  test('Google-created empty DOB/gender profiles are incomplete', () => {
    const result = profileCompleteness({
      first_name: 'New',
      last_name: 'Member',
      date_of_birth: null,
      gender: null,
    });
    expect(result.profile_complete).toBe(false);
    expect(result.missing_required_fields).toEqual(['date_of_birth', 'gender']);
  });

  test('empty names are also required', () => {
    const result = profileCompleteness({
      first_name: '  ',
      last_name: '',
      date_of_birth: '1990-01-01',
      gender: 'female',
    });
    expect(result.profile_complete).toBe(false);
    expect(result.missing_required_fields).toContain('first_name');
    expect(result.missing_required_fields).toContain('last_name');
  });

  test('underage DOB keeps the profile incomplete', () => {
    const result = withProfileCompleteness({
      first_name: 'Kid',
      last_name: 'User',
      date_of_birth: '2015-01-01',
      gender: 'male',
    });
    expect(result.profile_complete).toBe(false);
    expect(result.missing_required_fields).toEqual(['date_of_birth']);
    expect(result.age).toBeLessThan(18);
  });

  test('adult complete profile is ready for Discover', () => {
    const result = withProfileCompleteness({
      first_name: 'Jane',
      last_name: 'Smith',
      date_of_birth: '1992-05-15',
      gender: 'female',
    });
    expect(result.profile_complete).toBe(true);
    expect(result.missing_required_fields).toEqual([]);
    expect(result.age).toBeGreaterThanOrEqual(18);
  });
});
