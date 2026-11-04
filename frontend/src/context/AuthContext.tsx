import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI, isProfileComplete, profileAPI } from '../services/api';
import type { OnboardingData, Profile, RegisterData } from '../services/api';

interface AuthContextType {
  user: Profile | null;
  token: string | null;
  loading: boolean;
  profileComplete: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => void;
  updateProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function applyTheme(gender?: string | null) {
  if (gender === 'female') {
    document.body.classList.add('theme-pink');
  } else {
    document.body.classList.remove('theme-pink');
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsed = JSON.parse(storedUser) as Profile;
        setUser(parsed);
        applyTheme(parsed.gender);
      } catch {
        localStorage.removeItem('user');
      }
      void loadProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const persistSession = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      applyTheme(response.data.gender);
    } catch (error) {
      console.error('Error loading profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    persistSession(response.data.token);
    await loadProfile();
  };

  const loginWithGoogle = async (idToken: string) => {
    const response = await authAPI.google(idToken);
    persistSession(response.data.token);
    await loadProfile();
  };

  const register = async (data: RegisterData) => {
    const response = await authAPI.register(data);
    persistSession(response.data.token);
    await loadProfile();
  };

  const completeOnboarding = async (data: OnboardingData) => {
    const response = await profileAPI.updateProfile(data);
    const next = response.data.profile;
    setUser(next);
    localStorage.setItem('user', JSON.stringify(next));
    applyTheme(next.gender);
  };

  const updateProfile = async () => {
    if (token) {
      await loadProfile();
    }
  };

  const deleteAccount = async () => {
    await authAPI.deleteAccount();
    logout();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.body.classList.remove('theme-pink');
    // Navigation will be handled by App.tsx routing
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        profileComplete: isProfileComplete(user),
        login,
        loginWithGoogle,
        register,
        completeOnboarding,
        deleteAccount,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
