import { Database } from 'bun:sqlite';
import { describe, expect, test } from 'bun:test';
import { applySchema, migrateGoogleAuthSchema } from './database';

describe('Google auth schema migration', () => {
  test('fresh schema allows null password_hash, dob, and gender', () => {
    const database = new Database(':memory:');
    applySchema(database);

    const user = database
      .prepare(
        "INSERT INTO users (email, password_hash, auth_provider, google_sub) VALUES ('a@b.c', NULL, 'google', 'sub-1')"
      )
      .run();
    const userId = Number(user.lastInsertRowid);
    database
      .prepare(
        'INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, gender) VALUES (?, ?, ?, NULL, NULL)'
      )
      .run(userId, '', '');

    const row = database
      .prepare(
        `SELECT u.password_hash, p.date_of_birth, p.gender
         FROM users u JOIN profiles p ON p.user_id = u.id WHERE u.id = ?`
      )
      .get(userId) as {
      password_hash: string | null;
      date_of_birth: string | null;
      gender: string | null;
    };
    expect(row.password_hash).toBeNull();
    expect(row.date_of_birth).toBeNull();
    expect(row.gender).toBeNull();
  });

  test('migrates a legacy NOT NULL users/profiles schema', () => {
    const database = new Database(':memory:');
    database.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth DATE NOT NULL,
        gender TEXT NOT NULL CHECK(gender IN ('male', 'female')),
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    database
      .prepare("INSERT INTO users (email, password_hash) VALUES ('legacy@example.com', 'hash')")
      .run();
    database
      .prepare(
        "INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, gender) VALUES (1, 'Lee', 'Gacy', '1991-02-02', 'male')"
      )
      .run();

    migrateGoogleAuthSchema(database);

    const userCols = database.prepare('PRAGMA table_info(users)').all() as {
      name: string;
      notnull: number;
    }[];
    const password = userCols.find((c) => c.name === 'password_hash');
    expect(password?.notnull).toBe(0);
    expect(userCols.some((c) => c.name === 'google_sub')).toBe(true);
    expect(userCols.some((c) => c.name === 'auth_provider')).toBe(true);

    const profileCols = database.prepare('PRAGMA table_info(profiles)').all() as {
      name: string;
      notnull: number;
    }[];
    expect(profileCols.find((c) => c.name === 'date_of_birth')?.notnull).toBe(0);
    expect(profileCols.find((c) => c.name === 'gender')?.notnull).toBe(0);

    database
      .prepare(
        "INSERT INTO users (email, password_hash, auth_provider, google_sub) VALUES ('g@x.com', NULL, 'google', 'sub-2')"
      )
      .run();
    const googleUser = database.prepare("SELECT id FROM users WHERE email = 'g@x.com'").get() as {
      id: number;
    };
    database
      .prepare(
        'INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, gender) VALUES (?, ?, ?, NULL, NULL)'
      )
      .run(googleUser.id, 'G', 'User');
  });
});
