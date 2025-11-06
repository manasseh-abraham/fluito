import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { initializeDatabase } from './db/database';
import { authRoutes } from './routes/auth';
import { profileRoutes } from './routes/profiles';
import { matchRoutes } from './routes/matches';
import { messageRoutes } from './routes/messages';

// Initialize database
initializeDatabase();

// Create Hono app
const app = new Hono();

// CORS middleware
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'Fluito API - Christian Pentecostal Dating App',
    version: '0.1.0',
    status: 'running'
  });
});

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/profiles', profileRoutes);
app.route('/api/matches', matchRoutes);
app.route('/api/messages', messageRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Start server
const port = parseInt(process.env.PORT || '3000');
console.log(`🚀 Fluito API server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};

