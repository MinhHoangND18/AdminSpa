import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { Booking } from './entities/booking.entity'; 
import { InvoicesModule } from '../invoices/invoices.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]), 
    InvoicesModule,
    CustomersModule,
  ],
  controllers: [BookingsController],
 providers: [BookingsService],
})
export class BookingsModule {}