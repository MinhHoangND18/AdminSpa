// src/invoices/dto/invoice.dto.ts
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  Min,
  Length,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  DiscountType,
  PaymentStatus,
} from '../invoices/entities/invoice.entity';
import { ItemType } from '../invoice_item/entities/invoice_item.entity';

// This DTO is used when creating invoice items as part of a whole invoice
// It does not have invoiceId because the invoice is not yet created.
export class NestedCreateInvoiceItemDto {
  @ApiProperty({ enum: ItemType, example: ItemType.PRODUCT })
  @IsEnum(ItemType)
  @IsNotEmpty()
  itemType: ItemType;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  itemId: number;

  @ApiPropertyOptional({ example: 'Product Name', maxLength: 200 })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  itemName?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  staffId?: number;

  @ApiProperty({ example: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 10000, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ example: 140000 })
  @IsNumber()
  @Min(0)
  totalPrice: number;
}

// DTO cho việc tạo invoice mới
export class CreateInvoiceDto {
  @ApiProperty({ example: 'INV-2025-0001', maxLength: 20 })
  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  voucher: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  bookingId?: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  storeId: number;

  @ApiProperty({ example: 1000000.5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ enum: DiscountType })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiProperty({ example: 1000000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @ApiPropertyOptional({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ example: 'Payment received via bank transfer' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  createdBy?: number;

  @ApiProperty({ type: () => [NestedCreateInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NestedCreateInvoiceItemDto)
  items: NestedCreateInvoiceItemDto[];
}

// DTO cho việc cập nhật invoice
export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {}

// DTO cho việc query/filter invoice
export class QueryInvoiceDto {
  @ApiPropertyOptional({ example: 'INV-2025-0001' })
  @IsOptional()
  @IsString()
  voucher?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  customerId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  storeId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bookingId?: number;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ example: '2025-10-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-10-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}

// DTO cho việc cập nhật payment
export class UpdatePaymentDto {
  @ApiProperty({ example: 500000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  paidAmount: number;

  @ApiPropertyOptional({ example: 'Paid via credit card' })
  @IsOptional()
  @IsString()
  notes?: string;
}