import { Database } from 'bun:sqlite';
import { describe, expect, test } from 'bun:test';
import { applySchema } from '../db/database';
import { blockUser, createReport, isBlockedBetween } from './moderation';

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
    .run(id, extras.first ?? 'A', extras.last ?? 'User', extras.dob ?? '1990-01-01', extras.gender ?? 'male');
  return id;
}

describe('blockUser / reports', () => {
  test('creates a blocked match and hides the pair', () => {
    const database = memoryDb();
    const a = insertUser(database, 'a@example.com');
    const b = insertUser(database, 'b@example.com', { gender: 'female' });

    const first = blockUser(database, a, b);
    expect(first.alreadyBlocked).toBe(false);
    expect(isBlockedBetween(database, a, b)).toBe(true);

    const second = blockUser(database, a, b);
    expect(second.alreadyBlocked).toBe(true);
    expect(second.matchId).toBe(first.matchId);

    const row = database.prepare('SELECT status FROM matches WHERE id = ?').get(first.matchId) as {
      status: string;
    };
    expect(row.status).toBe('blocked');
  });

  test('turns an existing match into blocked', () => {
    const database = memoryDb();
    const a = insertUser(database, 'a@example.com');
    const b = insertUser(database, 'b@example.com', { gender: 'female' });
    database
      .prepare("INSERT INTO matches (user1_id, user2_id, status) VALUES (?, ?, 'matched')")
      .run(a, b);

    const result = blockUser(database, b, a);
    const row = database.prepare('SELECT status FROM matches WHERE id = ?').get(result.matchId) as {
      status: string;
    };
    expect(row.status).toBe('blocked');
  });

  test('reporting stores a row and blocks by default', () => {
    const database = memoryDb();
    const a = insertUser(database, 'a@example.com');
    const b = insertUser(database, 'b@example.com', { gender: 'female' });

    const result = createReport(database, {
      reporterId: a,
      reportedUserId: b,
      reason: 'harassment',
      details: 'Unwanted messages',
    });
    expect(result.blocked).toBe(true);
    expect(isBlockedBetween(database, a, b)).toBe(true);

    const report = database.prepare('SELECT * FROM reports WHERE id = ?').get(result.reportId) as {
      reporter_id: number;
      reported_user_id: number;
      reason: string;
      details: string;
    };
    expect(report.reporter_id).toBe(a);
    expect(report.reported_user_id).toBe(b);
    expect(report.reason).toBe('harassment');
    expect(report.details).toBe('Unwanted messages');
  });

  test('reporting can skip the block', () => {
    const database = memoryDb();
    const a = insertUser(database, 'a@example.com');
    const b = insertUser(database, 'b@example.com', { gender: 'female' });
    const result = createReport(database, {
      reporterId: a,
      reportedUserId: b,
      reason: 'spam',
      alsoBlock: false,
    });
    expect(result.blocked).toBe(false);
    expect(isBlockedBetween(database, a, b)).toBe(false);
  });
});
