// fe/src/types/invoice.ts

import { Customer } from './customer';
import { Store } from './store';
import { Booking } from './booking';
import { InvoiceItem, ItemType } from './invoice-item';

export enum DiscountType {
  AMOUNT = 'amount',
  PERCENT = 'percent',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
}

export interface Invoice {
  id: number;
  voucher: string;
  bookingId: number | null;
  booking?: Booking;
  customerId: number;
  customer?: Customer;
  storeId: number;
  store?: Store;
  subtotal: number;
  discountAmount: number;
  discountType: DiscountType | null;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  notes: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItem[];
}

export interface NestedCreateInvoiceItemDto {
  itemType: ItemType;
  itemId: number;
  itemName?: string;
  staffId?: number;
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalPrice: number;
}

export interface CreateInvoiceDto {
  voucher: string;
  customerId: number;
  storeId: number;
  subtotal: number;
  totalAmount: number;
  items: NestedCreateInvoiceItemDto[];
  bookingId?: number | null;
  discountAmount?: number;
  discountType?: DiscountType;
  taxAmount?: number;
  paidAmount?: number;
  paymentStatus?: PaymentStatus;
  notes?: string | null;
  createdBy?: number;
}

export type UpdateInvoiceDto = Partial<CreateInvoiceDto>;

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}
export enum InvoiceSortBy {
    ID = 'id',
    CREATED_AT = 'createdAt',
    TOTAL_AMOUNT = 'totalAmount',
}
export interface QueryInvoiceDto {
  page?: number;
  limit?: number;
  voucher?: string;
  customerId?: number;
  storeId?: number;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: InvoiceSortBy; 
    order?: SortOrder;
}