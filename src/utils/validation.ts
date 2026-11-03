import { z } from 'zod';
import { isAtLeast18, isValidIsoDate, UNDERAGE_MESSAGE } from './age';

export const adultDateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((value) => isValidIsoDate(value), { message: 'Invalid date of birth' })
  .refine((value) => isAtLeast18(value), { message: UNDERAGE_MESSAGE });

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: adultDateOfBirthSchema,
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Gender must be either male or female' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const googleAuthSchema = z.object({
  id_token: z.string().min(1, 'id_token is required'),
  client_id: z.string().min(1).optional(),
});

export const profileUpdateSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  date_of_birth: adultDateOfBirthSchema.optional(),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Gender must be either male or female' }),
  }).optional(),
  denomination: z.string().optional(),
  church_name: z.string().optional(),
  location_city: z.string().optional(),
  location_state: z.string().optional(),
  location_country: z.string().optional(),
  bio: z.string().max(1000).optional(),
  profile_picture_url: z.string().url().optional(),
});

export const preferencesSchema = z.object({
  min_age: z.number().int().min(18).max(100).optional(),
  max_age: z.number().int().min(18).max(100).optional(),
  preferred_gender: z.enum(['male', 'female', 'both']).optional(),
  max_distance: z.number().int().min(1).optional(),
  denomination_preference: z.string().optional(),
});

export const REPORT_REASONS = [
  'harassment',
  'fake_profile',
  'inappropriate_content',
  'spam',
  'underage',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const blockSchema = z
  .object({
    target_user_id: z.number().int().positive().optional(),
    match_id: z.number().int().positive().optional(),
  })
  .refine((value) => value.target_user_id || value.match_id, {
    message: 'target_user_id or match_id is required',
  });

export const reportSchema = z
  .object({
    reported_user_id: z.number().int().positive().optional(),
    match_id: z.number().int().positive().optional(),
    reason: z.enum(REPORT_REASONS, {
      errorMap: () => ({
        message: `Reason must be one of: ${REPORT_REASONS.join(', ')}`,
      }),
    }),
    details: z.string().max(2000).optional(),
    block: z.boolean().optional(),
  })
  .refine((value) => value.reported_user_id || value.match_id, {
    message: 'reported_user_id or match_id is required',
  });
