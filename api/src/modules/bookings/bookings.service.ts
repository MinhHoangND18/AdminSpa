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
  ) {}

  async createBookingFromOrder(orderDto: CreateBookingOrderDto): Promise<Booking> {
    const { customer: customerData, booking: bookingData, invoice: invoiceData } = orderDto;
    const customer = await this.customersService.findOrCreate(customerData);
    const booking = this.bookingRepository.create({
      ...bookingData,
      customerId: customer.id,
      status: BookingStatus.PENDING, 
      confirm: true,
      source: 'website', 
    });
    const savedBooking = await this.bookingRepository.save(booking);

    const voucher = `INV-${savedBooking.id}-${Date.now()}`;
    await this.invoicesService.create({
      ...invoiceData,
      voucher,
      bookingId: savedBooking.id,
      customerId: customer.id,
      paymentStatus: PaymentStatus.PENDING, 
    });
    
    await this._updateCustomerLastVisit(savedBooking);

    return savedBooking;
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
      relations: ['customer', 'store', 'creator'],
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

    // Validate booking time if both times are provided
    if (updateBookingDto.endTime && updateBookingDto.startTime) {
      if (updateBookingDto.startTime >= updateBookingDto.endTime) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    Object.assign(booking, updateBookingDto);
    const updatedBooking = await this.bookingRepository.save(booking);

    return updatedBooking;
  }

  private async createInvoiceFromBooking(booking: Booking): Promise<void> {
    try {
      // Check if an invoice for this booking already exists
      const existingInvoices = await this.invoicesService.findAll({
        bookingId: booking.id,
        limit: 1,
      });
      if (existingInvoices && existingInvoices.data.length > 0) {
        console.log(
          `Invoice already exists for booking ${booking.id}. Skipping creation.`,
        );
        return;
      }

      const voucher = `INV-${booking.id}-${Date.now()}`;
      await this.invoicesService.create({
        voucher,
        bookingId: booking.id,
        customerId: booking.customerId,
        storeId: booking.storeId,
        subtotal: 0,
        totalAmount: 0,
        paymentStatus: PaymentStatus.PENDING,
        createdBy: booking.createdBy,
        notes: `Invoice automatically generated from booking #${booking.id}`,
        items: [], 
      });
    } catch (error) {
      console.error(
        `Failed to create invoice for booking ${booking.id}:`,
        error,
      );
    }
  }

  async remove(id: number): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingRepository.remove(booking);
  }

  async confirmBooking(id: number): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.confirm = true;

    const updatedBooking = await this.bookingRepository.save(booking);

    return updatedBooking;
  }

  private async _updateCustomerLastVisit(booking: Booking): Promise<void> {
    try {
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

    booking.status = BookingStatus.IN_PROGRESS;
    return await this.bookingRepository.save(booking);
  }

  async completeService(id: number): Promise<Booking> {
    const booking = await this.findOne(id);

    booking.status = BookingStatus.COMPLETED;
    const updatedBooking = await this.bookingRepository.save(booking);

    return updatedBooking;
  }
}