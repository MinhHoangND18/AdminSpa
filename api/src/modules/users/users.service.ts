import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import {
  CreateUserDto,
  FilterUsersDto,
  UpdateUserDto,
} from './users.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(filter: FilterUsersDto) {
    return this.usersRepository.findAll(filter);
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(dto: CreateUserDto) {
    await this.ensureUniqueFields(dto.username, dto.email);

    const password_hash = await bcrypt.hash(dto.password, 10);

    const userEntity = this.usersRepository.createEntity({
      username: dto.username,
      password_hash,
      email: dto.email ?? null,
      role: dto.role,
      staff_id: dto.staff_id ?? null,
      store_id: dto.store_id ?? null,
      is_active: dto.is_active ?? true,
    });

    const saved = await this.usersRepository.save(userEntity);
    return this.sanitize(saved);
  }

  async update(id: number, dto: UpdateUserDto) {
    const existing = await this.findOne(id);

    if (dto.username && dto.username !== existing.username) {
      await this.ensureUniqueFields(dto.username, undefined, id);
    }

    if (dto.email !== undefined && dto.email !== existing.email) {
      await this.ensureEmailUnique(dto.email, id);
    }

    let password_hash = existing.password_hash;
    if (dto.password) {
      password_hash = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.usersRepository.updateById(id, {
      username: dto.username ?? existing.username,
      password_hash,
      email:
        dto.email !== undefined ? dto.email : existing.email,
      role: dto.role ?? existing.role,
      staff_id:
        dto.staff_id !== undefined
          ? dto.staff_id
          : existing.staff_id,
      store_id:
        dto.store_id !== undefined
          ? dto.store_id
          : existing.store_id,
      is_active:
        dto.is_active !== undefined
          ? dto.is_active
          : existing.is_active,
    });

    return this.sanitize(updated as UserEntity);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.usersRepository.remove(id);
  }

  private async ensureUniqueFields(
    username: string,
    email?: string,
    excludeUserId?: number,
  ) {
    const existingByUsername =
      await this.usersRepository.findByUsername(username);
    if (
      existingByUsername &&
      existingByUsername.id !== excludeUserId
    ) {
      throw new ConflictException('Username already exists');
    }

    if (email) {
      await this.ensureEmailUnique(email, excludeUserId);
    }
  }

  private async ensureEmailUnique(
    email: string,
    excludeUserId?: number,
  ) {
    if (!email) return;
    const existingByEmail =
      await this.usersRepository.findByEmail(email);
    if (existingByEmail && existingByEmail.id !== excludeUserId) {
      throw new ConflictException('Email already exists');
    }
  }

  private sanitize(user: UserEntity) {
    const { password_hash, ...rest } = user;
    return rest;
  }
}

