import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice } from './entities/invoice.entity';
import { ServicesModule } from '../services/services.module';
import { InvoiceItemsModule } from '../invoice_item/invoice_items.module';
import { InvoiceItem } from '../invoice_item/entities/invoice_item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice,  InvoiceItem]),
    ServicesModule,
    InvoiceItemsModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}