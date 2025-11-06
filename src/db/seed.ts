import { db } from './database';
import { hashPassword } from '../utils/auth';

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
}

const seedUsers: SeedUser[] = [
  // Male users
  {
    email: 'john.doe@example.com',
    password: 'password123',
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1990-01-15',
    gender: 'male',
    denomination: 'Pentecostal',
    church_name: 'First Pentecostal Church',
    location_city: 'New York',
    location_state: 'NY',
    location_country: 'USA',
    bio: 'Seeking a God-fearing woman who shares my faith and values. I love serving in ministry and spending time in prayer.',
  },
  {
    email: 'michael.smith@example.com',
    password: 'password123',
    first_name: 'Michael',
    last_name: 'Smith',
    date_of_birth: '1988-05-20',
    gender: 'male',
    denomination: 'Pentecostal',
    church_name: 'Grace Pentecostal Church',
    location_city: 'Los Angeles',
    location_state: 'CA',
    location_country: 'USA',
    bio: 'Passionate about worship and serving the Lord. Looking for a partner who loves God and wants to build a Christ-centered relationship.',
  },
  {
    email: 'david.johnson@example.com',
    password: 'password123',
    first_name: 'David',
    last_name: 'Johnson',
    date_of_birth: '1992-08-10',
    gender: 'male',
    denomination: 'Pentecostal',
    church_name: 'Victory Pentecostal Church',
    location_city: 'Chicago',
    location_state: 'IL',
    location_country: 'USA',
    bio: 'Youth pastor and worship leader. Seeking a woman of faith who shares my passion for ministry and serving others.',
  },
  {
    email: 'james.williams@example.com',
    password: 'password123',
    first_name: 'James',
    last_name: 'Williams',
    date_of_birth: '1985-11-25',
    gender: 'male',
    denomination: 'Pentecostal',
    church_name: 'Faith Pentecostal Church',
    location_city: 'Houston',
    location_state: 'TX',
    location_country: 'USA',
    bio: 'Business owner and active church member. Looking for a Proverbs 31 woman who loves the Lord and has a heart for service.',
  },
  {
    email: 'robert.brown@example.com',
    password: 'password123',
    first_name: 'Robert',
    last_name: 'Brown',
    date_of_birth: '1991-03-18',
    gender: 'male',
    denomination: 'Pentecostal',
    church_name: 'Hope Pentecostal Church',
    location_city: 'Phoenix',
    location_state: 'AZ',
    location_country: 'USA',
    bio: 'Teacher and Sunday school leader. Seeking a woman who values family, faith, and fellowship.',
  },
  // Female users
  {
    email: 'jane.smith@example.com',
    password: 'password123',
    first_name: 'Jane',
    last_name: 'Smith',
    date_of_birth: '1992-05-15',
    gender: 'female',
    denomination: 'Pentecostal',
    church_name: 'Second Pentecostal Church',
    location_city: 'New York',
    location_state: 'NY',
    location_country: 'USA',
    bio: 'Seeking a faithful Christian partner who shares my love for God and desire to serve in ministry.',
  },
  {
    email: 'sarah.johnson@example.com',
    password: 'password123',
    first_name: 'Sarah',
    last_name: 'Johnson',
    date_of_birth: '1990-07-22',
    gender: 'female',
    denomination: 'Pentecostal',
    church_name: 'Grace Pentecostal Church',
    location_city: 'Los Angeles',
    location_state: 'CA',
    location_country: 'USA',
    bio: 'Worship leader and children\'s ministry volunteer. Looking for a man of God who leads with love and serves with humility.',
  },
  {
    email: 'emily.davis@example.com',
    password: 'password123',
    first_name: 'Emily',
    last_name: 'Davis',
    date_of_birth: '1993-09-30',
    gender: 'female',
    denomination: 'Pentecostal',
    church_name: 'Victory Pentecostal Church',
    location_city: 'Chicago',
    location_state: 'IL',
    location_country: 'USA',
    bio: 'Nurse and active church member. Seeking a partner who values prayer, worship, and building a Christ-centered home.',
  },
  {
    email: 'jessica.miller@example.com',
    password: 'password123',
    first_name: 'Jessica',
    last_name: 'Miller',
    date_of_birth: '1989-12-05',
    gender: 'female',
    denomination: 'Pentecostal',
    church_name: 'Faith Pentecostal Church',
    location_city: 'Houston',
    location_state: 'TX',
    location_country: 'USA',
    bio: 'Teacher and women\'s ministry leader. Looking for a man who loves God, serves others, and values family.',
  },
  {
    email: 'amanda.wilson@example.com',
    password: 'password123',
    first_name: 'Amanda',
    last_name: 'Wilson',
    date_of_birth: '1991-04-14',
    gender: 'female',
    denomination: 'Pentecostal',
    church_name: 'Hope Pentecostal Church',
    location_city: 'Phoenix',
    location_state: 'AZ',
    location_country: 'USA',
    bio: 'Graphic designer and worship team member. Seeking a partner who shares my passion for creativity, faith, and serving the Lord.',
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (optional - comment out if you want to keep existing users)
    // db.exec('DELETE FROM messages');
    // db.exec('DELETE FROM matches');
    // db.exec('DELETE FROM preferences');
    // db.exec('DELETE FROM profiles');
    // db.exec('DELETE FROM users');

    for (const userData of seedUsers) {
      // Check if user already exists
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(userData.email) as { id: number } | undefined;

      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user
      const result = db
        .prepare('INSERT INTO users (email, password_hash, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
        .run(userData.email, hashedPassword);

      const userId = result.lastInsertRowid as number;

      // Create profile
      db.prepare(
        `
        INSERT INTO profiles (
          user_id, first_name, last_name, date_of_birth, gender,
          denomination, church_name, location_city, location_state, location_country, bio,
          is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
      ).run(
        userId,
        userData.first_name,
        userData.last_name,
        userData.date_of_birth,
        userData.gender,
        userData.denomination || null,
        userData.church_name || null,
        userData.location_city || null,
        userData.location_state || null,
        userData.location_country || null,
        userData.bio || null
      );

      // Create default preferences
      const preferredGender = userData.gender === 'male' ? 'female' : 'male';
      db.prepare(
        `
        INSERT INTO preferences (
          user_id, min_age, max_age, preferred_gender, denomination_preference,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
      ).run(userId, 25, 40, preferredGender, 'Pentecostal');

      console.log(`✅ Created user: ${userData.first_name} ${userData.last_name} (${userData.email})`);
    }

    console.log('\n✨ Database seed completed successfully!');
    console.log('\n📝 Test user credentials:');
    console.log('   All users have password: password123');
    console.log('\n👨 Male users:');
    seedUsers
      .filter((u) => u.gender === 'male')
      .forEach((u) => console.log(`   - ${u.email}`));
    console.log('\n👩 Female users:');
    seedUsers
      .filter((u) => u.gender === 'female')
      .forEach((u) => console.log(`   - ${u.email}`));
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed if called directly
if (import.meta.main) {
  seedDatabase();
}

export { seedDatabase };

