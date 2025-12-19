
import { Customer as CustomerType } from './customer';
import { Invoice } from './invoice';
import { ItemType } from './invoice-item';

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
export interface PendingInvoiceItem {
    id: number; 
    itemType: ItemType;
    itemId: number;
    itemName: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    totalPrice: number;
    staffId?: number;
    staff_name?: string;
}


export interface Booking {
    id: number;
    customerId: number | null;
    customer?: Customer;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    pendingInvoiceItems?: PendingInvoiceItem[];
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
    invoices?: Invoice[];
}

export interface BookingResponse {
    data: Booking[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface CreateBookingPayload {
    customerId?: number;
    storeId: number;
    bookingDate: string;
    startTime: string;
    endTime?: string;
    status?: BookingStatus;
    source?: string;
    notes?: string;
    confirm?: boolean;
    pendingInvoiceItems?: CreatePendingInvoiceItemPayload[];
}

export type UpdateBookingPayload = Partial<CreateBookingPayload>;

export interface BookingFilters {
    page?: number;
    limit?: number;
    customerId?: number;
    storeId?: number;
    bookingDate?: string;
    status?: BookingStatus;
}
export interface CreatePendingInvoiceItemPayload {
    itemType: ItemType;
    itemId: number;
    itemName?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    totalPrice: number;
    staffId?: number | null;
}