'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';

// 1. Định nghĩa kiểu dữ liệu cho User (tùy chỉnh theo backend của bạn)
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'editor'; // Ví dụ về phân quyền
  avatar?: string;
}

// 2. Định nghĩa các hàm và biến sẽ public ra ngoài
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Thêm biến này để tránh flash nội dung khi chưa load xong user
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRole: string) => boolean;
}

// Tạo Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Tạo Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Giả lập việc check login khi mới vào trang (F5)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Lấy token từ localStorage hoặc cookie
        const storedUser = localStorage.getItem('user_data'); 
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Lỗi khôi phục phiên đăng nhập', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Hàm Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // --- THAY THẾ ĐOẠN NÀY BẰNG GỌI API THỰC TẾ ---
      // const response = await api.post('/login', { email, password });
      
      // Giả lập call API mất 1s
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Giả lập dữ liệu user trả về từ API
      const mockUser: User = {
        id: '1',
        name: 'Demo User',
        email: email,
        role: 'admin', // Giả sử user này là admin
      };

      // Lưu vào state và localStorage
      setUser(mockUser);
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      // localStorage.setItem('token', 'abc-xyz'); 
      
      // -----------------------------------------------
    } catch (error) {
      console.error('Login failed', error);
      throw error; // Ném lỗi để component Login xử lý (hiển thị thông báo)
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_data');
    // localStorage.removeItem('token');
    // Có thể thêm router.push('/login') nếu cần
  };

  // Hàm kiểm tra quyền (như trong comment useAuth của bạn)
  const hasPermission = (requiredRole: string): boolean => {
    if (!user) return false;
    // Logic đơn giản: Nếu là admin thì chấp hết, hoặc phải trùng role
    if (user.role === 'admin') return true;
    return user.role === requiredRole;
  };

  const value = {
    user,
    isAuthenticated: !!user, // Nếu có user thì là true
    isLoading,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};