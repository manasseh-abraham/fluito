import { Context, Next } from 'hono';

// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute per IP

export async function rateLimitMiddleware(c: Context, next: Next) {
  const ip = c.req.header('x-forwarded-for') || 
             c.req.header('x-real-ip') || 
             'unknown';
  
  const now = Date.now();
  const key = `${ip}-${c.req.path}`;
  
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    // New window or expired
    requestCounts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    await next();
    return;
  }
  
  if (record.count >= MAX_REQUESTS) {
    return c.json({ error: 'Too many requests. Please try again later.' }, 429);
  }
  
  record.count++;
  requestCounts.set(key, record);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    for (const [k, v] of requestCounts.entries()) {
      if (now > v.resetTime) {
        requestCounts.delete(k);
      }
    }
  }
  
  await next();
}

