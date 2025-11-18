import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  AssignPermissionDto,
  FilterPermissionDto,
} from './permissions.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async create(dto: CreatePermissionDto) {
    const existing = await this.permissionsRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException('Permission code already exists');
    }

    const permission = await this.permissionsRepository.create(dto);
    return {
      success: true,
      message: 'Permission created successfully',
      data: permission,
    };
  }

  async findAll(filter: FilterPermissionDto) {
    const { data, total } = await this.permissionsRepository.findAll(filter);
    return {
      success: true,
      data,
      pagination: {
        total,
        page: filter.page || 1,
        limit: filter.limit || 10,
      },
    };
  }

  async findOne(id: number) {
    const permission = await this.permissionsRepository.findOne(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return {
      success: true,
      data: permission,
    };
  }

  async update(id: number, dto: UpdatePermissionDto) {
    await this.findOne(id);
    const permission = await this.permissionsRepository.update(id, dto);
    return {
      success: true,
      message: 'Permission updated successfully',
      data: permission,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.permissionsRepository.remove(id);
    return {
      success: true,
      message: 'Permission deleted successfully',
    };
  }

  async assignToRole(dto: AssignPermissionDto) {
    const permission = await this.permissionsRepository.findOne(dto.permission_id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const existing = await this.permissionsRepository.findRolePermission(
      dto.role,
      dto.permission_id,
    );
    if (existing) {
      throw new ConflictException('Permission already assigned to this role');
    }

    await this.permissionsRepository.assignToRole(dto);
    return {
      success: true,
      message: 'Permission assigned to role successfully',
    };
  }

  async getByRole(role: string) {
    const permissions = await this.permissionsRepository.getByRole(role);
    return {
      success: true,
      data: permissions,
    };
  }

  async removeFromRole(role: string, permissionId: number) {
    const existing = await this.permissionsRepository.findRolePermission(
      role,
      permissionId,
    );
    if (!existing) {
      throw new NotFoundException('Permission not assigned to this role');
    }

    await this.permissionsRepository.removeFromRole(role, permissionId);
    return {
      success: true,
      message: 'Permission removed from role successfully',
    };
  }

  async checkPermission(role: string, permissionCode: string): Promise<boolean> {
    return await this.permissionsRepository.checkPermission(role, permissionCode);
  }
}