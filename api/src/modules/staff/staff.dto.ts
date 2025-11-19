import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsInt,
  IsNumber,
  IsDateString,
  Min,
  Max,
  MaxLength,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Gender, SalaryType, StaffStatus } from './entities/staff.entity';

export class CreateStaffDto {
  @ApiProperty({ example: 'STF001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  full_name: string;

  @ApiProperty({ example: '0912345678' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10,15}$/, { message: 'Phone must be 10-15 digits' })
  phone: string;

  @ApiPropertyOptional({ example: 'staff@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  birthday?: Date;

  @ApiPropertyOptional({ example: '123 Street, City' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  store_id?: number;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  hire_date?: Date;

  @ApiPropertyOptional({ enum: SalaryType, example: SalaryType.FIXED })
  @IsEnum(SalaryType)
  @IsOptional()
  salary_type?: SalaryType;

  @ApiPropertyOptional({ example: 15000000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  base_salary?: number;

  @ApiPropertyOptional({ example: 10.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  commission_rate?: number;

  @ApiPropertyOptional({ enum: StaffStatus, example: StaffStatus.ACTIVE })
  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}

export class FilterStaffDto {
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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: StaffStatus })
  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;

  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  store_id?: number;

  @ApiPropertyOptional({ enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ enum: SalaryType })
  @IsEnum(SalaryType)
  @IsOptional()
  salary_type?: SalaryType;
} 