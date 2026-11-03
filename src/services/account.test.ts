import { Database } from 'bun:sqlite';
import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applySchema } from '../db/database';
import { deleteUserAccount } from './account';

function memoryDb() {
  const database = new Database(':memory:');
  applySchema(database);
  return database;
}

const tempDirs: string[] = [];

afterEach(() => {
  // Best-effort cleanup; tests assert deletion themselves.
  tempDirs.length = 0;
});

describe('deleteUserAccount', () => {
  test('removes the user, cascaded rows, and local profile photos', async () => {
    const database = memoryDb();
    const uploadsDir = mkdtempSync(join(tmpdir(), 'fluito-uploads-'));
    tempDirs.push(uploadsDir);
    mkdirSync(uploadsDir, { recursive: true });

    const user = database
      .prepare("INSERT INTO users (email, password_hash) VALUES ('gone@example.com', 'x')")
      .run();
    const userId = Number(user.lastInsertRowid);
    const other = database
      .prepare("INSERT INTO users (email, password_hash) VALUES ('stay@example.com', 'x')")
      .run();
    const otherId = Number(other.lastInsertRowid);

    const photoName = `${userId}-123.jpg`;
    writeFileSync(join(uploadsDir, photoName), 'fake-image');
    writeFileSync(join(uploadsDir, `${otherId}-999.jpg`), 'keep-me');

    database
      .prepare(
        `INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, gender, profile_picture_url)
         VALUES (?, 'Gone', 'User', '1990-01-01', 'male', ?)`
      )
      .run(userId, `/uploads/profiles/${photoName}`);
    database
      .prepare(
        `INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, gender)
         VALUES (?, 'Stay', 'User', '1991-01-01', 'female')`
      )
      .run(otherId);
    database
      .prepare("INSERT INTO preferences (user_id, min_age, preferred_gender) VALUES (?, 18, 'female')")
      .run(userId);
    database
      .prepare("INSERT INTO matches (user1_id, user2_id, status) VALUES (?, ?, 'matched')")
      .run(userId, otherId);
    const match = database.prepare('SELECT id FROM matches').get() as { id: number };
    database
      .prepare('INSERT INTO messages (match_id, sender_id, content) VALUES (?, ?, ?)')
      .run(match.id, userId, 'hello');
    database
      .prepare(
        'INSERT INTO reports (reporter_id, reported_user_id, reason) VALUES (?, ?, ?)'
      )
      .run(otherId, userId, 'spam');

    const result = await deleteUserAccount({ db: database, userId, uploadsDir });
    expect(result.deleted).toBe(true);
    expect(existsSync(join(uploadsDir, photoName))).toBe(false);
    expect(existsSync(join(uploadsDir, `${otherId}-999.jpg`))).toBe(true);

    expect(database.prepare('SELECT COUNT(*) as n FROM users').get() as { n: number }).toEqual({
      n: 1,
    });
    expect(database.prepare('SELECT COUNT(*) as n FROM profiles').get() as { n: number }).toEqual({
      n: 1,
    });
    expect(database.prepare('SELECT COUNT(*) as n FROM preferences').get() as { n: number }).toEqual({
      n: 0,
    });
    expect(database.prepare('SELECT COUNT(*) as n FROM matches').get() as { n: number }).toEqual({
      n: 0,
    });
    expect(database.prepare('SELECT COUNT(*) as n FROM messages').get() as { n: number }).toEqual({
      n: 0,
    });
    expect(database.prepare('SELECT COUNT(*) as n FROM reports').get() as { n: number }).toEqual({
      n: 0,
    });
  });
});
