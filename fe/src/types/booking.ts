// types/booking.ts
import { Customer as CustomerType } from './customer';

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    NO_SHOW = 'no_show'
}

// export interface Customer {
//     id: number;
//     full_name: string; 
//     phone: string;
//     email: string | null;
// }
export type Customer = CustomerType;

export interface Store {
    id: number;
    name: string;
    address: string;
}


export interface Booking {
    id: number;
    customerId: number;
    customer?: Customer;
    storeId: number;
    store?: Store;
    bookingDate: string; 
    startTime: string;   
    endTime: string | null; 
    status: BookingStatus;
    source: string | null;
    notes: string | null;
    confirm: boolean;
    createdBy: number | null;
    createdAt: string;
    updatedAt: string;
}

// Interface cho Response trả về từ findAll (có phân trang)
export interface BookingResponse {
    data: Booking[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Payload khi tạo mới (CreateBookingDto)
export interface CreateBookingPayload {
    customerId: number;
    storeId: number;
    bookingDate: string;
    startTime: string;
    endTime?: string;
    status?: BookingStatus;
    source?: string;
    notes?: string;
    confirm?: boolean;
}

// Payload khi cập nhật (UpdateBookingDto)
export type UpdateBookingPayload = Partial<CreateBookingPayload>;

// Query params cho filter
export interface BookingFilters {
    page?: number;
    limit?: number;
    customerId?: number;
    storeId?: number;
    bookingDate?: string;
    status?: BookingStatus;
}