import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsInt,
  IsUrl,
  MaxLength,
  IsNotEmpty,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ServiceStatus } from '../services/entities/service.entity';
import { Type, Transform } from 'class-transformer';

export class CreateServiceDto {
  @ApiProperty({ maxLength: 200, example: '' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 1, description: 'ID danh mục dịch vụ' })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ example: 'Cắt tóc nam theo phong cách hiện đại' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 30, description: 'Thời gian thực hiện (phút)' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({ example: 150000, description: 'Giá dịch vụ (VNĐ)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 120000,
    description: 'Giá sau khi giảm (phải nhỏ hơn giá gốc)',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @ValidateIf((o) => o.discountPrice !== null && o.discountPrice !== undefined)
  discountPrice?: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceUSD?: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsUrl()
  @IsOptional()
  @MaxLength(255)
  imageUrl?: string;

  @ApiPropertyOptional({ default: false, description: 'Đánh dấu là combo' })
  @IsBoolean()
  @IsOptional()
  isCombo?: boolean;

  @ApiPropertyOptional({ enum: ServiceStatus, default: ServiceStatus.ACTIVE })
  @IsEnum(ServiceStatus)
  @IsOptional()
  status?: ServiceStatus;
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}

export class QueryServiceDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên hoặc mô tả' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo danh mục' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({
    enum: ServiceStatus,
    description: 'Lọc theo trạng thái',
  })
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @ApiPropertyOptional({ description: 'Chỉ lấy combo' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isCombo?: boolean;

  @ApiPropertyOptional({ description: 'Chỉ lấy dịch vụ đang có giảm giá' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasDiscount?: boolean;

  @ApiPropertyOptional({ description: 'Giá tối thiểu' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Giá tối đa' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Thời gian tối thiểu (phút)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minDuration?: number;

  @ApiPropertyOptional({ description: 'Thời gian tối đa (phút)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxDuration?: number;

  @ApiPropertyOptional({
    enum: [
      'price_asc',
      'price_desc',
      'duration_asc',
      'duration_desc',
      'newest',
    ],
    description: 'Sắp xếp',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class ServiceStatisticsDto {
  @ApiPropertyOptional({ description: 'Lọc theo danh mục' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}
