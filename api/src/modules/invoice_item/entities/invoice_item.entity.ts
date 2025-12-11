// src/invoice-items/entities/invoice-item.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  Index
} from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Staff } from '../../staff/entities/staff.entity';

export enum ItemType {
  SERVICE = 'service',
  PRODUCT = 'product',
  PACKAGE = 'package'
}

@Entity('invoice_items')
@Index(['invoiceId'])
@Index(['staffId'])
export class InvoiceItem {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'invoice_id', nullable: false })
  invoiceId: number;

  @ManyToOne(() => Invoice)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({
    type: 'enum',
    enum: ItemType,
    name: 'item_type',
    nullable: false
  })
  itemType: ItemType;

  @Column({ type: 'int', name: 'item_id', nullable: false })
  itemId: number;

  @Column({ type: 'varchar', length: 200, name: 'item_name', nullable: true })
  itemName: string;

  @Column({ type: 'bigint', name: 'staff_id', nullable: true })
  staffId: number;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price', nullable: false })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;
 
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_price', nullable: false })
  totalPrice: number;
}