import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Gender must be either male or female' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
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

