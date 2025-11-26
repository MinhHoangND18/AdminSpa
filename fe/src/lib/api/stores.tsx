
import api from './axios';
import { Store } from '@/types/store';


export const storesApi = {
  getAll: async (params?: { 
    search?: string; 
    isActive?: boolean; 
    page?: number; 
    limit?: number 
  }) => {
    const response = await api.get<Store[]>( '/stores', { params });
    return response.data; 
  },
  
  getById: async (id: number) => {
    const response = await api.get<Store>(`/stores/${id}`);
    return response.data; 
  },
  
  create: async (data: Partial<Store>) => {
    const response = await api.post('/stores', data);
    return response.data;
  },
  
  update: async (id: number, data: Partial<Store>) => {
    const response = await api.patch(`/stores/${id}`, data);
    return response.data;
  },
  
  remove: async (id: number) => {
    await api.delete(`/stores/${id}`);
  },
};