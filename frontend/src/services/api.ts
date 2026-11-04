import axios from 'axios';
import { GOOGLE_WEB_CLIENT_ID } from '../config';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Add token and Content-Type to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Set Content-Type based on data type
  // For FormData, axios will automatically set Content-Type with boundary
  // For other data, set application/json
  if (!(config.data instanceof FormData)) {
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
  }
  // For FormData, don't set Content-Type - axios will handle it automatically

  return config;
});

// Handle errors with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (keep login/Google failures on the auth form)
    const requestUrl = String(originalRequest?.url || '');
    const isAuthAttempt = ['/auth/login', '/auth/google', '/auth/register'].some((path) =>
      requestUrl.includes(path)
    );
    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      return Promise.reject(error);
    }

    // Handle 429 (rate limit) errors
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 1;
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return api(originalRequest);
    }

    // Handle network errors with retry
    if (!error.response && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export const REPORT_REASONS = [
  'harassment',
  'fake_profile',
  'inappropriate_content',
  'spam',
  'underage',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
  };
}

export interface OnboardingData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
}

export interface Profile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | null;
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
  email: string;
  age?: number | null;
  profile_complete?: boolean;
  missing_required_fields?: string[];
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
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  denomination?: string;
  church_name?: string;
  location_city?: string;
  location_state?: string;
  bio?: string;
  profile_picture_url?: string;
  age: number;
}

export interface MatchListItem {
  match_id: number;
  status: string;
  created_at: string;
  other_user_id: number;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  bio?: string;
  location_city?: string;
  location_state?: string;
}

export interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export function isProfileComplete(user: Profile | null | undefined): boolean {
  if (!user) return false;
  if (typeof user.profile_complete === 'boolean') {
    return user.profile_complete;
  }
  const hasName = Boolean(user.first_name?.trim() && user.last_name?.trim());
  const hasAdultDob = Boolean(user.date_of_birth);
  const hasGender = user.gender === 'male' || user.gender === 'female';
  return hasName && hasAdultDob && hasGender;
}

export const authAPI = {
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginData) => api.post<AuthResponse>('/auth/login', data),
  google: (idToken: string) =>
    api.post<AuthResponse>('/auth/google', {
      id_token: idToken,
      client_id: GOOGLE_WEB_CLIENT_ID,
    }),
  deleteAccount: () => api.delete<{ message: string }>('/auth/account'),
};

export const profileAPI = {
  getProfile: () => api.get<Profile>('/profiles/me'),
  updateProfile: (data: Partial<Profile> | OnboardingData) =>
    api.patch<{ message: string; profile: Profile }>('/profiles/me', data),
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post<{ message: string; profile_picture_url: string; profile: Profile }>(
      '/profiles/me/upload-photo',
      formData
      // Don't set Content-Type header - browser will set it automatically with boundary
    );
  },
  getPreferences: () => api.get<Preferences>('/profiles/me/preferences'),
  updatePreferences: (data: Partial<Preferences>) => api.patch('/profiles/me/preferences', data),
  getUserProfile: (userId: number) => api.get<Profile>(`/profiles/${userId}`),
};

export const matchesAPI = {
  discover: () => api.get<{ matches: Match[]; count: number }>('/matches/discover'),
  swipe: (targetUserId: number, action: 'like' | 'reject') =>
    api.post('/matches/swipe', { target_user_id: targetUserId, action }),
  getMatches: () => api.get<{ matches: MatchListItem[]; count: number }>('/matches/matches'),
  unmatch: (matchId: number) => api.post('/matches/unmatch', { match_id: matchId }),
  block: (target: { target_user_id?: number; match_id?: number }) =>
    api.post<{ message: string; blocked: boolean; match_id?: number }>('/matches/block', target),
};

export const reportsAPI = {
  report: (data: {
    reported_user_id?: number;
    match_id?: number;
    reason: ReportReason;
    details?: string;
    block?: boolean;
  }) =>
    api.post<{ message: string; report_id: number; blocked: boolean; match_id?: number }>(
      '/reports',
      data
    ),
};

export const messagesAPI = {
  getMessages: (matchId: number) =>
    api.get<{ messages: Message[]; count: number }>(`/messages/match/${matchId}`),
  sendMessage: (matchId: number, content: string) =>
    api.post<{ message: Message }>(`/messages/match/${matchId}`, { content }),
};

export default api;
