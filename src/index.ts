import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { initializeDatabase } from './db/database';
import { authRoutes } from './routes/auth';
import { profileRoutes } from './routes/profiles';
import { matchRoutes } from './routes/matches';
import { messageRoutes } from './routes/messages';
import { rateLimitMiddleware } from './middleware/rateLimit';

// Initialize database
initializeDatabase();

// Create Hono app
const app = new Hono();

// CORS middleware
app.use('/*', cors({
  origin: process.env.CORS_ORIGIN || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting (skip for static files)
app.use('/api/*', rateLimitMiddleware);

// Body parsing middleware - Hono handles this automatically
// No need for explicit body parsing middleware

// Health check API
app.get('/api', (c) => {
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

// Serve uploaded files
app.use('/uploads/*', serveStatic({ root: './' }));

// Serve static files from Vite build (must be after API routes)
app.use('/*', serveStatic({ root: './frontend/dist' }));
app.get('*', serveStatic({ path: './frontend/dist/index.html' }));

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
const port = parseInt(process.env.PORT || '4000');
console.log(`🚀 Fluito API server running on http://localhost:${port}`);
console.log(`🌐 Web app available at http://localhost:${port}`);
console.log(`📱 Frontend served from ./frontend/dist`);

export default {
  port,
  fetch: app.fetch,
};

