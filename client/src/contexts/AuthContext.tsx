import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  team?: string;
  avatar: string;
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  team?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Configurar interceptor de axios
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const { user, token, refreshToken } = response.data;

      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/auth/register`, userData);

      const { user, token, refreshToken } = response.data;

      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al registrar usuario');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(`${API_URL}/api/auth/profile`, updates);
      const updatedUser = response.data;

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al actualizar perfil');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        clearError
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
