import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  AssignPermissionDto,
  FilterPermissionDto,
} from './permissions.dto';

@Injectable()
export class PermissionsRepository {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissionRepo: Repository<RolePermissionEntity>,
  ) {}

  async create(dto: CreatePermissionDto): Promise<PermissionEntity> {
    const entity = this.permissionRepo.create(dto);
    return await this.permissionRepo.save(entity);
  }

  async findAll(filter: FilterPermissionDto): Promise<{
    data: PermissionEntity[];
    total: number;
  }> {
    const { page = 1, limit = 10, module, search } = filter;
    const skip = (page - 1) * limit;

    const queryBuilder = this.permissionRepo.createQueryBuilder('permission');

    if (module) {
      queryBuilder.andWhere('permission.module = :module', { module });
    }

    if (search) {
      queryBuilder.andWhere(
        '(permission.name LIKE :search OR permission.code LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .orderBy('permission.created_at', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<PermissionEntity> {
    return await this.permissionRepo.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<PermissionEntity> {
    return await this.permissionRepo.findOne({ where: { code } });
  }

  async update(id: number, dto: UpdatePermissionDto): Promise<PermissionEntity> {
    await this.permissionRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.permissionRepo.delete(id);
  }

  async assignToRole(dto: AssignPermissionDto): Promise<RolePermissionEntity> {
    const entity = this.rolePermissionRepo.create(dto);
    return await this.rolePermissionRepo.save(entity);
  }

  async findRolePermission(
    role: string,
    permissionId: number,
  ): Promise<RolePermissionEntity> {
    return await this.rolePermissionRepo.findOne({
      where: { role, permission_id: permissionId },
    });
  }

  async getByRole(role: string): Promise<PermissionEntity[]> {
    const rolePermissions = await this.rolePermissionRepo.find({
      where: { role },
      relations: ['permission'],
    });

    return rolePermissions.map((rp) => rp.permission);
  }

  async removeFromRole(role: string, permissionId: number): Promise<void> {
    await this.rolePermissionRepo.delete({
      role,
      permission_id: permissionId,
    });
  }

  async checkPermission(role: string, permissionCode: string): Promise<boolean> {
    const count = await this.rolePermissionRepo
      .createQueryBuilder('rp')
      .innerJoin('rp.permission', 'p')
      .where('rp.role = :role', { role })
      .andWhere('p.code = :code', { code: permissionCode })
      .getCount();

    return count > 0;
  }
}