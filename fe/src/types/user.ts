// types/user.ts
export type UserRole = 'super_admin' | 'store_admin' | 'manager' | 'staff' | 'receptionist';

export interface User {
  id: number;
  username: string;
  email: string | null;
  role: UserRole;
  staff_id: number | null;
  staff_name?: string;
  store_id: number | null;
  store_name?: string;
  last_login: string | null;
  login_attempts: number;
  is_locked: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  staff_id: string;
  store_id: string;
  is_active: boolean;
}

export interface Staff {
  id: number;
  name: string;
  phone: string;
  position: string;
}

export interface Store {
  id: number;
  name: string;
  address: string;
}

export interface UserFilters {
  search?: string; 
  role?: UserRole | 'all';
  is_active?: boolean | 'all' | string; 
  page?: number;
  limit?: number;
}

export interface UserResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}