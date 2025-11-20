import { ServiceCategory } from './service-category';

export type ServiceStatus = 'active' | 'inactive';

export interface Service {
  id: number;
  name: string;
  categoryId: number | null;
  category?: ServiceCategory;
  description: string | null;
  durationMinutes: number;
  price: number;
  priceUSD: number | null;
  discountPrice: number | null;
  imageUrl: string | null;
  isCombo: boolean;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
}
interface PaginatedServiceResponse {
  data: Service[];
  total: number;
}

export interface CreateServiceDto {
  name: string;
  categoryId?: number;
  description?: string;
  durationMinutes: number;
  price: number;
  discountPrice?: number;
  priceUSD?: number;
  imageUrl?: string;
  isCombo?: boolean;
  status?: ServiceStatus;
}

export type UpdateServiceDto = Partial<CreateServiceDto>;

export interface QueryServiceDto {
  search?: string;
  categoryId?: number;
  status?: ServiceStatus;
  isCombo?: boolean;
  hasDiscount?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'duration_asc' | 'duration_desc' | 'newest';
  page?: number;
  limit?: number;
}

export interface PaginatedServices {
  data: Service[];
  total: number;
  page: number;
  limit: number;
}
