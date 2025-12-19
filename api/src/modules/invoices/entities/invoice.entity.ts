
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
import { Booking } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Store } from '../../stores/entities/store.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { InvoiceItem } from '../../invoice_item/entities/invoice_item.entity';

export enum DiscountType {
  AMOUNT = 'amount',
  PERCENT = 'percent'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  CANCELLED = 'cancelled'
}

@Entity('invoices')
// @Index(['voucher'])
@Index(['customerId'])
@Index(['bookingId'])
@Index(['storeId', 'createdAt'])
@Index(['paymentStatus'])
export class Invoice {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  voucher: string;

  @Column({ type: 'bigint', name: 'booking_id', nullable: true })
  bookingId: number;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'bigint', name: 'customer_id', nullable: false })
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'bigint', name: 'store_id', nullable: false })
  storeId: number;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  subtotal: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    name: 'discount_amount',
    default: 0 
  })
  discountAmount: number;

  @Column({
    type: 'enum',
    enum: DiscountType,
    name: 'discount_type',
    nullable: true
  })
  discountType: DiscountType;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    name: 'tax_amount',
    default: 0 
  })
  taxAmount: number;

  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2,
    name: 'total_amount',
    nullable: false 
  })
  totalAmount: number;

  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2,
    name: 'paid_amount',
    default: 0 
  })
  paidAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    name: 'payment_status',
    default: PaymentStatus.PENDING
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'bigint', name: 'created_by', nullable: true })
  createdBy: number;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}