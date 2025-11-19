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
// import { StoreEntity } from '@/modules/stores/entities/store.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum SalaryType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  COMMISSION = 'commission',
}

export enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
}

@Entity('staff')
@Index(['code'])
@Index(['phone'])
@Index(['store_id'])
@Index(['status'])
export class StaffEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  full_name: string;

  @Column({ type: 'varchar', length: 15, unique: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'bigint', nullable: true })
  store_id: number;

//   @ManyToOne(() => StoreEntity, { nullable: true })
//   @JoinColumn({ name: 'store_id' })
//   store: StoreEntity;

  @Column({ type: 'date', nullable: true })
  hire_date: Date;

  @Column({
    type: 'enum',
    enum: SalaryType,
    default: SalaryType.FIXED,
  })
  salary_type: SalaryType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  base_salary: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  commission_rate: number;

  @Column({
    type: 'enum',
    enum: StaffStatus,
    default: StaffStatus.ACTIVE,
  })
  status: StaffStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}