/** Parse YYYY-MM-DD as a local calendar date, or null if invalid. */
export function parseIsoDate(dob: string | null | undefined): Date | null {
  if (!dob) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob.trim());
  if (!match) {
    const fallback = new Date(dob);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
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

/** Age in whole years, or null when DOB is missing/unparseable. */
export function ageFromDob(dob: string | null | undefined, now: Date = new Date()): number | null {
  const birthDate = parseIsoDate(dob);
  if (!birthDate) return null;
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

/** True when the ISO date is a real calendar day. */
export function isValidIsoDate(dob: string): boolean {
  return parseIsoDate(dob) !== null;
}

/** Fluito is 18+ only. Uses the calendar date, not UTC midnight. */
export function isAtLeast18(dob: string | null | undefined, now: Date = new Date()): boolean {
  const age = ageFromDob(dob, now);
  return age !== null && age >= 18;
}

export const UNDERAGE_MESSAGE = 'You must be at least 18 years old to use Fluito';
