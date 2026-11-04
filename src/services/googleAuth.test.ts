import { Database } from 'bun:sqlite';
import { describe, expect, test } from 'bun:test';
import { applySchema } from '../db/database';
import { hashPassword, verifyToken } from '../utils/auth';
import { GOOGLE_TOKENINFO_URL } from '../utils/google';
import { authenticateWithGoogle } from './googleAuth';

const WEB_CLIENT = '123-web.apps.googleusercontent.com';

function tokeninfo(overrides: Record<string, unknown> = {}) {
  return {
    iss: 'https://accounts.google.com',
    aud: WEB_CLIENT,
    sub: 'google-sub-99',
    email: 'new.member@example.com',
    email_verified: true,
    given_name: 'New',
    family_name: 'Member',
    exp: String(Math.floor(Date.now() / 1000) + 3600),
    ...overrides,
  };
}

function mockTokeninfo(body: unknown, status = 200): typeof fetch {
  return async (input) => {
    expect(String(input).startsWith(GOOGLE_TOKENINFO_URL)).toBe(true);
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

function memoryDb() {
  const database = new Database(':memory:');
  applySchema(database);
  return database;
}

describe('authenticateWithGoogle', () => {
  test('creates a user from Google profile without inventing DOB or gender', async () => {
    const database = memoryDb();
    const result = await authenticateWithGoogle({
      idToken: 'id-token',
      db: database,
      allowedClientIds: [WEB_CLIENT],
      fetchImpl: mockTokeninfo(tokeninfo()),
    });

    expect(result.user.email).toBe('new.member@example.com');
    expect(verifyToken(result.token)?.userId).toBe(result.user.id);

    const user = database
      .prepare('SELECT email, password_hash, auth_provider, google_sub FROM users WHERE id = ?')
      .get(result.user.id) as {
      email: string;
      password_hash: string | null;
      auth_provider: string;
      google_sub: string;
    };
    expect(user.password_hash).toBeNull();
    expect(user.auth_provider).toBe('google');
    expect(user.google_sub).toBe('google-sub-99');

    const profile = database
      .prepare('SELECT first_name, last_name, date_of_birth, gender FROM profiles WHERE user_id = ?')
      .get(result.user.id) as {
      first_name: string;
      last_name: string;
      date_of_birth: string | null;
      gender: string | null;
    };
    expect(profile.first_name).toBe('New');
    expect(profile.last_name).toBe('Member');
    expect(profile.date_of_birth).toBeNull();
    expect(profile.gender).toBeNull();
  });

  test('creates a profile with empty names when Google omits them', async () => {
    const database = memoryDb();
    const result = await authenticateWithGoogle({
      idToken: 'id-token',
      db: database,
      allowedClientIds: [WEB_CLIENT],
      fetchImpl: mockTokeninfo(
        tokeninfo({ given_name: undefined, family_name: undefined, name: undefined })
      ),
    });
    const profile = database
      .prepare('SELECT first_name, last_name FROM profiles WHERE user_id = ?')
      .get(result.user.id) as { first_name: string; last_name: string };
    expect(profile.first_name).toBe('');
    expect(profile.last_name).toBe('');
  });

  test('finds an existing email user and links google_sub (sign-in)', async () => {
    const database = memoryDb();
    const passwordHash = await hashPassword('password123');
    const inserted = database
      .prepare("INSERT INTO users (email, password_hash, auth_provider) VALUES (?, ?, 'password')")
      .run('new.member@example.com', passwordHash);
    const userId = Number(inserted.lastInsertRowid);
    database
      .prepare(
        `INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, gender)
         VALUES (?, 'Old', 'User', '1990-01-01', 'female')`
      )
      .run(userId);

    const result = await authenticateWithGoogle({
      idToken: 'id-token',
      db: database,
      allowedClientIds: [WEB_CLIENT],
      fetchImpl: mockTokeninfo(tokeninfo()),
    });

    expect(result.user.id).toBe(userId);
    const row = database
      .prepare('SELECT auth_provider, google_sub FROM users WHERE id = ?')
      .get(userId) as { auth_provider: string; google_sub: string };
    expect(row.google_sub).toBe('google-sub-99');
    expect(row.auth_provider).toBe('both');
    expect(verifyToken(result.token)?.userId).toBe(userId);
  });

  test('is idempotent: second Google login returns the same user', async () => {
    const database = memoryDb();
    const first = await authenticateWithGoogle({
      idToken: 'id-token',
      db: database,
      allowedClientIds: [WEB_CLIENT],
      fetchImpl: mockTokeninfo(tokeninfo()),
    });
    const second = await authenticateWithGoogle({
      idToken: 'id-token',
      db: database,
      allowedClientIds: [WEB_CLIENT],
      fetchImpl: mockTokeninfo(tokeninfo()),
    });
    expect(second.user.id).toBe(first.user.id);
    const count = database.prepare('SELECT COUNT(*) as n FROM users').get() as { n: number };
    expect(count.n).toBe(1);
  });
});
