import type { Database } from 'bun:sqlite';
import { existsSync } from 'node:fs';
import { readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';

export const DEFAULT_PROFILE_UPLOADS_DIR = join(process.cwd(), 'uploads', 'profiles');

function isLocalProfilePhoto(url: string | null | undefined): url is string {
  return Boolean(url && url.startsWith('/uploads/profiles/'));
}

/** Remove local profile photos, then delete the user (SQLite FKs cascade the rest). */
export async function deleteUserAccount(options: {
  db: Database;
  userId: number;
  uploadsDir?: string;
}): Promise<{ deleted: boolean }> {
  const { db, userId } = options;
  const uploadsDir = options.uploadsDir ?? DEFAULT_PROFILE_UPLOADS_DIR;

  const profile = db.prepare('SELECT profile_picture_url FROM profiles WHERE user_id = ?').get(userId) as
    | { profile_picture_url?: string | null }
    | undefined;

  const filesToRemove = new Set<string>();
  if (isLocalProfilePhoto(profile?.profile_picture_url)) {
    filesToRemove.add(join(process.cwd(), profile.profile_picture_url.replace(/^\//, '')));
  }

  if (existsSync(uploadsDir)) {
    const files = await readdir(uploadsDir);
    for (const file of files) {
      if (file.startsWith(`${userId}-`)) {
        filesToRemove.add(join(uploadsDir, file));
      }
    }
  }

  for (const filepath of filesToRemove) {
    if (existsSync(filepath)) {
      try {
        await unlink(filepath);
      } catch (err) {
        console.error('Error deleting profile photo during account deletion:', err);
      }
    }
  }

  const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  return { deleted: result.changes > 0 };
}
