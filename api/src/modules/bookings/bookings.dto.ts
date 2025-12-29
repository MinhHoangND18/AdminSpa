
import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  Matches,
  ValidateNested,
  IsEmail,
  MaxLength,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BookingStatus } from '../bookings/entities/booking.entity';
import { NestedCreateInvoiceItemDto } from '../invoices/invoices.dto';
import { DiscountType } from '../invoices/entities/invoice.entity';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  storeId: number;

  @ApiProperty({ example: '2025-10-20' })
  @IsNotEmpty()
  @IsDateString()
  bookingDate: string;

  @ApiProperty({ example: '09:00:00' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in format HH:MM',
  })
  startTime: string;

  @ApiPropertyOptional({ example: '10:00:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in format HH:MM',
  })
  endTime?: string;

  @ApiPropertyOptional({ enum: BookingStatus, default: BookingStatus.PENDING })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ example: 'website' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: 'Special request: Window seat' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsNumber()
  orderDiscount?: number;

  @ApiPropertyOptional({ example: 'VIP Customer' })
  @IsOptional()
  @IsString()
  discountReason?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  createdBy?: number;

  @ApiPropertyOptional({ type: () => [NestedCreateInvoiceItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NestedCreateInvoiceItemDto)
  pendingInvoiceItems?: NestedCreateInvoiceItemDto[];
}

export class UpdateBookingDto extends PartialType(CreateBookingDto) {}

export class QueryBookingDto {
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

  @ApiPropertyOptional({ example: '2025-10-20' })
  @IsOptional()
  @IsDateString()
  bookingDate?: string;

  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

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


class CustomerForBookingDto {
  @ApiProperty({ maxLength: 100, example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ maxLength: 15, example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  phone: string;

  @ApiPropertyOptional({ maxLength: 100, example: 'customer@example.com' })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;
}

class BookingDataDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  storeId: number;

  @ApiProperty({ example: '2025-10-20' })
  @IsNotEmpty()
  @IsDateString()
  bookingDate: string;

  @ApiProperty({ example: '09:00' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in format HH:MM',
  })
  startTime: string;

  @ApiPropertyOptional({ example: 'Special request: Window seat' })
  @IsOptional()
  @IsString()
  notes?: string;
}

class InvoiceDataDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  storeId: number;

  @ApiProperty()
  @IsNumber()
  subtotal: number;

  @ApiProperty()
  @IsNumber()
  discountAmount: number;

  @ApiProperty()
  @IsNumber()
  taxAmount: number;

  @ApiProperty()
  @IsNumber()
  totalAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: () => [NestedCreateInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NestedCreateInvoiceItemDto)
  items: NestedCreateInvoiceItemDto[];
}

export class CreateBookingOrderDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CustomerForBookingDto)
  customer: CustomerForBookingDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => BookingDataDto)
  booking: BookingDataDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => InvoiceDataDto)
  invoice: InvoiceDataDto;
}

export class CompleteServiceDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  storeId: number;

  @ApiProperty()
  @IsNumber()
  subtotal: number;

  @ApiProperty()
  @IsNumber()
  totalAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiPropertyOptional({ enum: ['amount', 'percent'] })
  @IsOptional()
  @IsEnum(['amount', 'percent'])
  discountType?: 'amount' | 'percent';

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsString()
  paymentStatus: string;

  @ApiProperty({ type: () => [NestedCreateInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NestedCreateInvoiceItemDto)
  items: NestedCreateInvoiceItemDto[];
}