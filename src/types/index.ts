export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
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
  profile_picture_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Preferences {
  id: number;
  user_id: number;
  min_age?: number;
  max_age?: number;
  preferred_gender?: 'male' | 'female' | 'both';
  max_distance?: number;
  denomination_preference?: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: number;
  user1_id: number;
  user2_id: number;
  status: 'pending' | 'matched' | 'rejected' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  match_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
}

