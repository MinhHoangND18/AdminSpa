import api from './axios';
import {
  ServiceCategory,
  QueryServiceCategoryDto,
  PaginatedServiceCategories,
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
} from '@/types';

// Interface cho response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const getServiceCategories = async (
  params: QueryServiceCategoryDto,
): Promise<PaginatedServiceCategories> => {
  const { data } = await api.get<ApiResponse<PaginatedServiceCategories>>(
    '/service-categories',
    { params },
  );
  
  // Debug log
  console.log('Raw API Response:', data);
  console.log('Actual Data:', data.data);
  
  // Trả về data thật từ wrapper
  return data.data;
};

export const getActiveServiceCategories = async (): Promise<ServiceCategory[]> => {
  const { data } = await api.get<ApiResponse<ServiceCategory[]>>('/service-categories/active');
  
  // Xử lý nhiều trường hợp response format
  if (data && typeof data === 'object') {
    // Nếu có wrapper { success, data, timestamp }
    if ('data' in data) {
      const innerData = data.data;
      // Nếu innerData cũng có wrapper nữa
      if (innerData && typeof innerData === 'object' && 'data' in innerData) {
        return Array.isArray(innerData.data) ? innerData.data : [];
      }
      return Array.isArray(innerData) ? innerData : [];
    }
  }
  
  return Array.isArray(data) ? data : [];
};

export const createServiceCategory = async (
  categoryData: CreateServiceCategoryDto,
): Promise<ServiceCategory> => {
  const { data } = await api.post<ApiResponse<ServiceCategory>>(
    '/service-categories',
    categoryData,
  );
  
  // Trả về data thật từ wrapper
  return data.data;
};

export const updateServiceCategory = async (
  id: number,
  categoryData: UpdateServiceCategoryDto,
): Promise<ServiceCategory> => {
  const { data } = await api.patch<ApiResponse<ServiceCategory>>(
    `/service-categories/${id}`,
    categoryData,
  );
  
  // Trả về data thật từ wrapper
  return data.data;
};

export const deleteServiceCategory = async (id: number): Promise<void> => {
  await api.delete(`/service-categories/${id}`);
};