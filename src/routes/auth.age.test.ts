import { describe, expect, test } from 'bun:test';
import { UNDERAGE_MESSAGE } from '../utils/age';
import { authRoutes } from './auth';

describe('POST /register age gate', () => {
  test('returns 400 with a clear 18+ error', async () => {
    const response = await authRoutes.request('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'kid@example.com',
        password: 'password123',
        first_name: 'Kid',
        last_name: 'User',
        date_of_birth: '2015-01-01',
        gender: 'male',
      }),
    });
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe(UNDERAGE_MESSAGE);
  });
});
