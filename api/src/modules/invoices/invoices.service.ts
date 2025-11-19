import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, PaymentStatus } from './entities/invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceDto, QueryInvoiceDto, UpdatePaymentDto } from './invoices.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    // Check if voucher already exists
    const existingInvoice = await this.invoiceRepository.findOne({
      where: { voucher: createInvoiceDto.voucher }
    });

    if (existingInvoice) {
      throw new ConflictException(`Invoice with voucher ${createInvoiceDto.voucher} already exists`);
    }

    if (createInvoiceDto.paidAmount && createInvoiceDto.paidAmount > createInvoiceDto.totalAmount) {
      throw new BadRequestException('Paid amount cannot exceed total amount');
    }

    const invoice = this.invoiceRepository.create(createInvoiceDto);
    
    if (invoice.paidAmount && invoice.paidAmount >= invoice.totalAmount) {
      invoice.paymentStatus = PaymentStatus.PAID;
    }

    return await this.invoiceRepository.save(invoice);
  }

  async findAll(query: QueryInvoiceDto = {}) {
    const { 
      page = 1, 
      limit = 10, 
      voucher,
      customerId, 
      storeId, 
      bookingId,
      paymentStatus,
      startDate,
      endDate 
    } = query;
    
    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.customer', 'customer')
      .leftJoinAndSelect('invoice.store', 'store')
      .leftJoinAndSelect('invoice.booking', 'booking')
      .leftJoinAndSelect('invoice.creator', 'creator');

    if (voucher) {
      queryBuilder.andWhere('invoice.voucher = :voucher', { voucher });
    }

    if (customerId) {
      queryBuilder.andWhere('invoice.customerId = :customerId', { customerId });
    }

    if (storeId) {
      queryBuilder.andWhere('invoice.storeId = :storeId', { storeId });
    }

    if (bookingId) {
      queryBuilder.andWhere('invoice.bookingId = :bookingId', { bookingId });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('invoice.paymentStatus = :paymentStatus', { paymentStatus });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('invoice.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('invoice.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['customer', 'store', 'booking', 'creator'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async findByVoucher(voucher: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { voucher },
      relations: ['customer', 'store', 'booking', 'creator'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with voucher ${voucher} not found`);
    }

    return invoice;
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);

    // If updating voucher, check for duplicates
    if (updateInvoiceDto.voucher && updateInvoiceDto.voucher !== invoice.voucher) {
      const existingInvoice = await this.invoiceRepository.findOne({
        where: { voucher: updateInvoiceDto.voucher }
      });
      
      if (existingInvoice) {
        throw new ConflictException(`Invoice with voucher ${updateInvoiceDto.voucher} already exists`);
      }
    }

    Object.assign(invoice, updateInvoiceDto);

    // Auto update payment status
    if (invoice.paidAmount && invoice.paidAmount >= invoice.totalAmount) {
      invoice.paymentStatus = PaymentStatus.PAID;
    } else {
      invoice.paymentStatus = PaymentStatus.PENDING;
    }

    return await this.invoiceRepository.save(invoice);
  }

  async remove(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    await this.invoiceRepository.remove(invoice);
  }

  async updatePayment(id: number, updatePaymentDto: UpdatePaymentDto): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (updatePaymentDto.paidAmount > invoice.totalAmount) {
      throw new BadRequestException('Paid amount cannot exceed total amount');
    }

    invoice.paidAmount = updatePaymentDto.paidAmount;
    
    if (updatePaymentDto.notes) {
      invoice.notes = updatePaymentDto.notes;
    }

    // Auto update payment status
    if (invoice.paidAmount && invoice.paidAmount >= invoice.totalAmount) {
      invoice.paymentStatus = PaymentStatus.PAID;
    } else {
      invoice.paymentStatus = PaymentStatus.PENDING;
    }

    return await this.invoiceRepository.save(invoice);
  }

  async getRevenueByStore(storeId: number, startDate: string, endDate: string) {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.totalAmount)', 'totalRevenue')
      .addSelect('SUM(invoice.paidAmount)', 'totalPaid')
      .addSelect('COUNT(invoice.id)', 'totalInvoices')
      .where('invoice.storeId = :storeId', { storeId })
      .andWhere('invoice.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .getRawOne();

    return {
      storeId,
      period: { startDate, endDate },
      totalRevenue: parseFloat(result.totalRevenue) || 0,
      totalPaid: parseFloat(result.totalPaid) || 0,
      totalInvoices: parseInt(result.totalInvoices) || 0,
      unpaidAmount: (parseFloat(result.totalRevenue) || 0) - (parseFloat(result.totalPaid) || 0)
    };
  }
}