import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Invoice, PaymentStatus } from './entities/invoice.entity';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  QueryInvoiceDto,
  UpdatePaymentDto,
} from './invoices.dto';
import { Product } from '../products/entities/products.entity';
import {
  InvoiceItem,
  ItemType,
} from '../invoice_item/entities/invoice_item.entity';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const { items, bookingId, ...invoiceData } = createInvoiceDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if voucher already exists
      const existingInvoice = await queryRunner.manager.findOne(Invoice, {
        where: { voucher: invoiceData.voucher },
      });

      if (existingInvoice) {
        throw new ConflictException(
          `Invoice with voucher ${invoiceData.voucher} already exists`,
        );
      }

      if (invoiceData.paidAmount && invoiceData.paidAmount > invoiceData.totalAmount) {
        throw new BadRequestException('Paid amount cannot exceed total amount');
      }

      const invoice = queryRunner.manager.create(Invoice, invoiceData);
      if (bookingId) {
        invoice.bookingId = bookingId;
      }
      
      if (invoice.paidAmount && invoice.paidAmount >= invoice.totalAmount) {
        invoice.paymentStatus = PaymentStatus.PAID;
      }
      const savedInvoice = await queryRunner.manager.save(invoice);

      for (const item of items) {
        if (item.itemType === ItemType.PRODUCT) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.itemId },
            lock: { mode: 'pessimistic_write' }, // Lock the row for update
          });

          if (!product) {
            throw new NotFoundException(`Product with ID ${item.itemId} not found.`);
          }

          if (product.quantity_stock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for product "${product.name}". Available: ${product.quantity_stock}, Requested: ${item.quantity}`,
            );
          }

          product.quantity_stock -= item.quantity;
          await queryRunner.manager.save(product);
        }

        // Create and save the invoice item
        const invoiceItem = queryRunner.manager.create(InvoiceItem, {
          ...item,
          invoiceId: savedInvoice.id,
        });
        await queryRunner.manager.save(invoiceItem);
      }

      await queryRunner.commitTransaction();
      return savedInvoice;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err; // Re-throw the original error
    } finally {
      await queryRunner.release();
    }
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
      endDate,
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
      queryBuilder.andWhere('invoice.paymentStatus = :paymentStatus', {
        paymentStatus,
      });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('invoice.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
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

  async update(
    id: number,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id);

    // If updating voucher, check for duplicates
    if (
      updateInvoiceDto.voucher &&
      updateInvoiceDto.voucher !== invoice.voucher
    ) {
      const existingInvoice = await this.invoiceRepository.findOne({
        where: { voucher: updateInvoiceDto.voucher },
      });

      if (existingInvoice) {
        throw new ConflictException(
          `Invoice with voucher ${updateInvoiceDto.voucher} already exists`,
        );
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
    // This also needs to be transactional to add stock back
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invoice = await queryRunner.manager.findOne(Invoice, {
        where: { id },
      });
      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

      const items = await queryRunner.manager.find(InvoiceItem, {
        where: { invoiceId: id },
      });

      for (const item of items) {
        if (item.itemType === ItemType.PRODUCT) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.itemId },
            lock: { mode: 'pessimistic_write' },
          });
          if (product) {
            product.quantity_stock += item.quantity;
            await queryRunner.manager.save(product);
          }
        }
      }

      await queryRunner.manager.remove(items); // remove invoice items
      await queryRunner.manager.remove(invoice); // remove invoice

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updatePayment(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Invoice> {
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

  async getRevenueByStore(
    storeId: number,
    startDate: string,
    endDate: string,
  ) {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.totalAmount)', 'totalRevenue')
      .addSelect('SUM(invoice.paidAmount)', 'totalPaid')
      .addSelect('COUNT(invoice.id)', 'totalInvoices')
      .where('invoice.storeId = :storeId', { storeId })
      .andWhere('invoice.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    return {
      storeId,
      period: { startDate, endDate },
      totalRevenue: parseFloat(result.totalRevenue) || 0,
      totalPaid: parseFloat(result.totalPaid) || 0,
      totalInvoices: parseInt(result.totalInvoices) || 0,
      unpaidAmount:
        (parseFloat(result.totalRevenue) || 0) -
        (parseFloat(result.totalPaid) || 0),
    };
  }
}