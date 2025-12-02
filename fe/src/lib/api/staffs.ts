import apiClient from './axios';
import { Staff, StaffFormData, StaffFilters } from '@/types/staff';

interface StaffResponse {
  data: {
    data: Staff[];
    total: number;
    page: number;
    limit: number;
  }
}

export const getStaff = async (filters: StaffFilters): Promise<StaffResponse> => {
  const params = new URLSearchParams();
  if (filters.keyword) params.append('keyword', filters.keyword);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.store_id && filters.store_id !== 'all') params.append('store_id', filters.store_id.toString());
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await apiClient.get<StaffResponse>('/staff', { params });
  return response.data;
};

export const getStaffById = async (id: number): Promise<Staff> => {
  const response = await apiClient.get<Staff>(`/staff/${id}`);
  return response.data;
};

export const createStaff = async (data: StaffFormData): Promise<Staff> => {
  const response = await apiClient.post<Staff>('/staff', data);
  return response.data;
};

export const updateStaff = async ({ id, data }: { id: number; data: StaffFormData }): Promise<Staff> => {
  const response = await apiClient.put<Staff>(`/staff/${id}`, data);
  return response.data;
};

export const deleteStaff = async (id: number): Promise<void> => {
  await apiClient.delete(`/staff/${id}`);
};
