
import api from './axios';
import { Store , StoreResponse} from '@/types/store';


export const storesApi = {
  getAll: async (params?: { 
    search?: string; 
    isActive?: boolean; 
    page?: number; 
    limit?: number 
  }): Promise<StoreResponse> => { 
    const response = await api.get<StoreResponse>( '/stores', { params }); 
    return response.data; 
  },
  
  getById: async (id: number) => {
    const response = await api.get<Store>(`/stores/${id}`);
    return response.data; 
  },
  
  create: async (data: Partial<Store>) => {
    const response = await api.post<Store>('/stores', data);
    return response.data;
  },
  
  update: async (id: number, data: Partial<Store>) => {
    const response = await api.patch<Store>(`/stores/${id}`, data);
    return response.data;
  },
  
  remove: async (id: number) => {
    await api.delete(`/stores/${id}`);
  },
};