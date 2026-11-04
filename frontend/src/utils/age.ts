/** Same 18+ copy the API returns from Zod (`src/utils/age.ts`). */
export const UNDERAGE_MESSAGE = 'You must be at least 18 years old to use Fluito';

function parseIsoDate(dob: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

export function ageFromDob(dob: string, now: Date = new Date()): number | null {
  const birthDate = parseIsoDate(dob);
  if (!birthDate) return null;
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export function isAtLeast18(dob: string, now: Date = new Date()): boolean {
  const age = ageFromDob(dob, now);
  return age !== null && age >= 18;
}
