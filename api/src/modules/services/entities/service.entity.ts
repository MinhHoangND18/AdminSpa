import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ServiceCategory } from '../../service_categories/entities/service_categories.entity';

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('services')
@Index(['categoryId'])
@Index(['status'])
export class Service {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  name: string;

  @Column({ type: 'int', nullable: true })
  categoryId: number;

  @ManyToOne(() => ServiceCategory, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: ServiceCategory;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: false })
  durationMinutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceUSD: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountPrice: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @Column({ type: 'boolean', default: false })
  isCombo: boolean;

  @Column({
    type: 'enum',
    enum: ServiceStatus,
    default: ServiceStatus.ACTIVE,
  })
  status: ServiceStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}