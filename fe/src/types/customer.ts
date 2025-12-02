import { Store } from './store';


export interface CustomerResponse { 
  data: {
    data: Customer[];
    total: number;
    page: number;
    limit: number;
  };
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}
export enum CustomerType {
  NEW = 'new',
  REGULAR = 'regular',
  VIP = 'vip',
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

export interface Customer {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  gender: Gender;
  birthday: string | null;
  address: string | null;
  avatar: string | null;
  customerType: CustomerType;
  totalSpent: number;
  totalVisits: number;
  lastVisitDate: string | null;
  notes: string | null;
  storeId: number | null;
  store?: Store;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  fullName: string;
  phone: string;
  email: string;
  gender: Gender;
  birthday: string;
  address: string;
  customerType: CustomerType;
  notes: string;
  storeId: string;
  status: CustomerStatus;
}

export interface CreateCustomerDto {
  fullName: string;
  phone: string;
  email?: string;
  gender?: Gender;
  birthday?: string;
  address?: string;
  avatar?: string;
  customerType?: CustomerType;
  notes?: string;
  storeId?: number;
  status?: CustomerStatus;
}

export type UpdateCustomerDto = Partial<CreateCustomerDto>;