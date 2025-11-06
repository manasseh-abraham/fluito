import { Database } from 'bun:sqlite';
import { join } from 'path';

const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'fluito.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth DATE NOT NULL,
      gender TEXT NOT NULL CHECK(gender IN ('male', 'female')),
      denomination TEXT,
      church_name TEXT,
      location_city TEXT,
      location_state TEXT,
      location_country TEXT,
      bio TEXT,
      profile_picture_url TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Preferences table
  db.exec(`
    CREATE TABLE IF NOT EXISTS preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      min_age INTEGER,
      max_age INTEGER,
      preferred_gender TEXT CHECK(preferred_gender IN ('male', 'female', 'both')),
      max_distance INTEGER,
      denomination_preference TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Matches table
  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'matched', 'rejected', 'blocked')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user1_id, user2_id)
    )
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
    CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location_city, location_state);
    CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
    CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
    CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
  `);
}

