// src/invoice-items/invoice-items.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InvoiceItemsService } from './invoice_items.service';
import { CreateInvoiceItemDto, UpdateInvoiceItemDto, QueryInvoiceItemDto } from './dto/invoice_item.dto';

@ApiTags('invoice-items')
@Controller('invoice-items')
export class InvoiceItemsController {
  constructor(private readonly invoiceItemsService: InvoiceItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice item' })
  @ApiResponse({ status: 201, description: 'Invoice item created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createInvoiceItemDto: CreateInvoiceItemDto) {
    return this.invoiceItemsService.create(createInvoiceItemDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple invoice items' })
  @ApiResponse({ status: 201, description: 'Invoice items created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createMultiple(@Body() createInvoiceItemDtos: CreateInvoiceItemDto[]) {
    return this.invoiceItemsService.createMultiple(createInvoiceItemDtos);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoice items with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Return all invoice items' })
  findAll(@Query() query: QueryInvoiceItemDto = {}) {
    return this.invoiceItemsService.findAll(query);
  }

  @Get('invoice/:invoiceId')
  @ApiOperation({ summary: 'Get all items by invoice ID' })
  @ApiResponse({ status: 200, description: 'Return invoice items' })
  findByInvoiceId(@Param('invoiceId', ParseIntPipe) invoiceId: number) {
    return this.invoiceItemsService.findByInvoiceId(invoiceId);
  }

  @Get('invoice/:invoiceId/total')
  @ApiOperation({ summary: 'Calculate total amount for an invoice' })
  @ApiResponse({ status: 200, description: 'Return total amount' })
  calculateInvoiceTotal(@Param('invoiceId', ParseIntPipe) invoiceId: number) {
    return this.invoiceItemsService.calculateInvoiceTotal(invoiceId);
  }

  @Get('staff/:staffId')
  @ApiOperation({ summary: 'Get items by staff with optional date range' })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-10-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-10-31' })
  @ApiResponse({ status: 200, description: 'Return staff items' })
  getItemsByStaff(
    @Param('staffId', ParseIntPipe) staffId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.invoiceItemsService.getItemsByStaff(staffId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice item by id' })
  @ApiResponse({ status: 200, description: 'Return the invoice item' })
  @ApiResponse({ status: 404, description: 'Invoice item not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceItemsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an invoice item' })
  @ApiResponse({ status: 200, description: 'Invoice item updated successfully' })
  @ApiResponse({ status: 404, description: 'Invoice item not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInvoiceItemDto: UpdateInvoiceItemDto,
  ) {
    return this.invoiceItemsService.update(id, updateInvoiceItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an invoice item' })
  @ApiResponse({ status: 204, description: 'Invoice item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Invoice item not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceItemsService.remove(id);
  }

  @Delete('invoice/:invoiceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all items of an invoice' })
  @ApiResponse({ status: 204, description: 'Invoice items deleted successfully' })
  removeByInvoiceId(@Param('invoiceId', ParseIntPipe) invoiceId: number) {
    return this.invoiceItemsService.removeByInvoiceId(invoiceId);
  }
}