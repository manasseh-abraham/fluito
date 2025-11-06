import { Hono } from 'hono';
import { db } from '../db/database';
import { authMiddleware } from '../middleware/auth';
import { profileUpdateSchema, preferencesSchema } from '../utils/validation';

export const profileRoutes = new Hono();

// Apply auth middleware to all routes
profileRoutes.use('/*', authMiddleware);

// Get current user's profile
profileRoutes.get('/me', (c) => {
  const userId = c.get('userId') as number;

  const profile = db
    .prepare(
      `
    SELECT 
      p.*,
      u.email
    FROM profiles p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
  `
    )
    .get(userId) as any;

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  // Calculate age
  const birthDate = new Date(profile.date_of_birth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

  return c.json({
    ...profile,
    age: actualAge,
  });
});

// Update profile
profileRoutes.patch('/me', async (c) => {
  try {
    const userId = c.get('userId') as number;
    const body = await c.req.json();
    const validated = profileUpdateSchema.parse(body);

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(validated).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    const updateQuery = `UPDATE profiles SET ${updates.join(', ')} WHERE user_id = ?`;
    db.prepare(updateQuery).run(...values);

    // Fetch updated profile
    const profile = db
      .prepare(
        `
      SELECT 
        p.*,
        u.email
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `
      )
      .get(userId) as any;

    return c.json({ message: 'Profile updated successfully', profile });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user preferences
profileRoutes.get('/me/preferences', (c) => {
  const userId = c.get('userId') as number;

  const preferences = db.prepare('SELECT * FROM preferences WHERE user_id = ?').get(userId) as any;

  if (!preferences) {
    // Return default preferences if none exist
    return c.json({
      user_id: userId,
      min_age: 18,
      max_age: 100,
      preferred_gender: 'both',
      max_distance: null,
      denomination_preference: null,
    });
  }

  return c.json(preferences);
});

// Update user preferences
profileRoutes.patch('/me/preferences', async (c) => {
  try {
    const userId = c.get('userId') as number;
    const body = await c.req.json();
    const validated = preferencesSchema.parse(body);

    // Check if preferences exist
    const existing = db.prepare('SELECT id FROM preferences WHERE user_id = ?').get(userId) as
      | { id: number }
      | undefined;

    if (existing) {
      // Update existing preferences
      const updates: string[] = [];
      const values: any[] = [];

      Object.entries(validated).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(userId);
        const updateQuery = `UPDATE preferences SET ${updates.join(', ')} WHERE user_id = ?`;
        db.prepare(updateQuery).run(...values);
      }
    } else {
      // Create new preferences
      const insertQuery = `
        INSERT INTO preferences (user_id, min_age, max_age, preferred_gender, max_distance, denomination_preference)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.prepare(insertQuery).run(
        userId,
        validated.min_age || null,
        validated.max_age || null,
        validated.preferred_gender || null,
        validated.max_distance || null,
        validated.denomination_preference || null
      );
    }

    const preferences = db.prepare('SELECT * FROM preferences WHERE user_id = ?').get(userId) as any;
    return c.json({ message: 'Preferences updated successfully', preferences });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get other user's profile (for viewing matches)
profileRoutes.get('/:userId', (c) => {
  const currentUserId = c.get('userId') as number;
  const targetUserId = parseInt(c.req.param('userId'));

  if (currentUserId === targetUserId) {
    return c.json({ error: 'Cannot view your own profile this way' }, 400);
  }

  const profile = db
    .prepare(
      `
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.date_of_birth,
      p.gender,
      p.denomination,
      p.church_name,
      p.location_city,
      p.location_state,
      p.location_country,
      p.bio,
      p.profile_picture_url
    FROM profiles p
    WHERE p.user_id = ? AND p.is_active = 1
  `
    )
    .get(targetUserId) as any;

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  // Calculate age
  const birthDate = new Date(profile.date_of_birth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

  return c.json({
    ...profile,
    age: actualAge,
  });
});

