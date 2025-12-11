// hooks/useAuth.ts
'use client';

import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * Custom hook to access authentication context
 * 
 * @example
 * const { user, isAuthenticated, login, logout, hasPermission } = useAuth();
 * 
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};