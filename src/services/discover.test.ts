import { Database } from 'bun:sqlite';
import { describe, expect, test } from 'bun:test';
import { applySchema } from '../db/database';
import { discoverProfiles } from './discover';
import { blockUser } from './moderation';

function memoryDb() {
  const database = new Database(':memory:');
  applySchema(database);
  return database;
}

function insertUser(
  database: Database,
  email: string,
  extras: { first?: string; last?: string; dob?: string | null; gender?: string | null } = {}
) {
  const user = database.prepare("INSERT INTO users (email, password_hash) VALUES (?, 'x')").run(email);
  const id = Number(user.lastInsertRowid);
  database
    .prepare(
      'INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, gender) VALUES (?, ?, ?, ?, ?)'
    )
    .run(
      id,
      extras.first ?? 'Pat',
      extras.last ?? 'Lee',
      extras.dob === undefined ? '1990-01-01' : extras.dob,
      extras.gender === undefined ? 'male' : extras.gender
    );
  return id;
}

describe('discoverProfiles', () => {
  test('refuses incomplete Google-style profiles', () => {
    const database = memoryDb();
    const viewer = insertUser(database, 'google@example.com', {
      first: 'New',
      last: 'Member',
      dob: null,
      gender: null,
    });
    const result = discoverProfiles(database, viewer);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.profile_complete).toBe(false);
      expect(result.missing_required_fields).toContain('date_of_birth');
      expect(result.missing_required_fields).toContain('gender');
    }
  });

  test('hides blocked users and incomplete candidates', () => {
    const database = memoryDb();
    const viewer = insertUser(database, 'john@example.com', { gender: 'male' });
    const visible = insertUser(database, 'jane@example.com', {
      first: 'Jane',
      last: 'Smith',
      gender: 'female',
    });
    const blocked = insertUser(database, 'blocked@example.com', {
      first: 'Blocked',
      last: 'User',
      gender: 'female',
    });
    insertUser(database, 'empty@example.com', {
      first: 'No',
      last: 'Dob',
      dob: null,
      gender: 'female',
    });

    blockUser(database, viewer, blocked);
    const result = discoverProfiles(database, viewer);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const ids = result.matches.map((row) => row.user_id);
      expect(ids).toContain(visible);
      expect(ids).not.toContain(blocked);
      expect(ids).not.toContain(viewer);
    }
  });
});
