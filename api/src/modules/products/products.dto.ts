import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, Max } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  quantity_stock: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}