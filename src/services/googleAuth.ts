import type { Database } from 'bun:sqlite';
import { generateToken } from '../utils/auth';
import {
  GoogleTokenError,
  namesFromGoogleProfile,
  verifyGoogleIdToken,
  type VerifyGoogleIdTokenOptions,
} from '../utils/google';

export interface GoogleAuthUser {
  id: number;
  email: string;
}

export interface GoogleAuthResult {
  token: string;
  user: GoogleAuthUser;
}

type UserRow = {
  id: number;
  email: string;
  password_hash: string | null;
  auth_provider?: string | null;
  google_sub?: string | null;
};

/**
 * Verify a Google ID token, then find or create the Fluito user by email.
 * Sign-in and sign-up share this path. Issues the same JWT as email login.
 */
export async function authenticateWithGoogle(options: {
  idToken: string;
  db: Database;
  allowedClientIds: string[];
  clientId?: string;
  fetchImpl?: VerifyGoogleIdTokenOptions['fetchImpl'];
  nowSeconds?: number;
}): Promise<GoogleAuthResult> {
  if (options.clientId && !options.allowedClientIds.includes(options.clientId)) {
    throw new GoogleTokenError('client_id is not an allowed Google OAuth client', 400);
  }

  const payload = await verifyGoogleIdToken(options.idToken, {
    allowedClientIds: options.allowedClientIds,
    fetchImpl: options.fetchImpl,
    nowSeconds: options.nowSeconds,
  });

  if (options.clientId && payload.aud !== options.clientId && payload.azp !== options.clientId) {
    throw new GoogleTokenError('Google ID token does not match the provided client_id');
  }

  const email = payload.email.toLowerCase();
  const { firstName, lastName } = namesFromGoogleProfile(payload);

  const existing =
    (options.db.prepare('SELECT id, email, password_hash, auth_provider, google_sub FROM users WHERE email = ?').get(email) as
      | UserRow
      | undefined) ??
    (payload.sub
      ? (options.db.prepare(
          'SELECT id, email, password_hash, auth_provider, google_sub FROM users WHERE google_sub = ?'
        ).get(payload.sub) as UserRow | undefined)
      : undefined);

  if (existing) {
    const nextProvider = existing.password_hash ? 'both' : 'google';
    options.db
      .prepare(
        `
        UPDATE users
        SET google_sub = COALESCE(google_sub, ?),
            auth_provider = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      )
      .run(payload.sub, nextProvider, existing.id);

    const token = generateToken(existing.id);
    return {
      token,
      user: { id: existing.id, email: existing.email },
    };
  }

  const insertUser = options.db.prepare(
    `
    INSERT INTO users (email, password_hash, auth_provider, google_sub)
    VALUES (?, NULL, 'google', ?)
  `
  );
  const result = insertUser.run(email, payload.sub);
  const userId = Number(result.lastInsertRowid);

  options.db
    .prepare(
      `
      INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, gender)
      VALUES (?, ?, ?, NULL, NULL)
    `
    )
    .run(userId, firstName, lastName);

  const token = generateToken(userId);
  return {
    token,
    user: { id: userId, email },
  };
}
