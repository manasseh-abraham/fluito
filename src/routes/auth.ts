import { Hono } from 'hono';
import { db } from '../db/database';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { registerSchema, loginSchema } from '../utils/validation';

export const authRoutes = new Hono();

// Register
authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const validated = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(validated.email) as
      | { id: number }
      | undefined;

    if (existingUser) {
      return c.json({ error: 'User with this email already exists' }, 400);
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password);

    // Create user
    const insertUser = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    const result = insertUser.run(validated.email, passwordHash);
    const userId = result.lastInsertRowid as number;

    // Create profile
    const insertProfile = db.prepare(`
      INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, gender)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertProfile.run(
      userId,
      validated.first_name,
      validated.last_name,
      validated.date_of_birth,
      validated.gender
    );

    // Generate token
    const token = generateToken(userId);

    return c.json(
      {
        message: 'User registered successfully',
        token,
        user: {
          id: userId,
          email: validated.email,
        },
      },
      201
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Login
authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const validated = loginSchema.parse(body);

    // Find user
    const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(validated.email) as
      | { id: number; email: string; password_hash: string }
      | undefined;

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Verify password
    const isValid = await comparePassword(validated.password, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Generate token
    const token = generateToken(user.id);

    return c.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

