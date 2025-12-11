// fe/src/lib/api/invoices.ts

import  api  from './axios';
import { 
  Invoice, 
  QueryInvoiceDto, 
  CreateInvoiceDto, 
  UpdateInvoiceDto 
} from '@/types/invoice';
import { PagedData, ApiResponse } from '@/types';

export const getInvoices = async (params: QueryInvoiceDto): Promise<PagedData<Invoice>> => {
  const response = await api.get<ApiResponse<PagedData<Invoice>>>('/invoices', { params });
  return response.data.data; 
};

export const getInvoiceById = async (id: number): Promise<Invoice> => {
  const response = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`);
  return response.data.data;
};

export const createInvoice = async (data: CreateInvoiceDto): Promise<Invoice> => {
  const response = await api.post<ApiResponse<Invoice>>('/invoices', data);
  return response.data.data;
};

export const updateInvoice = async (id: number, data: UpdateInvoiceDto): Promise<Invoice> => {
  const response = await api.patch<ApiResponse<Invoice>>(`/invoices/${id}`, data);
  return response.data.data;
};

export const deleteInvoice = async (id: number): Promise<void> => {
  await api.delete(`/invoices/${id}`);
};