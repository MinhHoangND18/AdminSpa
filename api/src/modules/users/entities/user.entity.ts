import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  // JoinColumn,
  // ManyToOne,
} from 'typeorm';
// import { StaffEntity } from '@/modules/staff/entities/staff.entity';
// import { StoreEntity } from '@/modules/stores/entities/store.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  STORE_ADMIN = 'store_admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  RECEPTIONIST = 'receptionist',
}

@Entity('users')
@Index('IDX_users_username', ['username'], { unique: true })
@Index('IDX_users_email', ['email'], { unique: true })
@Index('IDX_users_staff_id', ['staff_id'])
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STAFF,
  })
  role: UserRole;

  @Column({ type: 'bigint', nullable: true })
  staff_id: number;

  // @ManyToOne(() => StaffEntity, { nullable: true })
  // @JoinColumn({ name: 'staff_id' })
  // staff: StaffEntity;

  @Column({ type: 'bigint', nullable: true })
  store_id: number | null;

  // @ManyToOne(() => StoreEntity, { nullable: true })
  // @JoinColumn({ name: 'store_id' })
  // store: StoreEntity;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ type: 'int', default: 0 })
  login_attempts: number;

  @Column({ type: 'boolean', default: false })
  is_locked: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
