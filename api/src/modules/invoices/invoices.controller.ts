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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, QueryInvoiceDto, UpdatePaymentDto } from './invoices.dto';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Voucher already exists' })
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    console.log('Received DTO to create invoice:', createInvoiceDto);
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Return all invoices' })
  findAll(@Query() query: QueryInvoiceDto = {}) {
    return this.invoicesService.findAll(query);
  }

  @Get('voucher/:voucher')
  @ApiOperation({ summary: 'Get an invoice by voucher code' })
  @ApiResponse({ status: 200, description: 'Return the invoice' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findByVoucher(@Param('voucher') voucher: string) {
    return this.invoicesService.findByVoucher(voucher);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by id' })
  @ApiResponse({ status: 200, description: 'Return the invoice' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 409, description: 'Voucher already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an invoice' })
  @ApiResponse({ status: 204, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.remove(id);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Update payment information' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment amount' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  updatePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.invoicesService.updatePayment(id, updatePaymentDto);
  }

  @Get('store/:storeId/revenue')
  @ApiOperation({ summary: 'Get revenue report by store and date range' })
  @ApiQuery({ name: 'startDate', example: '2025-10-01' })
  @ApiQuery({ name: 'endDate', example: '2025-10-31' })
  @ApiResponse({ status: 200, description: 'Return revenue report' })
  getRevenueByStore(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.invoicesService.getRevenueByStore(storeId, startDate, endDate);
  }
}