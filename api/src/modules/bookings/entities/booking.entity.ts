// src/bookings/entities/booking.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Store } from '../../stores/entities/store.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

@Entity('booking')
@Index(['customerId'])
@Index(['storeId', 'bookingDate'])
@Index(['status'])
export class Booking {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'customer_id', nullable: true })
  customerId: number;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'varchar', length: 255, name: 'customer_name', nullable: true })
  customerName: string;

  @Column({ type: 'varchar', length: 50, name: 'customer_phone', nullable: true })
  customerPhone: string;

  @Column({ type: 'varchar', length: 255, name: 'customer_email', nullable: true })
  customerEmail: string;

  @Column({ type: 'json', name: 'pending_invoice_items', nullable: true })
  pendingInvoiceItems: any[];

  @Column({ type: 'bigint', name: 'store_id', nullable: false })
  storeId: number;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ type: 'date', name: 'booking_date', nullable: false })
  bookingDate: Date;

  @Column({ type: 'time', name: 'start_time', nullable: false })
  startTime: string;

  @Column({ type: 'time', name: 'end_time', nullable: true })
  endTime: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING
  })
  status: BookingStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'order_discount', nullable: true })
  orderDiscount: number;

  @Column({ type: 'varchar', length: 255, name: 'discount_reason', nullable: true })
  discountReason: string;

  @Column({ type: 'boolean', default: false })
  confirm: boolean;

  @Column({ type: 'bigint', name: 'created_by', nullable: true })
  createdBy: number;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Invoice, invoice => invoice.booking)
  invoices: Invoice[];
}