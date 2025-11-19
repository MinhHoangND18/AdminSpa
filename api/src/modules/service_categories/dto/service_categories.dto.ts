import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsInt,
  MaxLength,
  IsNotEmpty,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class CreateServiceCategoryDto {
  @ApiProperty({ maxLength: 100, example: 'Dịch vụ cắt tóc' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    maxLength: 100,
    example: 'dich-vu-cat-toc',
    description: 'Slug cho SEO, tự động tạo từ name nếu không cung cấp',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase, numbers and hyphens only',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'Các dịch vụ cắt tóc chuyên nghiệp' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateServiceCategoryDto extends PartialType(
  CreateServiceCategoryDto,
) {}

export class QueryServiceCategoryDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên hoặc slug' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái active' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Sắp xếp theo displayOrder',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  sortByOrder?: boolean;

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

export class ReorderCategoryDto {
  @ApiProperty({
    example: [1, 3, 2, 4],
    description: 'Mảng ID danh mục theo thứ tự mới',
  })
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  categoryIds: number[];
}