import { API_ENDPOINTS } from '@/constants/api-endpoints';
import {
  CreateBookingPayload,
  UpdateBookingPayload,
  Booking,
  BookingResponse,
  BookingFilters
} from '@/types/booking';
import api from './axios';

interface CompleteServicePayload {
  storeId: number;
  subtotal: number;
  totalAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  notes?: string;
  paymentStatus: string;
  items: Array<{
    itemType: string;
    itemId: number;
    itemName?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    staffId?: number;
  }>;
}

export type { CompleteServicePayload };

interface ApiResponseWrapper {
    success: boolean;
    data: BookingResponse; 
}

export const getBookings = async (filters: BookingFilters): Promise<BookingResponse> => {
  const response = await api.get<ApiResponseWrapper>('/bookings', { params: filters });

  return response.data.data; 
}

export const getBooking = async (id: number) => {
  const { data } = await api.get(`${API_ENDPOINTS.BOOKINGS}/${id}`);
  return data as Booking;
};


export const createBooking = async (booking: CreateBookingPayload) => {
  const { data } = await api.post(API_ENDPOINTS.BOOKINGS, booking);
  return data;
};

export const updateBooking = async (id: number, booking: UpdateBookingPayload) => {
  const { data } = await api.patch(`${API_ENDPOINTS.BOOKINGS}/${id}`, booking);
  return data;
};

export const deleteBooking = async (id: number) => {
  const { data } = await api.delete(`${API_ENDPOINTS.BOOKINGS}/${id}`);
  return data;
};

export const confirmBooking = async (id: number) => {
  const { data } = await api.patch(`${API_ENDPOINTS.BOOKINGS}/${id}/confirm`);
  return data;
};

export const cancelBooking = async (id: number) => {
  const { data } = await api.patch(`${API_ENDPOINTS.BOOKINGS}/${id}/cancel`);
  return data;
};

export const startService = async (id: number) => {
  const { data } = await api.post(`${API_ENDPOINTS.BOOKINGS}/${id}/start`);
  return data;
};

export const completeService = async (id: number, invoiceData: CompleteServicePayload) => {
  const { data } = await api.post(`${API_ENDPOINTS.BOOKINGS}/${id}/complete`, invoiceData);
  return data;
};

export const getBookingsByDateRange = async (storeId: number, startDate: string, endDate: string) => {
  const { data } = await api.get(`${API_ENDPOINTS.BOOKINGS}/store/${storeId}/date-range`, {
    params: { startDate, endDate },
  });
  return data as Booking[];
};