export type Gender = 'male' | 'female' | 'other';
export type SalaryType = 'fixed' | 'hourly' | 'commission';
export type StaffStatus = 'active' | 'inactive' | 'on_leave';

export interface Staff {
  id: number;
  code: string;
  full_name: string;
  phone: string;
  email: string | null;
  gender: Gender;
  birthday: string | null;
  address: string | null;
  store_id: number | null;
  store?: {
    id: number;
    name: string;
  };
  hire_date: string | null;
  salary_type: SalaryType;
  base_salary: number | null;
  commission_rate: number | null;
  status: StaffStatus;
  created_at: string;
  updated_at: string;
}

export interface StaffFormData {
  full_name: string;
  phone: string;
  email?: string;
  gender?: Gender | null | '';
  birthday?: string;
  address?: string;
  store_id?: number | null | '';
  hire_date?: string;
  salary_type?: SalaryType | null | '';
  base_salary?: number;
  commission_rate?: number;
  status?: StaffStatus;
}

export interface StaffFilters {
  keyword?: string;
  status?: StaffStatus | 'all';
  store_id?: number | 'all';
  page?: number;
  limit?: number;
}