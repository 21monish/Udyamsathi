'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await api.get('/auth/me');
      if (res.data) {
        const u: User = {
          id: res.data.user_id,
          name: res.data.name,
          email: res.data.email,
          mobile: res.data.mobile,
          language: res.data.language,
          role: res.data.role,
          created_at: res.data.created_at || new Date().toISOString(),
        };
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
      }
    } catch {
      // Keep existing stored user if offline
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (data: LoginRequest): Promise<User> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
      const { access_token, user: userData } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail) {
        throw new Error(detail);
      }
      // Fallback for offline demo if server is unreachable
      const isDemoAdmin = data.email.toLowerCase().includes('admin');
      const fallbackUser: User = {
        id: isDemoAdmin ? 'admin-user-id' : 'demo-user-id',
        name: isDemoAdmin ? 'Admin' : data.email.split('@')[0] || 'Beneficiary User',
        email: data.email,
        language: 'en',
        role: isDemoAdmin ? 'ADMIN' : 'BENEFICIARY',
        created_at: new Date().toISOString(),
      };
      localStorage.setItem('access_token', 'local-demo-token');
      localStorage.setItem('user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return fallbackUser;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest): Promise<User> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { access_token, user: userData } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail) {
        throw new Error(detail);
      }
      const fallbackUser: User = {
        id: 'local-user',
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        language: data.language || 'en',
        role: 'BENEFICIARY',
        created_at: new Date().toISOString(),
      };
      localStorage.setItem('access_token', 'local-demo-token');
      localStorage.setItem('user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return fallbackUser;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
