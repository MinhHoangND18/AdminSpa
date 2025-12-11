// contexts/AuthContext.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, UserRole } from '@/types/user';
import  api  from '@/lib/api/axios'; // Assuming you have a configured axios instance

// This should be the single source of truth for role hierarchy
const roleHierarchy: UserRole[] = [
  "super_admin",
  "store_admin",
  "manager",
  "receptionist",
  "staff",
];

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  isRoleOrHigher: (role: UserRole) => boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setToken(token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    document.cookie = `token=${token}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`; // 7 days

    // Redirect to the page the user was trying to access, or dashboard
    const from = pathname.includes('/login') ? '/dashboard' : pathname;
    router.push(from);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'; // Expire the cookie
    router.push('/login');
  };

  const hasRole = (role: UserRole) => {
    return user?.role === role;
  };

  const isRoleOrHigher = (role: UserRole) => {
    if (!user) return false;
    const userRoleIndex = roleHierarchy.indexOf(user.role);
    const requiredRoleIndex = roleHierarchy.indexOf(role);
    if (userRoleIndex === -1 || requiredRoleIndex === -1) return false;
    return userRoleIndex <= requiredRoleIndex;
  };

  const isAuthenticated = !loading && !!token && !!user;
  
  // While loading, don't render children
  if (loading) {
    return null; // Or a global loading spinner
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, hasRole, isRoleOrHigher, loading }}>
      {children}
    </AuthContext.Provider>
  );
};