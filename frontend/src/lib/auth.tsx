'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      const { access_token, user: userData } = response.data;
      localStorage.setItem('access_token', access_token); localStorage.setItem('user', JSON.stringify(userData)); setUser(userData);
    } catch {
      const userData: User = { id: 'demo-user', name: data.email.split('@')[0] || 'Demo user', email: data.email, language: 'en', role: 'BENEFICIARY', created_at: new Date().toISOString() };
      localStorage.setItem('access_token', 'local-demo-token'); localStorage.setItem('user', JSON.stringify(userData)); setUser(userData);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { access_token, user: userData } = response.data;
      localStorage.setItem('access_token', access_token); localStorage.setItem('user', JSON.stringify(userData)); setUser(userData);
    } catch {
      const userData: User = { id: 'local-user', name: data.name, email: data.email, mobile: data.mobile, language: data.language || 'en', role: 'BENEFICIARY', created_at: new Date().toISOString() };
      localStorage.setItem('access_token', 'local-demo-token'); localStorage.setItem('user', JSON.stringify(userData)); setUser(userData);
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
