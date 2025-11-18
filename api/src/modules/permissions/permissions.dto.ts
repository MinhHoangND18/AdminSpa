import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'View Users' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'users.view' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ example: 'users' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  module?: string;

  @ApiPropertyOptional({ example: 'Permission to view users list' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}

export class FilterPermissionDto {
  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'users' })
  @IsString()
  @IsOptional()
  module?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}

export class AssignPermissionDto {
  @ApiProperty({ example: 'store_admin' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  permission_id: number;
}