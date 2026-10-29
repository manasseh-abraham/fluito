export const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
export const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
export const GOOGLE_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);

/** Public OAuth client IDs from GCP project `fluito` (manasshe2@gmail.com). Not secrets. */
export const FLUITO_GOOGLE_WEB_CLIENT_ID =
  '619885353175-l00am55pa3j7rc1a5h3pcmqhhhldh3um.apps.googleusercontent.com';
export const FLUITO_GOOGLE_ANDROID_DEV_CLIENT_ID =
  '619885353175-gokhfp6tmp623b2r0s796dhnq5l6jk1f.apps.googleusercontent.com';
export const FLUITO_GOOGLE_ANDROID_PROD_CLIENT_ID =
  '619885353175-4u1nq6ibb3iee4b70mllfh343o71qmnj.apps.googleusercontent.com';

export const DEFAULT_GOOGLE_CLIENT_IDS = [
  FLUITO_GOOGLE_WEB_CLIENT_ID,
  FLUITO_GOOGLE_ANDROID_DEV_CLIENT_ID,
  FLUITO_GOOGLE_ANDROID_PROD_CLIENT_ID,
];

export interface GoogleIdTokenPayload {
  iss?: string;
  aud?: string;
  azp?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  exp?: string | number;
  iat?: string | number;
  error?: string;
  error_description?: string;
}

export class GoogleTokenError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = 'GoogleTokenError';
    this.status = status;
  }
}

export function parseGoogleClientIds(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

/** Allowed Google OAuth client IDs (Web + Android) from env. */
export function configuredGoogleClientIds(
  env: Record<string, string | undefined> = process.env
): string[] {
  const ids = new Set<string>([
    ...parseGoogleClientIds(env.GOOGLE_CLIENT_IDS),
    ...parseGoogleClientIds(env.GOOGLE_WEB_CLIENT_ID),
    ...parseGoogleClientIds(env.GOOGLE_ANDROID_CLIENT_ID),
    ...parseGoogleClientIds(env.GOOGLE_ANDROID_DEV_CLIENT_ID),
    ...parseGoogleClientIds(env.GOOGLE_ANDROID_PROD_CLIENT_ID),
  ]);
  if (ids.size === 0) {
    return [...DEFAULT_GOOGLE_CLIENT_IDS];
  }
  return [...ids];
}

export function namesFromGoogleProfile(payload: GoogleIdTokenPayload): {
  firstName: string;
  lastName: string;
} {
  const given = (payload.given_name ?? '').trim();
  const family = (payload.family_name ?? '').trim();
  if (given || family) {
    return { firstName: given, lastName: family };
  }
  const name = (payload.name ?? '').trim();
  if (!name) {
    return { firstName: '', lastName: '' };
  }
  const space = name.indexOf(' ');
  if (space === -1) {
    return { firstName: name, lastName: '' };
  }
  return {
    firstName: name.slice(0, space),
    lastName: name.slice(space + 1).trim(),
  };
}

function isEmailVerified(value: GoogleIdTokenPayload['email_verified']): boolean {
  return value === true || value === 'true';
}

function parseExpirySeconds(exp: GoogleIdTokenPayload['exp']): number | null {
  if (exp === undefined || exp === null || exp === '') return null;
  const n = typeof exp === 'number' ? exp : Number(exp);
  return Number.isFinite(n) ? n : null;
}

export function assertValidGooglePayload(
  payload: GoogleIdTokenPayload,
  allowedClientIds: string[],
  nowSeconds: number = Math.floor(Date.now() / 1000)
): asserts payload is GoogleIdTokenPayload & { sub: string; email: string; aud: string } {
  if (payload.error) {
    throw new GoogleTokenError(payload.error_description || payload.error || 'Invalid Google ID token');
  }

  if (allowedClientIds.length === 0) {
    throw new GoogleTokenError('Google Sign-In is not configured', 503);
  }

  if (!payload.iss || !GOOGLE_ISSUERS.has(payload.iss)) {
    throw new GoogleTokenError('Invalid Google ID token issuer');
  }

  if (!payload.aud || !allowedClientIds.includes(payload.aud)) {
    throw new GoogleTokenError('Google ID token audience is not an allowed client');
  }

  if (!payload.sub) {
    throw new GoogleTokenError('Google ID token is missing subject');
  }

  if (!payload.email) {
    throw new GoogleTokenError('Google account has no email');
  }

  if (!isEmailVerified(payload.email_verified)) {
    throw new GoogleTokenError('Google email is not verified');
  }

  const exp = parseExpirySeconds(payload.exp);
  if (exp !== null && exp <= nowSeconds) {
    throw new GoogleTokenError('Google ID token has expired');
  }
}

export interface VerifyGoogleIdTokenOptions {
  allowedClientIds: string[];
  /** Injected for tests. Defaults to global fetch (tokeninfo + certs). */
  fetchImpl?: typeof fetch;
  nowSeconds?: number;
}

/**
 * Verify a Google ID token via tokeninfo (Google checks the cert signature)
 * and validate iss / aud / email / exp locally against configured client IDs.
 */
export async function verifyGoogleIdToken(
  idToken: string,
  options: VerifyGoogleIdTokenOptions
): Promise<GoogleIdTokenPayload & { sub: string; email: string; aud: string }> {
  const token = idToken.trim();
  if (!token) {
    throw new GoogleTokenError('id_token is required', 400);
  }

  if (options.allowedClientIds.length === 0) {
    throw new GoogleTokenError('Google Sign-In is not configured', 503);
  }

  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const url = `${GOOGLE_TOKENINFO_URL}?id_token=${encodeURIComponent(token)}`;

  let response: Response;
  try {
    response = await fetchImpl(url, { method: 'GET' });
  } catch {
    throw new GoogleTokenError('Could not reach Google token verification', 502);
  }

  let payload: GoogleIdTokenPayload;
  try {
    payload = (await response.json()) as GoogleIdTokenPayload;
  } catch {
    throw new GoogleTokenError('Invalid response from Google token verification', 502);
  }

  if (!response.ok) {
    throw new GoogleTokenError(payload.error_description || payload.error || 'Invalid Google ID token');
  }

  assertValidGooglePayload(payload, options.allowedClientIds, options.nowSeconds);
  return payload;
}
