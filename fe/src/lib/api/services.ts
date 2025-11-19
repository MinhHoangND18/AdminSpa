import api from './axios';
import {
  Service,
  ServiceCategory,
  CreateServiceDto,
  UpdateServiceDto,
  QueryServiceDto,
  PaginatedServices,
} from '@/types';

export const getServices = async (
  params: QueryServiceDto,
): Promise<PaginatedServices> => {
  const { data } = await api.get<PaginatedServices>('/services', { params });
  return data;
};

export const getService = async (id: number): Promise<Service> => {
  const { data } = await api.get<Service>(`/services/${id}`);
  return data;
};

export const createService = async (
  serviceData: CreateServiceDto,
): Promise<Service> => {
  const { data } = await api.post<Service>('/services', serviceData);
  return data;
};

export const updateService = async (
  id: number,
  serviceData: UpdateServiceDto,
): Promise<Service> => {
  const { data } = await api.patch<Service>(`/services/${id}`, serviceData);
  return data;
};

export const deleteService = async (id: number): Promise<void> => {
  await api.delete(`/services/${id}`);
};
