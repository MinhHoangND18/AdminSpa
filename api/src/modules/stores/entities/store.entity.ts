import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { Staff } from '../../staff/entities/staff.entity';

@Entity('stores')
//@Index(['domain'])
@Index(['isActive'])
export class Store {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  code: string;

  @Column({ type: 'bigint', nullable: true })
  manager_id: number;

  @Column({ type: 'varchar', length: 150, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: true })
  domain: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  openingHours: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  // @Column({ type: 'bigint', nullable: true })
  // managerId: number;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: UserEntity;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => Staff, (staff) => staff.store)
  staff: Staff[]

  @OneToMany(() => UserEntity, (user) => user.store)
  users: UserEntity[];
}
