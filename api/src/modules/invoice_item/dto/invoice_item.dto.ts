// src/invoice-items/dto/invoice-item.dto.ts
import { 
  IsNotEmpty, 
  IsNumber, 
  IsString, 
  IsEnum, 
  IsOptional, 
  Min,
  Max,
  Length,
  IsInt 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ItemType } from '../entities/invoice_item.entity';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  invoiceId: number;

  @ApiProperty({ enum: ItemType, example: ItemType.SERVICE })
  @IsNotEmpty()
  @IsEnum(ItemType)
  itemType: ItemType;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  itemId: number;

  @ApiPropertyOptional({ example: 'Hair Cut Service', maxLength: 200 })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  itemName?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  staffId?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ example: 150000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 10000, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ example: 140000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalPrice: number;
}

export class UpdateInvoiceItemDto extends PartialType(CreateInvoiceItemDto) {}


export class QueryInvoiceItemDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  invoiceId?: number;

  @ApiPropertyOptional({ enum: ItemType })
  @IsOptional()
  @IsEnum(ItemType)
  itemType?: ItemType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  staffId?: number;

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