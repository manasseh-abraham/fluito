import { Context, Next } from 'hono';
import { verifyToken, extractTokenFromHeader } from '../utils/auth';
import { db } from '../db/database';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  // Verify user exists
  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(decoded.userId) as {
    id: number;
    email: string;
  } | undefined;

  if (!user) {
    return c.json({ error: 'Unauthorized - User not found' }, 401);
  }

  // Attach user to context
  c.set('userId', user.id);
  c.set('user', user);

  await next();
}

