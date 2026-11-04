import { Database } from 'bun:sqlite';
import { describe, expect, test } from 'bun:test';
import { applySchema } from './database';
import { DEMO_SEED_EMAILS, SEED_PASSWORD, parseSeedArgs, seedDatabase, seedUsers } from './seed';

function memoryDb() {
  const database = new Database(':memory:');
  applySchema(database);
  return database;
}

describe('parseSeedArgs', () => {
  test('detects --force', () => {
    expect(parseSeedArgs(['bun', 'src/db/seed.ts']).force).toBe(false);
    expect(parseSeedArgs(['bun', 'src/db/seed.ts', '--force']).force).toBe(true);
  });
});

describe('seedDatabase', () => {
  test('creates rich @example.com profiles, photos, matches, and messages', async () => {
    const database = memoryDb();
    await seedDatabase({ database });

    const users = database.prepare('SELECT email FROM users ORDER BY email').all() as { email: string }[];
    expect(users.map((u) => u.email)).toEqual([...DEMO_SEED_EMAILS].sort());

    const jane = database
      .prepare(
        `SELECT p.first_name, p.bio, p.profile_picture_url, p.location_city, p.gender, p.date_of_birth
         FROM profiles p JOIN users u ON u.id = p.user_id WHERE u.email = ?`
      )
      .get('jane.smith@example.com') as {
      first_name: string;
      bio: string;
      profile_picture_url: string;
      location_city: string;
      gender: string;
      date_of_birth: string;
    };
    expect(jane.first_name).toBe('Jane');
    expect(jane.gender).toBe('female');
    expect(jane.location_city).toBe('New York');
    expect(jane.date_of_birth).toBe('1992-05-15');
    expect(jane.bio.length).toBeGreaterThan(40);
    expect(jane.profile_picture_url.startsWith('https://')).toBe(true);

    const matched = database.prepare(`SELECT COUNT(*) as n FROM matches WHERE status = 'matched'`).get() as {
      n: number;
    };
    expect(matched.n).toBe(3);

    const messages = database.prepare('SELECT COUNT(*) as n FROM messages').get() as { n: number };
    expect(messages.n).toBeGreaterThanOrEqual(10);

    const pending = database.prepare(`SELECT COUNT(*) as n FROM matches WHERE status = 'pending'`).get() as {
      n: number;
    };
    expect(pending.n).toBe(1);
  });

  test('second run upserts demo profiles instead of skipping them', async () => {
    const database = memoryDb();
    await seedDatabase({ database });
    database.prepare(`UPDATE profiles SET bio = 'stale' WHERE user_id IN (SELECT id FROM users)`).run();

    await seedDatabase({ database });

    const count = database.prepare('SELECT COUNT(*) as n FROM users').get() as { n: number };
    expect(count.n).toBe(seedUsers.length);
    const jane = database
      .prepare(
        `SELECT p.bio FROM profiles p JOIN users u ON u.id = p.user_id WHERE u.email = 'jane.smith@example.com'`
      )
      .get() as { bio: string };
    expect(jane.bio).toContain('ICU nurse');
    expect(jane.bio).not.toBe('stale');
  });

  test('--force recreates demo data and never deletes a real / Google user', async () => {
    const database = memoryDb();
    await seedDatabase({ database });

    const google = database
      .prepare(
        `INSERT INTO users (email, password_hash, auth_provider, google_sub) VALUES (?, NULL, 'google', 'sub-real')`
      )
      .run('real.member@gmail.com');
    const googleId = Number(google.lastInsertRowid);
    database
      .prepare(
        `INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, gender)
         VALUES (?, 'Real', 'Member', NULL, NULL)`
      )
      .run(googleId);

    await seedDatabase({ database, force: true });

    const emails = (
      database.prepare('SELECT email FROM users ORDER BY email').all() as { email: string }[]
    ).map((row) => row.email);
    expect(emails).toContain('real.member@gmail.com');
    expect(emails.filter((email) => email.endsWith('@example.com'))).toHaveLength(DEMO_SEED_EMAILS.length);
    expect(emails).toHaveLength(DEMO_SEED_EMAILS.length + 1);

    const googleRow = database
      .prepare(`SELECT auth_provider, google_sub FROM users WHERE email = 'real.member@gmail.com'`)
      .get() as { auth_provider: string; google_sub: string };
    expect(googleRow.auth_provider).toBe('google');
    expect(googleRow.google_sub).toBe('sub-real');
  });

  test('demo password constant stays password123', () => {
    expect(SEED_PASSWORD).toBe('password123');
    expect(seedUsers.every((u) => u.email.endsWith('@example.com'))).toBe(true);
  });
});
