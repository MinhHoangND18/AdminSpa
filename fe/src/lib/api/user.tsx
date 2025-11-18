import api from './axios';
import { User } from '@/types/user';

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User>) => api.post('/users', data),
  update: (id: number, data: Partial<User>) => api.put(`/users/${id}`, data),
  remove: (id: number) => api.delete(`/users/${id}`),
};
