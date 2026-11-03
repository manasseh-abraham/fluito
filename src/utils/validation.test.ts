import { describe, expect, test } from 'bun:test';
import { UNDERAGE_MESSAGE } from './age';
import { profileUpdateSchema, registerSchema, reportSchema } from './validation';

const adult = {
  email: 'user@example.com',
  password: 'password123',
  first_name: 'John',
  last_name: 'Doe',
  date_of_birth: '1990-01-01',
  gender: 'male' as const,
};

describe('registerSchema 18+', () => {
  test('accepts an adult DOB', () => {
    expect(registerSchema.parse(adult).date_of_birth).toBe('1990-01-01');
  });

  test('rejects under-18 registration', () => {
    const result = registerSchema.safeParse({ ...adult, date_of_birth: '2015-06-01' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((err) => err.message === UNDERAGE_MESSAGE)).toBe(true);
    }
  });
});

describe('profileUpdateSchema 18+', () => {
  test('rejects underage Google onboarding completion', () => {
    const result = profileUpdateSchema.safeParse({
      date_of_birth: '2012-01-01',
      gender: 'female',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((err) => err.message === UNDERAGE_MESSAGE)).toBe(true);
    }
  });

  test('accepts adult DOB + gender', () => {
    expect(
      profileUpdateSchema.parse({ date_of_birth: '1998-04-12', gender: 'female' }).gender
    ).toBe('female');
  });
});

describe('reportSchema', () => {
  test('requires a target and a known reason', () => {
    expect(reportSchema.safeParse({ reason: 'spam' }).success).toBe(false);
    expect(
      reportSchema.parse({ reported_user_id: 2, reason: 'harassment', details: 'mean messages' })
        .reported_user_id
    ).toBe(2);
  });
});
