import type { Database } from 'bun:sqlite';
import type { ReportReason } from '../utils/validation';

export type MatchRow = {
  id: number;
  user1_id: number;
  user2_id: number;
  status: string;
};

export function findMatchBetween(
  database: Database,
  userA: number,
  userB: number
): MatchRow | undefined {
  return database
    .prepare(
      `
      SELECT id, user1_id, user2_id, status FROM matches
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `
    )
    .get(userA, userB, userB, userA) as MatchRow | undefined;
}

export function findMatchForUser(
  database: Database,
  matchId: number,
  userId: number
): MatchRow | undefined {
  return database
    .prepare(
      `
      SELECT id, user1_id, user2_id, status FROM matches
      WHERE id = ? AND (user1_id = ? OR user2_id = ?)
    `
    )
    .get(matchId, userId, userId) as MatchRow | undefined;
}

export function otherUserId(match: MatchRow, userId: number): number {
  return match.user1_id === userId ? match.user2_id : match.user1_id;
}

export function isBlockedBetween(database: Database, userA: number, userB: number): boolean {
  const match = findMatchBetween(database, userA, userB);
  return String(match?.status ?? '').toLowerCase() === 'blocked';
}

export function userExists(database: Database, userId: number): boolean {
  const row = database.prepare('SELECT id FROM users WHERE id = ?').get(userId) as
    | { id: number }
    | undefined;
  return Boolean(row);
}

export function resolveTargetUserId(
  database: Database,
  actorId: number,
  options: { targetUserId?: number; matchId?: number }
): { ok: true; targetUserId: number } | { ok: false; status: 400 | 404; error: string } {
  if (options.matchId) {
    const match = findMatchForUser(database, options.matchId, actorId);
    if (!match) {
      return { ok: false, status: 404, error: 'Match not found' };
    }
    return { ok: true, targetUserId: otherUserId(match, actorId) };
  }
  if (!options.targetUserId) {
    return { ok: false, status: 400, error: 'target_user_id or match_id is required' };
  }
  if (options.targetUserId === actorId) {
    return { ok: false, status: 400, error: 'Cannot block or report yourself' };
  }
  if (!userExists(database, options.targetUserId)) {
    return { ok: false, status: 404, error: 'User not found' };
  }
  return { ok: true, targetUserId: options.targetUserId };
}

export function blockUser(
  database: Database,
  actorId: number,
  targetUserId: number
): { matchId: number; alreadyBlocked: boolean } {
  const existing = findMatchBetween(database, actorId, targetUserId);
  if (existing) {
    const alreadyBlocked = String(existing.status).toLowerCase() === 'blocked';
    if (!alreadyBlocked) {
      database
        .prepare('UPDATE matches SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('blocked', existing.id);
    }
    return { matchId: existing.id, alreadyBlocked };
  }

  const inserted = database
    .prepare('INSERT INTO matches (user1_id, user2_id, status) VALUES (?, ?, ?)')
    .run(actorId, targetUserId, 'blocked');
  return { matchId: Number(inserted.lastInsertRowid), alreadyBlocked: false };
}

export function createReport(
  database: Database,
  options: {
    reporterId: number;
    reportedUserId: number;
    reason: ReportReason;
    details?: string | null;
    alsoBlock?: boolean;
  }
): { reportId: number; blocked: boolean; matchId: number | null } {
  const inserted = database
    .prepare(
      `
      INSERT INTO reports (reporter_id, reported_user_id, reason, details)
      VALUES (?, ?, ?, ?)
    `
    )
    .run(
      options.reporterId,
      options.reportedUserId,
      options.reason,
      options.details?.trim() ? options.details.trim() : null
    );

  let blocked = false;
  let matchId: number | null = null;
  if (options.alsoBlock !== false) {
    const result = blockUser(database, options.reporterId, options.reportedUserId);
    blocked = true;
    matchId = result.matchId;
  }

  return { reportId: Number(inserted.lastInsertRowid), blocked, matchId };
}
