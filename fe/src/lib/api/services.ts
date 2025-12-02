import api from './axios';
import {
  Service,
  ServiceCategory,
  CreateServiceDto,
  UpdateServiceDto,
  QueryServiceDto,
  PaginatedServices,
} from '@/types';
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const getServices = async (
  params: QueryServiceDto,
): Promise<PaginatedServices> => {
  const { data } = await api.get<ApiResponse<PaginatedServices>>('/services', { params });
  return data.data; 
};

export const getService = async (id: number): Promise<Service> => {
  const { data } = await api.get<ApiResponse<Service>>(`/services/${id}`);
  return data.data;
};

export const createService = async (
  serviceData: CreateServiceDto,
): Promise<Service> => {
  const { data } = await api.post<ApiResponse<Service>>('/services', serviceData);
  return data.data;
};

export const updateService = async (
  id: number,
  serviceData: UpdateServiceDto,
): Promise<Service> => {
  const { data } = await api.patch<ApiResponse<Service>>(`/services/${id}`, serviceData);
  return data.data;
};

export const deleteService = async (id: number): Promise<void> => {
  await api.delete(`/services/${id}`);
};
