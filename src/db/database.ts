import { Database } from 'bun:sqlite';
import { join } from 'path';

const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'fluito.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

type ColumnInfo = {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: unknown;
  pk: number;
};

function tableColumns(database: Database, table: string): ColumnInfo[] {
  return database.prepare(`PRAGMA table_info(${table})`).all() as ColumnInfo[];
}

function hasColumn(cols: ColumnInfo[], name: string): boolean {
  return cols.some((col) => col.name === name);
}

function rebuildUsersTable(database: Database) {
  database.exec('PRAGMA foreign_keys = OFF');
  database.exec(`
    CREATE TABLE users_google_mig (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      auth_provider TEXT NOT NULL DEFAULT 'password',
      google_sub TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  database.exec(`
    INSERT INTO users_google_mig (id, email, password_hash, auth_provider, google_sub, created_at, updated_at)
    SELECT
      id,
      email,
      password_hash,
      COALESCE(auth_provider, CASE WHEN password_hash IS NULL OR password_hash = '' THEN 'google' ELSE 'password' END),
      google_sub,
      created_at,
      updated_at
    FROM users
  `);
  database.exec('DROP TABLE users');
  database.exec('ALTER TABLE users_google_mig RENAME TO users');
  database.exec('PRAGMA foreign_keys = ON');
}

function sqlColOrNull(existing: string[], name: string): string {
  return existing.includes(name) ? name : 'NULL';
}

function rebuildProfilesTable(database: Database) {
  const existing = tableColumns(database, 'profiles').map((col) => col.name);
  database.exec('PRAGMA foreign_keys = OFF');
  database.exec(`
    CREATE TABLE profiles_google_mig (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth DATE,
      gender TEXT CHECK(gender IS NULL OR gender IN ('male', 'female')),
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
  database.exec(`
    INSERT INTO profiles_google_mig (
      id, user_id, first_name, last_name, date_of_birth, gender,
      denomination, church_name, location_city, location_state, location_country,
      bio, profile_picture_url, is_active, created_at, updated_at
    )
    SELECT
      id, user_id, first_name, last_name, date_of_birth, gender,
      ${sqlColOrNull(existing, 'denomination')},
      ${sqlColOrNull(existing, 'church_name')},
      ${sqlColOrNull(existing, 'location_city')},
      ${sqlColOrNull(existing, 'location_state')},
      ${sqlColOrNull(existing, 'location_country')},
      ${sqlColOrNull(existing, 'bio')},
      ${sqlColOrNull(existing, 'profile_picture_url')},
      ${sqlColOrNull(existing, 'is_active')},
      ${sqlColOrNull(existing, 'created_at')},
      ${sqlColOrNull(existing, 'updated_at')}
    FROM profiles
  `);
  database.exec('DROP TABLE profiles');
  database.exec('ALTER TABLE profiles_google_mig RENAME TO profiles');
  database.exec('PRAGMA foreign_keys = ON');
}

/**
 * Existing installs created users.password_hash / profiles.dob+gender as NOT NULL.
 * Google-created accounts need those nullable, plus auth_provider / google_sub.
 */
export function migrateGoogleAuthSchema(database: Database = db) {
  const userCols = tableColumns(database, 'users');
  if (userCols.length === 0) return;

  if (!hasColumn(userCols, 'auth_provider')) {
    database.exec(`ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'password'`);
  }
  if (!hasColumn(userCols, 'google_sub')) {
    database.exec(`ALTER TABLE users ADD COLUMN google_sub TEXT`);
  }

  const userColsAfter = tableColumns(database, 'users');
  const passwordCol = userColsAfter.find((col) => col.name === 'password_hash');
  if (passwordCol?.notnull === 1) {
    rebuildUsersTable(database);
  }

  const profileCols = tableColumns(database, 'profiles');
  if (profileCols.length === 0) return;
  const dobCol = profileCols.find((col) => col.name === 'date_of_birth');
  const genderCol = profileCols.find((col) => col.name === 'gender');
  if (dobCol?.notnull === 1 || genderCol?.notnull === 1) {
    rebuildProfilesTable(database);
  }

  database.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub
    ON users(google_sub)
    WHERE google_sub IS NOT NULL
  `);
}

/** Apply the current schema to any Database (production singleton or :memory: tests). */
export function applySchema(database: Database) {
  database.run('PRAGMA foreign_keys = ON');

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      auth_provider TEXT NOT NULL DEFAULT 'password',
      google_sub TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth DATE,
      gender TEXT CHECK(gender IS NULL OR gender IN ('male', 'female')),
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

  database.exec(`
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

  database.exec(`
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

  database.exec(`
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

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
    CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location_city, location_state);
    CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
    CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
    CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
  `);

  migrateGoogleAuthSchema(database);
}

// Create tables
export function initializeDatabase() {
  applySchema(db);
}
