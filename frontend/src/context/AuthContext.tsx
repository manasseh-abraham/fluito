import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI, profileAPI } from '../services/api';
import type { Profile } from '../services/api';

interface AuthContextType {
  user: Profile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      loadProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Set theme based on gender
      if (response.data.gender === 'female') {
        document.body.classList.add('theme-pink');
      } else {
        document.body.classList.remove('theme-pink');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { token: newToken } = response.data;
    
    setToken(newToken);
    localStorage.setItem('token', newToken);
    
    await loadProfile();
  };

  const register = async (data: any) => {
    const response = await authAPI.register(data);
    const { token: newToken } = response.data;
    
    setToken(newToken);
    localStorage.setItem('token', newToken);
    
    await loadProfile();
  };

  const updateProfile = async () => {
    if (token) {
      await loadProfile();
    }
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
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
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

