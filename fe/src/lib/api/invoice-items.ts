// fe/src/lib/api/invoice_items.ts

import  api  from './axios';
import { InvoiceItem, CreateInvoiceItemDto } from '@/types/invoice-item';
import { ApiResponse } from '@/types';

export const getItemsByInvoiceId = async (invoiceId: number): Promise<InvoiceItem[]> => {
  const response = await api.get<ApiResponse<InvoiceItem[]>>(`/invoice-items/invoice/${invoiceId}`);
  return response.data.data;
};

export const createInvoiceItems = async (items: CreateInvoiceItemDto[]): Promise<InvoiceItem[]> => {
  const response = await api.post<ApiResponse<InvoiceItem[]>>('/invoice-items/bulk', items);
  return response.data.data;
};

export const deleteInvoiceItem = async (id: number): Promise<void> => {
  await api.delete(`/invoice-items/${id}`);
};

export const deleteInvoiceItemsByInvoiceId = async (invoiceId: number): Promise<void> => {
  await api.delete(`/invoice-items/invoice/${invoiceId}`);
};