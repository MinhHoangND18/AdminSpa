import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true, nullable: true })
  code: string;

  @Column({ length: 100 })
  full_name: string;

  @Column({ length: 15, unique: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  store_id: number;

  @ManyToOne(() => Store, (store) => store.staff, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => UserEntity, (user) => user.staff)
  users: UserEntity[];

  @Column({ type: 'date', nullable: true })
  hire_date: Date;

  @Column({
    type: 'enum',
    enum: ['fixed', 'hourly', 'commission'],
    default: 'fixed',
  })
  salary_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  base_salary: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  commission_rate: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active',
  })
  status: string;

  // DB hiện chưa có cột is_deleted; tạm thời không map để tránh lỗi.
  // Khi thêm cột, khôi phục mapping với name đúng.
  // @Column({
  //   type: 'boolean',
  //   default: false,
  //   select: false,
  //   name: 'is_deleted',
  // })
  // is_deleted: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}