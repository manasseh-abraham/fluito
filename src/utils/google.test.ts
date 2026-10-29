import { describe, expect, test } from 'bun:test';
import {
  DEFAULT_GOOGLE_CLIENT_IDS,
  FLUITO_GOOGLE_ANDROID_DEV_CLIENT_ID,
  FLUITO_GOOGLE_ANDROID_PROD_CLIENT_ID,
  FLUITO_GOOGLE_WEB_CLIENT_ID,
  GOOGLE_TOKENINFO_URL,
  GoogleTokenError,
  assertValidGooglePayload,
  configuredGoogleClientIds,
  namesFromGoogleProfile,
  parseGoogleClientIds,
  verifyGoogleIdToken,
} from './google';

const WEB_CLIENT = '123-web.apps.googleusercontent.com';
const ANDROID_CLIENT = '123-android.apps.googleusercontent.com';

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    iss: 'https://accounts.google.com',
    aud: WEB_CLIENT,
    azp: ANDROID_CLIENT,
    sub: 'google-sub-1',
    email: 'member@example.com',
    email_verified: 'true',
    given_name: 'Ada',
    family_name: 'Lovelace',
    exp: String(Math.floor(Date.now() / 1000) + 3600),
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('parseGoogleClientIds / configuredGoogleClientIds', () => {
  test('splits comma-separated IDs and drops blanks', () => {
    expect(parseGoogleClientIds(` ${WEB_CLIENT}, ${ANDROID_CLIENT}, `)).toEqual([
      WEB_CLIENT,
      ANDROID_CLIENT,
    ]);
    expect(parseGoogleClientIds('')).toEqual([]);
    expect(parseGoogleClientIds(undefined)).toEqual([]);
  });

  test('merges GOOGLE_CLIENT_IDS with named WEB/ANDROID client IDs', () => {
    const ids = configuredGoogleClientIds({
      GOOGLE_CLIENT_IDS: `${WEB_CLIENT},${ANDROID_CLIENT}`,
      GOOGLE_WEB_CLIENT_ID: WEB_CLIENT,
      GOOGLE_ANDROID_CLIENT_ID: 'extra-android.apps.googleusercontent.com',
    });
    expect(ids).toEqual([
      WEB_CLIENT,
      ANDROID_CLIENT,
      'extra-android.apps.googleusercontent.com',
    ]);
  });

  test('empty env falls back to the three Fluito GCP client IDs', () => {
    expect(configuredGoogleClientIds({})).toEqual(DEFAULT_GOOGLE_CLIENT_IDS);
    expect(DEFAULT_GOOGLE_CLIENT_IDS).toEqual([
      FLUITO_GOOGLE_WEB_CLIENT_ID,
      FLUITO_GOOGLE_ANDROID_DEV_CLIENT_ID,
      FLUITO_GOOGLE_ANDROID_PROD_CLIENT_ID,
    ]);
  });

  test('accepts all three Fluito IDs from a comma-separated GOOGLE_CLIENT_IDS', () => {
    const joined = DEFAULT_GOOGLE_CLIENT_IDS.join(',');
    expect(configuredGoogleClientIds({ GOOGLE_CLIENT_IDS: joined })).toEqual(
      DEFAULT_GOOGLE_CLIENT_IDS
    );
  });
});

describe('namesFromGoogleProfile', () => {
  test('uses given/family name and does not invent DOB/gender', () => {
    expect(namesFromGoogleProfile({ given_name: 'Ada', family_name: 'Lovelace' })).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
    expect(namesFromGoogleProfile({ name: 'Ada Lovelace' })).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
    expect(namesFromGoogleProfile({})).toEqual({ firstName: '', lastName: '' });
  });
});

describe('assertValidGooglePayload', () => {
  test('accepts a tokeninfo payload for an allowed Web client', () => {
    expect(() => assertValidGooglePayload(validPayload(), [WEB_CLIENT, ANDROID_CLIENT])).not.toThrow();
  });

  test('rejects wrong audience, unverified email, expired token', () => {
    expect(() =>
      assertValidGooglePayload(validPayload({ aud: 'other.apps.googleusercontent.com' }), [WEB_CLIENT])
    ).toThrow(GoogleTokenError);

    expect(() =>
      assertValidGooglePayload(validPayload({ email_verified: 'false' }), [WEB_CLIENT])
    ).toThrow('Google email is not verified');

    expect(() =>
      assertValidGooglePayload(validPayload({ exp: 10 }), [WEB_CLIENT], 20)
    ).toThrow('Google ID token has expired');

    expect(() =>
      assertValidGooglePayload(validPayload({ email: undefined }), [WEB_CLIENT])
    ).toThrow('Google account has no email');
  });
});

describe('verifyGoogleIdToken (mocked Google tokeninfo)', () => {
  test('GETs tokeninfo and returns the payload when aud is allowed', async () => {
    const payload = validPayload();
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);
      expect(url.startsWith(GOOGLE_TOKENINFO_URL)).toBe(true);
      expect(url).toContain('id_token=fake-id-token');
      return jsonResponse(payload);
    };

    const verified = await verifyGoogleIdToken('fake-id-token', {
      allowedClientIds: [WEB_CLIENT],
      fetchImpl,
    });
    expect(verified.email).toBe('member@example.com');
    expect(verified.sub).toBe('google-sub-1');
    expect(verified.aud).toBe(WEB_CLIENT);
  });

  test('rejects Google error bodies and network failures', async () => {
    await expect(
      verifyGoogleIdToken('bad', {
        allowedClientIds: [WEB_CLIENT],
        fetchImpl: async () =>
          jsonResponse({ error: 'invalid_token', error_description: 'Invalid Value' }, 400),
      })
    ).rejects.toMatchObject({ name: 'GoogleTokenError', message: 'Invalid Value' });

    await expect(
      verifyGoogleIdToken('bad', {
        allowedClientIds: [WEB_CLIENT],
        fetchImpl: async () => {
          throw new Error('offline');
        },
      })
    ).rejects.toMatchObject({ status: 502 });
  });

  test('refuses to verify when no client IDs are configured', async () => {
    await expect(
      verifyGoogleIdToken('tok', {
        allowedClientIds: [],
        fetchImpl: async () => jsonResponse(validPayload()),
      })
    ).rejects.toMatchObject({ status: 503 });
  });
});
