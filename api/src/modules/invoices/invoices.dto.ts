// src/invoices/dto/invoice.dto.ts
import { 
  IsNotEmpty, 
  IsNumber, 
  IsString, 
  IsEnum, 
  IsOptional, 
  Min,
  Length 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DiscountType, PaymentStatus } from '../invoices/entities/invoice.entity';

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

  @ApiProperty({ example: 1000000.50 })
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