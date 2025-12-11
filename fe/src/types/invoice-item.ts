// fe/src/types/invoice_item.ts

export enum ItemType {
  SERVICE = 'service',
  PRODUCT = 'product',
  PACKAGE = 'package',
}

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  itemType: ItemType;
  itemId: number;
  itemName: string;
  staffId: number | null;
  staffName?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface CreateInvoiceItemDto {
  invoiceId: number;
  itemType: ItemType;
  itemId: number;
  itemName?: string;
  staffId?: number;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}