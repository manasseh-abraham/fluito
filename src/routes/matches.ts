import { Hono } from 'hono';
import { db } from '../db/database';
import { authMiddleware } from '../middleware/auth';

type Variables = {
  userId: number;
  user: { id: number; email: string };
};

export const matchRoutes = new Hono<{ Variables: Variables }>();

// Apply auth middleware to all routes
matchRoutes.use('/*', authMiddleware);

// Discover potential matches
matchRoutes.get('/discover', (c) => {
  const userId = c.get('userId') as number;

  // Get user's profile and preferences
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as any;
  const preferences = db.prepare('SELECT * FROM preferences WHERE user_id = ?').get(userId) as any;

  if (!profile) {
    return c.json({ error: 'Profile not found. Please complete your profile first.' }, 404);
  }

  // Calculate user's age
  const birthDate = new Date(profile.date_of_birth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const userAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

  // Build query for potential matches
  let query = `
    SELECT DISTINCT
      p.id,
      p.user_id,
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
    WHERE p.user_id != ? 
      AND p.is_active = 1
      AND p.user_id NOT IN (
        SELECT CASE 
          WHEN user1_id = ? THEN user2_id
          WHEN user2_id = ? THEN user1_id
        END
        FROM matches
        WHERE (user1_id = ? OR user2_id = ?) AND status != 'pending'
      )
  `;

  const params: any[] = [userId, userId, userId, userId, userId];

  // Apply gender preference
  if (preferences?.preferred_gender && preferences.preferred_gender !== 'both') {
    query += ' AND p.gender = ?';
    params.push(preferences.preferred_gender);
  } else if (!preferences || !preferences.preferred_gender) {
    // Default: opposite gender
    const oppositeGender = profile.gender === 'male' ? 'female' : 'male';
    query += ' AND p.gender = ?';
    params.push(oppositeGender);
  }

  // Apply age preferences
  if (preferences?.min_age || preferences?.max_age) {
    const minAge = preferences.min_age || 18;
    const maxAge = preferences.max_age || 100;
    const minBirthYear = today.getFullYear() - maxAge - 1;
    const maxBirthYear = today.getFullYear() - minAge;
    query += ' AND CAST(SUBSTR(p.date_of_birth, 1, 4) AS INTEGER) BETWEEN ? AND ?';
    params.push(minBirthYear, maxBirthYear);
  }

  // Apply denomination preference
  if (preferences?.denomination_preference) {
    query += ' AND p.denomination = ?';
    params.push(preferences.denomination_preference);
  }

  query += ' LIMIT 20';

  const potentialMatches = db.prepare(query).all(...params) as any[];

  // Calculate ages and format results
  const matches = potentialMatches.map((match) => {
    const birthDate = new Date(match.date_of_birth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

    return {
      ...match,
      age: actualAge,
    };
  });

  return c.json({ matches, count: matches.length });
});

// Swipe right (like) or left (reject)
matchRoutes.post('/swipe', async (c) => {
  try {
    const userId = c.get('userId') as number;
    const body = await c.req.json();
    const { target_user_id, action } = body; // action: 'like' or 'reject'

    if (!target_user_id || !action || !['like', 'reject'].includes(action)) {
      return c.json({ error: 'Invalid request. Provide target_user_id and action (like/reject)' }, 400);
    }

    if (userId === target_user_id) {
      return c.json({ error: 'Cannot swipe on yourself' }, 400);
    }

    // Check if match already exists
    const existingMatch = db
      .prepare(
        `
      SELECT id, user1_id, user2_id, status, created_at, updated_at FROM matches 
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `
      )
      .get(userId, target_user_id, target_user_id, userId) as any;

    // If match exists, handle it based on status
    if (existingMatch) {
      // Get status and normalize it (handle any case/whitespace issues)
      const rawStatus = existingMatch.status;
      const status = rawStatus ? String(rawStatus).trim().toLowerCase() : '';
      
      // If match is already matched or rejected, return error
      if (status === 'matched' || status === 'rejected' || status === 'blocked') {
        return c.json({ error: 'Match already exists' }, 400);
      }
      
      // If match is pending and this is a like, create mutual match
      if (status === 'pending' && action === 'like') {
        // Both users like each other - create a match!
        db.prepare(
          `
          UPDATE matches 
          SET status = 'matched', updated_at = CURRENT_TIMESTAMP
          WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
        `
        ).run(userId, target_user_id, target_user_id, userId);

        return c.json({
          message: 'It\'s a match!',
          matched: true,
        });
      }
      
      // If match is pending and this is a reject, update to rejected
      if (status === 'pending' && action === 'reject') {
        db.prepare(
          `
          UPDATE matches 
          SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
          WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
        `
        ).run(userId, target_user_id, target_user_id, userId);

        return c.json({
          message: 'Rejection recorded',
          matched: false,
        });
      }
    }

    // Create new match record
    const status = action === 'like' ? 'pending' : 'rejected';
    const insertMatch = db.prepare(`
      INSERT INTO matches (user1_id, user2_id, status)
      VALUES (?, ?, ?)
    `);
    insertMatch.run(userId, target_user_id, status);

    // If this is a like, check if the other user already liked this user
    if (action === 'like') {
      const mutualLike = db
        .prepare(
          `
        SELECT * FROM matches 
        WHERE user1_id = ? AND user2_id = ? AND status = 'pending'
      `
        )
        .get(target_user_id, userId) as any;

      if (mutualLike) {
        // Update both matches to 'matched'
        db.prepare(
          `
          UPDATE matches 
          SET status = 'matched', updated_at = CURRENT_TIMESTAMP
          WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
        `
        ).run(userId, target_user_id, target_user_id, userId);

        return c.json({
          message: 'It\'s a match!',
          matched: true,
        });
      }
    }

    return c.json({
      message: action === 'like' ? 'Like recorded' : 'Rejection recorded',
      matched: false,
    });
  } catch (error: any) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all matches (mutual likes)
matchRoutes.get('/matches', (c) => {
  const userId = c.get('userId') as number;

  const matches = db
    .prepare(
      `
    SELECT 
      m.id as match_id,
      m.status,
      m.created_at,
      CASE 
        WHEN m.user1_id = ? THEN m.user2_id
        ELSE m.user1_id
      END as other_user_id,
      p.first_name,
      p.last_name,
      p.profile_picture_url,
      p.bio,
      p.location_city,
      p.location_state
    FROM matches m
    JOIN profiles p ON p.user_id = CASE 
      WHEN m.user1_id = ? THEN m.user2_id
      ELSE m.user1_id
    END
    WHERE (m.user1_id = ? OR m.user2_id = ?) 
      AND m.status = 'matched'
    ORDER BY m.created_at DESC
  `
    )
    .all(userId, userId, userId, userId) as any[];

  return c.json({ matches, count: matches.length });
});

