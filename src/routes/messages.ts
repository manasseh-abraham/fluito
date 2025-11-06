import { Hono } from 'hono';
import { db } from '../db/database';
import { authMiddleware } from '../middleware/auth';

export const messageRoutes = new Hono();

// Apply auth middleware to all routes
messageRoutes.use('/*', authMiddleware);

// Get messages for a match
messageRoutes.get('/match/:matchId', (c) => {
  const userId = c.get('userId') as number;
  const matchId = parseInt(c.req.param('matchId'));

  // Verify user is part of this match
  const match = db
    .prepare('SELECT * FROM matches WHERE id = ? AND (user1_id = ? OR user2_id = ?)')
    .get(matchId, userId, userId) as any;

  if (!match) {
    return c.json({ error: 'Match not found' }, 404);
  }

  const messages = db
    .prepare(
      `
    SELECT 
      m.id,
      m.sender_id,
      m.content,
      m.is_read,
      m.created_at,
      p.first_name as sender_name
    FROM messages m
    JOIN profiles p ON p.user_id = m.sender_id
    WHERE m.match_id = ?
    ORDER BY m.created_at ASC
  `
    )
    .all(matchId) as any[];

  // Mark messages as read
  db.prepare('UPDATE messages SET is_read = 1 WHERE match_id = ? AND sender_id != ?').run(matchId, userId);

  return c.json({ messages, count: messages.length });
});

// Send a message
messageRoutes.post('/match/:matchId', async (c) => {
  try {
    const userId = c.get('userId') as number;
    const matchId = parseInt(c.req.param('matchId'));
    const body = await c.req.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return c.json({ error: 'Message content is required' }, 400);
    }

    // Verify user is part of this match
    const match = db
      .prepare('SELECT * FROM matches WHERE id = ? AND (user1_id = ? OR user2_id = ?) AND status = "matched"')
      .get(matchId, userId, userId) as any;

    if (!match) {
      return c.json({ error: 'Match not found or not matched' }, 404);
    }

    // Insert message
    const insertMessage = db.prepare('INSERT INTO messages (match_id, sender_id, content) VALUES (?, ?, ?)');
    const result = insertMessage.run(matchId, userId, content.trim());

    // Fetch the created message
    const message = db
      .prepare(
        `
      SELECT 
        m.id,
        m.sender_id,
        m.content,
        m.is_read,
        m.created_at,
        p.first_name as sender_name
      FROM messages m
      JOIN profiles p ON p.user_id = m.sender_id
      WHERE m.id = ?
    `
      )
      .get(result.lastInsertRowid) as any;

    return c.json({ message }, 201);
  } catch (error: any) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

