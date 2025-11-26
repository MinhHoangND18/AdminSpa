// src/bookings/bookings.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto } from './bookings.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Validate booking time
    if (createBookingDto.endTime && createBookingDto.startTime >= createBookingDto.endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const booking = this.bookingRepository.create(createBookingDto);
    return await this.bookingRepository.save(booking);
  }

  async findAll(query: QueryBookingDto) {
    const { page = 1, limit = 10, customerId, storeId, bookingDate, status } = query;
    
    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.store', 'store')
      .leftJoinAndSelect('booking.creator', 'creator');

    if (customerId) {
      queryBuilder.andWhere('booking.customerId = :customerId', { customerId });
    }

    if (storeId) {
      queryBuilder.andWhere('booking.storeId = :storeId', { storeId });
    }

    if (bookingDate) {
      queryBuilder.andWhere('booking.bookingDate = :bookingDate', { bookingDate });
    }

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('booking.createdAt', 'ASC');

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

  async update(id: number, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);

    // Validate booking time if both times are provided
    if (updateBookingDto.endTime && updateBookingDto.startTime) {
      if (updateBookingDto.startTime >= updateBookingDto.endTime) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    Object.assign(booking, updateBookingDto);
    return await this.bookingRepository.save(booking);
  }

  async remove(id: number): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingRepository.remove(booking);
  }

  async confirmBooking(id: number): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.confirm = true;
    return await this.bookingRepository.save(booking);
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
      .orderBy('booking.bookingDate', 'ASC')
      .addOrderBy('booking.startTime', 'ASC')
      .getMany();
  }
}