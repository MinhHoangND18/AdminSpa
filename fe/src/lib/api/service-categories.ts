import api from './axios';
import {
  ServiceCategory,
  QueryServiceCategoryDto,
  PaginatedServiceCategories,
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
} from '@/types';

export const getServiceCategories = async (
  params: QueryServiceCategoryDto,
): Promise<PaginatedServiceCategories> => {
  const { data } = await api.get<PaginatedServiceCategories>(
    '/service-categories',
    { params },
  );
  return data;
};

export const getActiveServiceCategories = async (): Promise<ServiceCategory[]> => {
  const { data } = await api.get<ServiceCategory[]>('/service-categories/active');
  return Array.isArray(data) ? data : [];
};

export const createServiceCategory = async (
  categoryData: CreateServiceCategoryDto,
): Promise<ServiceCategory> => {
  const { data } = await api.post<ServiceCategory>(
    '/service-categories',
    categoryData,
  );
  return data;
};

export const updateServiceCategory = async (
  id: number,
  categoryData: UpdateServiceCategoryDto,
): Promise<ServiceCategory> => {
  const { data } = await api.patch<ServiceCategory>(
    `/service-categories/${id}`,
    categoryData,
  );
  return data;
};

export const deleteServiceCategory = async (id: number): Promise<void> => {
  await api.delete(`/service-categories/${id}`);
};
