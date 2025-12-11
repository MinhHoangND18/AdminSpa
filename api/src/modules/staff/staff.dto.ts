import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsEmail,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum GenderEnum {
  male = 'male',
  female = 'female',
  other = 'other',
}

export enum SalaryTypeEnum {
  fixed = 'fixed',
  hourly = 'hourly',
  commission = 'commission',
}

export enum StaffStatusEnum {
  active = 'active',
  inactive = 'inactive',
  on_leave = 'on_leave',
}

export class CreateStaffDto {
  @IsString()
  full_name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  store_id?: number;

  @IsOptional()
  @IsDateString()
  hire_date?: string;

  @IsOptional()
  @IsEnum(SalaryTypeEnum)
  salary_type?: SalaryTypeEnum;

  @IsOptional()
  @IsNumber()
  base_salary?: number;

  @IsOptional()
  @IsNumber()
  commission_rate?: number;

  @IsOptional()
  @IsEnum(StaffStatusEnum)
  status?: StaffStatusEnum;
}

export class UpdateStaffDto extends CreateStaffDto {}

export class FilterStaffDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(StaffStatusEnum)
  status?: StaffStatusEnum;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  store_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) 
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}