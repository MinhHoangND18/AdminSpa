
import api from './axios';
import { Store } from '@/types/store';

export const storesApi = {
  getAll: (params?: { search?: string; isActive?: boolean; page?: number; limit?: number }) =>
    api.get<Store[]>('/stores', { params }),
  getById: (id: number) => api.get<Store>(`/stores/${id}`),
  create: (data: Partial<Store>) => api.post('/stores', data),
  update: (id: number, data: Partial<Store>) => api.patch(`/stores/${id}`, data),
  remove: (id: number) => api.delete(`/stores/${id}`),
};
