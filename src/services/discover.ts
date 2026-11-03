import type { Database } from 'bun:sqlite';
import { ageFromDob } from '../utils/age';
import { profileCompleteness } from '../utils/profileCompleteness';

export type DiscoverFailure = {
  ok: false;
  status: 403 | 404;
  error: string;
  profile_complete?: boolean;
  missing_required_fields?: string[];
};

export type DiscoverSuccess = {
  ok: true;
  matches: Array<Record<string, unknown>>;
  count: number;
};

export type DiscoverResult = DiscoverFailure | DiscoverSuccess;

export function discoverProfiles(database: Database, userId: number): DiscoverResult {
  const profile = database.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as any;

  if (!profile) {
    return { ok: false, status: 404, error: 'Profile not found. Please complete your profile first.' };
  }

  const completeness = profileCompleteness(profile);
  if (!completeness.profile_complete) {
    return {
      ok: false,
      status: 403,
      error: 'Complete your profile before discovering matches.',
      ...completeness,
    };
  }

  const preferences = database.prepare('SELECT * FROM preferences WHERE user_id = ?').get(userId) as any;
  const today = new Date();

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
      AND p.date_of_birth IS NOT NULL
      AND date(p.date_of_birth) <= date('now', '-18 years')
      AND p.gender IN ('male', 'female')
      AND TRIM(p.first_name) != ''
      AND TRIM(p.last_name) != ''
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

  if (preferences?.preferred_gender && preferences.preferred_gender !== 'both') {
    query += ' AND p.gender = ?';
    params.push(preferences.preferred_gender);
  } else if (!preferences || !preferences.preferred_gender) {
    if (profile.gender === 'male' || profile.gender === 'female') {
      const oppositeGender = profile.gender === 'male' ? 'female' : 'male';
      query += ' AND p.gender = ?';
      params.push(oppositeGender);
    }
  }

  if (preferences?.min_age || preferences?.max_age) {
    const minAge = preferences.min_age || 18;
    const maxAge = preferences.max_age || 100;
    const minBirthYear = today.getFullYear() - maxAge - 1;
    const maxBirthYear = today.getFullYear() - minAge;
    query +=
      ' AND p.date_of_birth IS NOT NULL AND CAST(SUBSTR(p.date_of_birth, 1, 4) AS INTEGER) BETWEEN ? AND ?';
    params.push(minBirthYear, maxBirthYear);
  }

  if (preferences?.denomination_preference) {
    query += ' AND p.denomination = ?';
    params.push(preferences.denomination_preference);
  }

  query += ' LIMIT 20';

  const potentialMatches = database.prepare(query).all(...params) as any[];
  const matches = potentialMatches.map((match) => ({
    ...match,
    age: ageFromDob(match.date_of_birth),
  }));

  return { ok: true, matches, count: matches.length };
}
