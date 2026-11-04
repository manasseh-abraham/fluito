import type { Database } from 'bun:sqlite';
import { db as defaultDb, initializeDatabase } from './database';
import { hashPassword } from '../utils/auth';

export const SEED_PASSWORD = 'password123';
export const DEMO_EMAIL_SUFFIX = '@example.com';

interface SeedUser {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  denomination?: string;
  church_name?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  bio?: string;
  /** HTTPS placeholder portraits (schema has `profile_picture_url`). */
  profile_picture_url?: string;
  min_age?: number;
  max_age?: number;
}

export const seedUsers: SeedUser[] = [
  {
    email: 'john.doe@example.com',
    password: SEED_PASSWORD,
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1990-01-15',
    gender: 'male',
    denomination: 'Pentecostal',
    church_name: 'First Pentecostal Church',
    location_city: 'New York',
    location_state: 'NY',
    location_country: 'USA',
    profile_picture_url: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Youth-ministry volunteer who loves hiking the Hudson, Saturday coffee, and long prayers. Interests: worship nights, trail running, cooking for small group. Seeking a God-fearing partner.',
    min_age: 24,
    max_age: 42,
  },
  {
    email: 'michael.smith@example.com',
    password: SEED_PASSWORD,
    first_name: 'Michael',
    last_name: 'Smith',
    date_of_birth: '1988-05-20',
    gender: 'male',
    denomination: 'Pentecostal',
    church_name: 'Grace Pentecostal Church',
    location_city: 'Los Angeles',
    location_state: 'CA',
    location_country: 'USA',
    profile_picture_url: 'https://randomuser.me/api/portraits/men/11.jpg',
    bio: 'Worship leader and sound-desk regular. Interests: guitar, beach walks, mentoring teens, Korean BBQ after service. Looking to build a Christ-centered home.',
    min_age: 25,
    max_age: 42,
  },
  {
    email: 'david.johnson@example.com',
    password: SEED_PASSWORD,
    first_name: 'David',
    last_name: 'Johnson',
    date_of_birth: '1992-08-10',
    gender: 'male',
    denomination: 'Pentecostal',
    church_name: 'Victory Pentecostal Church',
    location_city: 'Chicago',
    location_state: 'IL',
    location_country: 'USA',
    profile_picture_url: 'https://randomuser.me/api/portraits/men/52.jpg',
    bio: 'Youth pastor who still plays rec basketball. Interests: altar ministry, deep-dish, winter lakefront runs, board games. Seeking a woman of faith who loves serving.',
    min_age: 24,
    max_age: 40,
  },
  {
    email: 'james.williams@example.com',
    password: SEED_PASSWORD,
    first_name: 'James',
    last_name: 'Williams',
    date_of_birth: '1987-11-25',
    gender: 'male',
    denomination: 'Pentecostal',
    church_name: 'Faith Pentecostal Church',
    location_city: 'Houston',
    location_state: 'TX',
    location_country: 'USA',
    profile_picture_url: 'https://randomuser.me/api/portraits/men/75.jpg',
    bio: 'Small-business owner and usher team captain. Interests: grilling, Sunday potluck, fishing, Proverbs 31 conversations. Looking for a partner with a heart for service.',
    min_age: 25,
    max_age: 42,
  },
  {
    email: 'robert.brown@example.com',
    password: SEED_PASSWORD,
    first_name: 'Robert',
    last_name: 'Brown',
    date_of_birth: '1991-03-18',
    gender: 'male',
    denomination: 'Pentecostal',
    church_name: 'Hope Pentecostal Church',
    location_city: 'Phoenix',
    location_state: 'AZ',
    location_country: 'USA',
    profile_picture_url: 'https://randomuser.me/api/portraits/men/41.jpg',
    bio: 'Sunday-school teacher and desert hiker. Interests: kids ministry, photography, spicy food, early-morning prayer. Seeking someone who values family and fellowship.',
    min_age: 24,
    max_age: 40,
  },
  {
    email: 'jane.smith@example.com',
    password: SEED_PASSWORD,
    first_name: 'Jane',
    last_name: 'Smith',
    date_of_birth: '1992-05-15',
    gender: 'female',
    denomination: 'Pentecostal',
    church_name: 'Second Pentecostal Church',
    location_city: 'New York',
    location_state: 'NY',
    location_country: 'USA',
    profile_picture_url: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'ICU nurse and choir alto. Interests: Central Park walks, baking cinnamon rolls for cell group, journaling, jazz. Seeking a faithful partner who loves ministry.',
    min_age: 26,
    max_age: 42,
  },
  {
    email: 'sarah.johnson@example.com',
    password: SEED_PASSWORD,
    first_name: 'Sarah',
    last_name: 'Johnson',
    date_of_birth: '1990-07-22',
    gender: 'female',
    denomination: 'Pentecostal',
    church_name: 'Grace Pentecostal Church',
    location_city: 'Los Angeles',
    location_state: 'CA',
    location_country: 'USA',
    profile_picture_url: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: 'Worship leader and children’s church volunteer. Interests: songwriting, farmers markets, yoga, mentoring girls. Looking for a man of God who leads with humility.',
    min_age: 26,
    max_age: 44,
  },
  {
    email: 'emily.davis@example.com',
    password: SEED_PASSWORD,
    first_name: 'Emily',
    last_name: 'Davis',
    date_of_birth: '1993-09-30',
    gender: 'female',
    denomination: 'Pentecostal',
    church_name: 'Victory Pentecostal Church',
    location_city: 'Chicago',
    location_state: 'IL',
    location_country: 'USA',
    profile_picture_url: 'https://randomuser.me/api/portraits/women/21.jpg',
    bio: 'Pediatric nurse who never misses midweek prayer. Interests: worship nights, thrift shopping, lake sunsets, hosting friends. Seeking a partner who wants a Christ-centered home.',
    min_age: 25,
    max_age: 40,
  },
  {
    email: 'jessica.miller@example.com',
    password: SEED_PASSWORD,
    first_name: 'Jessica',
    last_name: 'Miller',
    date_of_birth: '1989-12-05',
    gender: 'female',
    denomination: 'Pentecostal',
    church_name: 'Faith Pentecostal Church',
    location_city: 'Houston',
    location_state: 'TX',
    location_country: 'USA',
    profile_picture_url: 'https://randomuser.me/api/portraits/women/17.jpg',
    bio: 'Teacher and women’s ministry lead. Interests: book club, hospitality, gospel concerts, Sunday brunch. Looking for a man who loves God, serves others, and values family.',
    min_age: 26,
    max_age: 44,
  },
  {
    email: 'amanda.wilson@example.com',
    password: SEED_PASSWORD,
    first_name: 'Amanda',
    last_name: 'Wilson',
    date_of_birth: '1991-04-14',
    gender: 'female',
    denomination: 'Pentecostal',
    church_name: 'Hope Pentecostal Church',
    location_city: 'Phoenix',
    location_state: 'AZ',
    location_country: 'USA',
    profile_picture_url: 'https://randomuser.me/api/portraits/women/33.jpg',
    bio: 'Graphic designer on the worship media team. Interests: illustration, cactus gardens, coffee shops, serving at outreach. Seeking a creative, faith-filled partner.',
    min_age: 25,
    max_age: 42,
  },
];

export const DEMO_SEED_EMAILS = seedUsers.map((user) => user.email);

const DEMO_MATCH_PAIRS: Array<[string, string, Array<{ from: string; content: string }>]> = [
  [
    'john.doe@example.com',
    'jane.smith@example.com',
    [
      { from: 'john.doe@example.com', content: 'Hi Jane — your choir note made me smile. How was service this week?' },
      { from: 'jane.smith@example.com', content: 'Hi John! We sang a new chorus. Do you ever hike the Hudson on Saturdays?' },
      { from: 'john.doe@example.com', content: 'Almost every weekend. Want to join the church hiking group next Saturday?' },
      { from: 'jane.smith@example.com', content: 'Yes — I can bring cinnamon rolls for the trailhead.' },
    ],
  ],
  [
    'michael.smith@example.com',
    'sarah.johnson@example.com',
    [
      { from: 'sarah.johnson@example.com', content: 'Michael, your worship set on Sunday was beautiful.' },
      { from: 'michael.smith@example.com', content: 'Thank you, Sarah. Your harmony on the chorus carried the room.' },
      { from: 'sarah.johnson@example.com', content: 'Coffee after rehearsal Thursday? I know a quiet spot in Pasadena.' },
    ],
  ],
  [
    'david.johnson@example.com',
    'emily.davis@example.com',
    [
      { from: 'david.johnson@example.com', content: 'Emily — thanks for helping with youth night. The kids loved the game.' },
      { from: 'emily.davis@example.com', content: 'It was fun! Next week I can bring snacks if you handle the playlist.' },
      { from: 'david.johnson@example.com', content: 'Deal. Deep-dish after we tear down?' },
    ],
  ],
];

/** Pending like so Discover still has swipeable cards (James → Jane). */
const DEMO_PENDING_LIKES: Array<[string, string]> = [['james.williams@example.com', 'jane.smith@example.com']];

export function parseSeedArgs(argv: string[] = process.argv): { force: boolean } {
  return { force: argv.includes('--force') };
}

function isDemoEmail(email: string): boolean {
  return DEMO_SEED_EMAILS.includes(email) && email.endsWith(DEMO_EMAIL_SUFFIX);
}

function deleteDemoUsersOnly(database: Database) {
  const placeholders = DEMO_SEED_EMAILS.map(() => '?').join(', ');
  const rows = database
    .prepare(`SELECT id, email FROM users WHERE email IN (${placeholders})`)
    .all(...DEMO_SEED_EMAILS) as { id: number; email: string }[];

  for (const row of rows) {
    if (!isDemoEmail(row.email)) {
      throw new Error(`Refusing to delete non-demo user ${row.email}`);
    }
  }

  database.exec('PRAGMA foreign_keys = ON');
  database.prepare(`DELETE FROM users WHERE email IN (${placeholders})`).run(...DEMO_SEED_EMAILS);
}

async function upsertDemoUser(database: Database, userData: SeedUser): Promise<number> {
  if (!isDemoEmail(userData.email)) {
    throw new Error(`Refusing to seed non-demo email ${userData.email}`);
  }

  const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(userData.email) as
    | { id: number }
    | undefined;
  const passwordHash = await hashPassword(userData.password);

  let userId: number;
  if (existing) {
    userId = existing.id;
    database
      .prepare(
        `
        UPDATE users
        SET password_hash = ?, auth_provider = 'password', updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND email = ?
      `
      )
      .run(passwordHash, userId, userData.email);

    database
      .prepare(
        `
        UPDATE profiles SET
          first_name = ?, last_name = ?, date_of_birth = ?, gender = ?,
          denomination = ?, church_name = ?, location_city = ?, location_state = ?,
          location_country = ?, bio = ?, profile_picture_url = ?,
          is_active = 1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `
      )
      .run(
        userData.first_name,
        userData.last_name,
        userData.date_of_birth,
        userData.gender,
        userData.denomination ?? null,
        userData.church_name ?? null,
        userData.location_city ?? null,
        userData.location_state ?? null,
        userData.location_country ?? null,
        userData.bio ?? null,
        userData.profile_picture_url ?? null,
        userId
      );
  } else {
    const result = database
      .prepare(
        `
        INSERT INTO users (email, password_hash, auth_provider, created_at, updated_at)
        VALUES (?, ?, 'password', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
      )
      .run(userData.email, passwordHash);
    userId = Number(result.lastInsertRowid);

    database
      .prepare(
        `
        INSERT INTO profiles (
          user_id, first_name, last_name, date_of_birth, gender,
          denomination, church_name, location_city, location_state, location_country,
          bio, profile_picture_url, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
      )
      .run(
        userId,
        userData.first_name,
        userData.last_name,
        userData.date_of_birth,
        userData.gender,
        userData.denomination ?? null,
        userData.church_name ?? null,
        userData.location_city ?? null,
        userData.location_state ?? null,
        userData.location_country ?? null,
        userData.bio ?? null,
        userData.profile_picture_url ?? null
      );
  }

  const preferredGender = userData.gender === 'male' ? 'female' : 'male';
  const minAge = userData.min_age ?? 24;
  const maxAge = userData.max_age ?? 42;
  const pref = database.prepare('SELECT id FROM preferences WHERE user_id = ?').get(userId) as
    | { id: number }
    | undefined;
  if (pref) {
    database
      .prepare(
        `
        UPDATE preferences
        SET min_age = ?, max_age = ?, preferred_gender = ?, denomination_preference = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `
      )
      .run(minAge, maxAge, preferredGender, 'Pentecostal', userId);
  } else {
    database
      .prepare(
        `
        INSERT INTO preferences (
          user_id, min_age, max_age, preferred_gender, denomination_preference,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
      )
      .run(userId, minAge, maxAge, preferredGender, 'Pentecostal');
  }

  return userId;
}

function findMatch(
  database: Database,
  userA: number,
  userB: number
): { id: number; status: string } | undefined {
  return database
    .prepare(
      `
      SELECT id, status FROM matches
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `
    )
    .get(userA, userB, userB, userA) as { id: number; status: string } | undefined;
}

function ensureDemoSocialGraph(database: Database, idsByEmail: Map<string, number>) {
  for (const [emailA, emailB, thread] of DEMO_MATCH_PAIRS) {
    const userA = idsByEmail.get(emailA);
    const userB = idsByEmail.get(emailB);
    if (!userA || !userB) continue;

    let match = findMatch(database, userA, userB);
    if (!match) {
      const inserted = database
        .prepare(`INSERT INTO matches (user1_id, user2_id, status) VALUES (?, ?, 'matched')`)
        .run(userA, userB);
      match = { id: Number(inserted.lastInsertRowid), status: 'matched' };
    } else if (match.status !== 'matched') {
      database.prepare(`UPDATE matches SET status = 'matched', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(match.id);
    }

    const existingCount = database.prepare('SELECT COUNT(*) as n FROM messages WHERE match_id = ?').get(match.id) as {
      n: number;
    };
    if (existingCount.n > 0) continue;

    for (const line of thread) {
      const senderId = idsByEmail.get(line.from);
      if (!senderId) continue;
      database
        .prepare(`INSERT INTO messages (match_id, sender_id, content, is_read) VALUES (?, ?, ?, 1)`)
        .run(match.id, senderId, line.content);
    }
  }

  for (const [fromEmail, toEmail] of DEMO_PENDING_LIKES) {
    const fromId = idsByEmail.get(fromEmail);
    const toId = idsByEmail.get(toEmail);
    if (!fromId || !toId) continue;
    if (findMatch(database, fromId, toId)) continue;
    database.prepare(`INSERT INTO matches (user1_id, user2_id, status) VALUES (?, ?, 'pending')`).run(fromId, toId);
  }
}

export async function seedDatabase(options: { database?: Database; force?: boolean } = {}) {
  const database = options.database ?? defaultDb;
  if (!options.database) {
    initializeDatabase();
  }

  const force = options.force ?? false;
  console.log(force ? '🌱 Seeding demo accounts (--force, demo emails only)...' : '🌱 Upserting @example.com demo accounts...');

  if (force) {
    deleteDemoUsersOnly(database);
    console.log('🧹 Removed existing @example.com demo users (Google / real accounts left untouched).');
  }

  const idsByEmail = new Map<string, number>();
  for (const userData of seedUsers) {
    const userId = await upsertDemoUser(database, userData);
    idsByEmail.set(userData.email, userId);
    console.log(`✅ ${force ? 'Created' : 'Upserted'} ${userData.first_name} ${userData.last_name} (${userData.email})`);
  }

  ensureDemoSocialGraph(database, idsByEmail);

  console.log('\n✨ Demo seed complete. Password for every demo account: password123');
  console.log('\n👨 Men (Discover shows women):');
  seedUsers.filter((u) => u.gender === 'male').forEach((u) => console.log(`   - ${u.email}`));
  console.log('\n👩 Women (Discover shows men):');
  seedUsers.filter((u) => u.gender === 'female').forEach((u) => console.log(`   - ${u.email}`));
  console.log('\n💑 Sample matches + threads: john↔jane, michael↔sarah, david↔emily');
  console.log('   Unmatched (still on Discover): james, robert, jessica, amanda');
}

if (import.meta.main) {
  const { force } = parseSeedArgs();
  seedDatabase({ force }).catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  });
}
