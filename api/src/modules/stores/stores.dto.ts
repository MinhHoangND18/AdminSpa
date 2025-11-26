import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsNumber,
  MaxLength,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class CreateStoreDto {
  @ApiProperty({ maxLength: 20, example: 'ST001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ maxLength: 150, example: 'Cửa hàng Hà Nội' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ maxLength: 150, example: 'hanoi.store.com' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  domain?: string;

  @ApiProperty({ maxLength: 255, example: '123 Đường ABC, Hà Nội' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @ApiPropertyOptional({ maxLength: 20, example: '0123456789' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ maxLength: 100, example: 'store@example.com' })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ example: 'Mô tả cửa hàng' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '8:00 AM - 10:00 PM' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  openingHours?: string;

  @ApiPropertyOptional({ example: 21.028511 })
  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 105.804817 })
  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  manager_id?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateStoreDto extends PartialType(CreateStoreDto) {}

export class QueryStoreDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}