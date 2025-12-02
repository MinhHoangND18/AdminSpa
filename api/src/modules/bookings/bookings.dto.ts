// src/bookings/dto/booking.dto.ts
import { IsNotEmpty, IsNumber, IsDateString, IsString, IsEnum, IsOptional, IsBoolean, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BookingStatus } from '../bookings/entities/booking.entity';

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
    message: 'startTime must be in format HH:MM'
  })
  startTime: string;

  @ApiPropertyOptional({ example: '10:00:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in format HH:MM'
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

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  createdBy?: number;
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