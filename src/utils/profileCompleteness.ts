import { ageFromDob, isAtLeast18 } from './age';

export const REQUIRED_PROFILE_FIELDS = ['first_name', 'last_name', 'date_of_birth', 'gender'] as const;

export type ProfileCompletenessInput = {
  first_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
};

export type ProfileCompleteness = {
  profile_complete: boolean;
  missing_required_fields: string[];
};

export function missingRequiredProfileFields(profile: ProfileCompletenessInput): string[] {
  const missing: string[] = [];
  if (!profile.first_name?.trim()) missing.push('first_name');
  if (!profile.last_name?.trim()) missing.push('last_name');
  if (!profile.date_of_birth || !isAtLeast18(profile.date_of_birth)) {
    missing.push('date_of_birth');
  }
  if (profile.gender !== 'male' && profile.gender !== 'female') {
    missing.push('gender');
  }
  return missing;
}

export function profileCompleteness(profile: ProfileCompletenessInput): ProfileCompleteness {
  const missing = missingRequiredProfileFields(profile);
  return {
    profile_complete: missing.length === 0,
    missing_required_fields: missing,
  };
}

export function withProfileCompleteness<T extends ProfileCompletenessInput>(profile: T) {
  const completeness = profileCompleteness(profile);
  return {
    ...profile,
    age: ageFromDob(profile.date_of_birth),
    ...completeness,
  };
}
