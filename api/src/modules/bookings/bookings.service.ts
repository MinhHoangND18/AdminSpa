// src/bookings/bookings.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import {
  CreateBookingDto,
  UpdateBookingDto,
  QueryBookingDto,
  CreateBookingOrderDto,
} from './bookings.dto';
import { CreateInvoiceDto } from '../invoices/invoices.dto';
import { InvoicesService } from '../invoices/invoices.service';
import { PaymentStatus } from '../invoices/entities/invoice.entity';
import { CustomersService } from '../customers/customers.service';
import { Customer } from '../customers/entities/customer.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @Inject(InvoicesService)
    private readonly invoicesService: InvoicesService,
    @Inject(CustomersService)
    private readonly customersService: CustomersService,
  ) { }

  async createBookingFromOrder(orderDto: CreateBookingOrderDto): Promise<Booking> {
    const { customer: customerData, booking: bookingData, invoice: invoiceData } = orderDto;

    const booking = this.bookingRepository.create({
      ...bookingData,
      customerId: null,
      customerName: customerData.fullName,
      customerPhone: customerData.phone,
      customerCountryCode: customerData.country_code,
      customerEmail: customerData.email,
      pendingInvoiceItems: invoiceData.items,
      status: BookingStatus.PENDING,
      confirm: true,
      source: 'website',
    });

    return await this.bookingRepository.save(booking);
  }

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    if (
      createBookingDto.endTime &&
      createBookingDto.startTime >= createBookingDto.endTime
    ) {
      throw new BadRequestException('End time must be after start time');
    }

    const booking = this.bookingRepository.create(createBookingDto);
    const savedBooking = await this.bookingRepository.save(booking);

    return savedBooking;
  }

  async findAll(query: QueryBookingDto) {
    const {
      page = 1,
      limit = 10,
      customerId,
      storeId,
      bookingDate,
      status,
    } = query;

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.store', 'store')
      .leftJoinAndSelect('booking.creator', 'creator')
      .leftJoinAndSelect('booking.invoices', 'invoices');

    if (customerId) {
      queryBuilder.andWhere('booking.customerId = :customerId', { customerId });
    }

    if (storeId) {
      queryBuilder.andWhere('booking.storeId = :storeId', { storeId });
    }

    if (bookingDate) {
      queryBuilder.andWhere('booking.bookingDate = :bookingDate', {
        bookingDate,
      });
    }

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('booking.createdAt', 'DESC');

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

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['customer', 'store', 'creator', 'invoices'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async update(
    id: number,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.findOne(id);
    const originalStatus = booking.status;

    if (updateBookingDto.endTime && updateBookingDto.startTime) {
      if (updateBookingDto.startTime >= updateBookingDto.endTime) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    Object.assign(booking, updateBookingDto);

    if (booking.status === BookingStatus.IN_PROGRESS && originalStatus !== BookingStatus.IN_PROGRESS) {
      if (!booking.customerId && booking.customerEmail) {
        const customer = await this.customersService.findOrCreate({
          fullName: booking.customerName,
          phone: booking.customerPhone,
          email: booking.customerEmail,
          country_code: booking.customerCountryCode,
        });
        booking.customerId = customer.id;
      }
    }

    if (booking.status === BookingStatus.COMPLETED && originalStatus !== BookingStatus.COMPLETED) {
      await this._createInvoiceForCompletedBooking(booking);
    }

    return this.bookingRepository.save(booking);
  }



  async remove(id: number): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingRepository.remove(booking);
  }

  async confirmBooking(id: number): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = BookingStatus.CONFIRMED;
    return await this.bookingRepository.save(booking);
  }

  private async _updateCustomerLastVisit(booking: Booking): Promise<void> {
    try {
      if (!booking.customerId) return;
      const customer = await this.customersService.findOne(booking.customerId);
      customer.lastVisitDate = booking.bookingDate;
      await this.customersService.update(customer.id, customer);
    } catch (error) {
      console.error(
        `Failed to update last visit for customer ${booking.customerId}:`,
        error,
      );
    }
  }

  async cancelBooking(id: number): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = 'cancelled' as any;
    return await this.bookingRepository.save(booking);
  }

  async getBookingsByDateRange(
    storeId: number,
    startDate: string,
    endDate: string,
  ): Promise<Booking[]> {
    return await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.storeId = :storeId', { storeId })
      .andWhere('booking.bookingDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .leftJoinAndSelect('booking.customer', 'customer')
      .orderBy('booking.bookingDate', 'DESC')
      .addOrderBy('booking.startTime', 'DESC')
      .getMany();
  }

  async startService(id: number): Promise<Booking> {
    const booking = await this.findOne(id);
    const originalStatus = booking.status;

    if (booking.status !== BookingStatus.IN_PROGRESS) {
      booking.status = BookingStatus.IN_PROGRESS;
    }

    if (originalStatus !== BookingStatus.IN_PROGRESS) {
      if (!booking.customerId && booking.customerEmail) {
        const customer = await this.customersService.findOrCreate({
          fullName: booking.customerName,
          phone: booking.customerPhone,
          email: booking.customerEmail,
          country_code: booking.customerCountryCode,
        });
        booking.customerId = customer.id;
      }
    }

    return await this.bookingRepository.save(booking);
  }

  async completeService(id: number, invoiceData?: CreateInvoiceDto): Promise<Booking> {
    const booking = await this.findOne(id);
    const originalStatus = booking.status;

    if (!booking.customerId) {
      throw new BadRequestException('Cannot complete booking without a customer');
    }

    booking.status = BookingStatus.COMPLETED;

    if (originalStatus !== BookingStatus.COMPLETED) {
      await this._createInvoiceForCompletedBooking(booking, invoiceData);
    }

    return await this.bookingRepository.save(booking);
  }

  private async _createInvoiceForCompletedBooking(
    booking: Booking,
    invoiceData?: CreateInvoiceDto
  ): Promise<void> {
    const existingInvoices = await this.invoicesService.findAll({
      bookingId: booking.id,
      limit: 1
    });

    if (existingInvoices.data.length > 0) {
      console.log(`Invoice already exists for booking ${booking.id}`);
      return;
    }

    if (!booking.customerId) {
      throw new BadRequestException('Cannot create invoice without customer');
    }
    if (!booking.pendingInvoiceItems || booking.pendingInvoiceItems.length === 0) {
      throw new BadRequestException('Cannot create invoice without items');
    }

    try {
      const encodeDateTime = (dateStr: string, timeStr: string): string => {
        if (!dateStr || !timeStr) return String(Date.now());
        try {
          const [year, month, day] = dateStr.split("-");
          const [hour, minute] = timeStr.split(":");
          return `${month}${day}${year}${hour}${minute}`;
        } catch (e) {
          return String(Date.now());
        }
      };
      const subtotal = invoiceData?.subtotal ?? booking.pendingInvoiceItems.reduce(
        (sum, item) => sum + (item.unitPrice * item.quantity),
        0
      );

      const discountAmount = invoiceData?.discountAmount ?? booking.orderDiscount ?? 0;
      const amountAfterDiscount = subtotal - discountAmount;
      const taxRate = 0.08;
      const taxAmount = invoiceData?.taxAmount ?? Math.round(amountAfterDiscount * taxRate);
      const totalAmount = invoiceData?.totalAmount ?? (amountAfterDiscount + taxAmount);

      const voucher = invoiceData?.voucher || `INV-${booking.id}-${encodeDateTime(
        new Date(booking.bookingDate).toISOString().split('T')[0],
        booking.startTime,
      )}`;

      const payload: CreateInvoiceDto = {
        voucher,
        bookingId: booking.id,
        customerId: booking.customerId,
        storeId: invoiceData?.storeId ?? booking.storeId,
        subtotal,
        discountAmount: discountAmount || undefined,
        discountType: invoiceData?.discountType ?? (discountAmount ? 'amount' as any : undefined),
        taxAmount,
        totalAmount,
        paymentStatus: invoiceData?.paymentStatus ?? PaymentStatus.PENDING,
        notes: invoiceData?.notes ?? booking.discountReason ?? `Invoice automatically generated from booking #${booking.id}`,
        items: invoiceData?.items ?? booking.pendingInvoiceItems,
      };

      console.log('📤 Creating invoice with payload:', JSON.stringify(payload, null, 2));

      await this.invoicesService.create(payload);
      await this._updateCustomerLastVisit(booking);

      console.log('✅ Invoice created successfully for booking', booking.id);
    } catch (error) {
      console.error(` Failed to create invoice for booking ${booking.id}:`, error);
      throw error; 
    }
  }
}