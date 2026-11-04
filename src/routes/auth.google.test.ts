import { afterEach, describe, expect, test } from 'bun:test';
import { authRoutes } from './auth';

const saved = {
  GOOGLE_CLIENT_IDS: process.env.GOOGLE_CLIENT_IDS,
  GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
};

afterEach(() => {
  if (saved.GOOGLE_CLIENT_IDS === undefined) delete process.env.GOOGLE_CLIENT_IDS;
  else process.env.GOOGLE_CLIENT_IDS = saved.GOOGLE_CLIENT_IDS;
  if (saved.GOOGLE_WEB_CLIENT_ID === undefined) delete process.env.GOOGLE_WEB_CLIENT_ID;
  else process.env.GOOGLE_WEB_CLIENT_ID = saved.GOOGLE_WEB_CLIENT_ID;
  if (saved.GOOGLE_ANDROID_CLIENT_ID === undefined) delete process.env.GOOGLE_ANDROID_CLIENT_ID;
  else process.env.GOOGLE_ANDROID_CLIENT_ID = saved.GOOGLE_ANDROID_CLIENT_ID;
});

describe('POST /google', () => {
  test('returns 400 when id_token is missing', async () => {
    process.env.GOOGLE_CLIENT_IDS = 'web.apps.googleusercontent.com';
    const response = await authRoutes.request('/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(response.status).toBe(400);
  });
});
