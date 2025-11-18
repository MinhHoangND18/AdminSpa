import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PermissionEntity } from './permission.entity';

@Entity('role_permissions')
@Index(['role', 'permission_id'], { unique: true })
export class RolePermissionEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50 })
  role: string;

  @Column({ type: 'bigint' })
  permission_id: number;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: PermissionEntity;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}
