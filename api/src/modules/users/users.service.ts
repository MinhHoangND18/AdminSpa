import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDto, FilterUsersDto, UpdateUserDto } from './users.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) { }

  async findAll(filter: FilterUsersDto) {
    const { data, total } = await this.usersRepository.findAll(filter);
    const sanitizedData = data.map((user) => this.sanitize(user));
    return { data: sanitizedData, total };
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
      fullname: dto.fullname ?? null,
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
      email: dto.email !== undefined ? dto.email : existing.email,
      fullname: dto.fullname !== undefined ? dto.fullname : existing.fullname,
      role: dto.role ?? existing.role,
      staff_id: dto.staff_id !== undefined ? dto.staff_id : existing.staff_id,
      store_id: dto.store_id !== undefined ? dto.store_id : existing.store_id,
      is_active: dto.is_active !== undefined ? dto.is_active : existing.is_active,
      login_attempts:
        dto.login_attempts !== undefined
          ? dto.login_attempts
          : existing.login_attempts,
    });

    return this.sanitize(updated as UserEntity);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (user.is_deleted) {
      throw new ConflictException('User already deleted');
    }

    // Instead of hard delete, we soft delete
    await this.usersRepository.updateById(id, {
      is_deleted: true,
      is_active: false,
    });
  }

  private async ensureUniqueFields(
    username: string,
    email?: string,
    excludeUserId?: number,
  ) {
    const existingByUsername =
      await this.usersRepository.findByUsername(username);
    if (existingByUsername && existingByUsername.id !== excludeUserId) {
      throw new ConflictException('Username already exists');
    }

    if (email) {
      await this.ensureEmailUnique(email, excludeUserId);
    }
  }

  private async ensureEmailUnique(email: string, excludeUserId?: number) {
    if (!email) return;
    const existingByEmail = await this.usersRepository.findByEmail(email);
    if (existingByEmail && existingByEmail.id !== excludeUserId) {
      throw new ConflictException('Email already exists');
    }
  }
  async lockUser(id: number) {
    const existing = await this.findOne(id);
    if (existing.is_locked) {
      return this.sanitize(existing);
    }
    const updated = await this.usersRepository.updateById(id, {
      is_locked: true,
    });
    return this.sanitize(updated as UserEntity);
  }

  async validateUserCredentials(
    username: string,
    password_input: string,
  ): Promise<UserEntity | null> {
    const user = await this.usersRepository.findByUsername(username);

    if (!user || user.is_active === false) {
      return null;
    }

    if (user.is_locked) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      password_input,
      user.password_hash,
    );

    if (isPasswordValid) {
      await this.handleSuccessfulLogin(user);
      return user;
    } else {
      await this.handleFailedLogin(user);
      return null;
    }
  }

  private async handleFailedLogin(user: UserEntity): Promise<void> {
    const MAX_ATTEMPTS = 5;
    const newAttempts = user.login_attempts + 1;
    let is_locked = user.is_locked;

    if (newAttempts >= MAX_ATTEMPTS) {
      is_locked = true;
    }

    await this.usersRepository.updateById(user.id, {
      login_attempts: newAttempts,
      is_locked: is_locked,
    });
  }

  private async handleSuccessfulLogin(user: UserEntity): Promise<void> {
    if (user.login_attempts > 0 || !user.last_login) {
      await this.usersRepository.updateById(user.id, {
        login_attempts: 0,
        last_login: new Date(),
      });
    } else {
      await this.usersRepository.updateById(user.id, {
        last_login: new Date(),
      });
    }
  }

  async unlockUser(id: number) {
    const existing = await this.findOne(id);
    if (!existing.is_locked) {
      return this.sanitize(existing);
    }
    const updated = await this.usersRepository.updateById(id, {
      is_locked: false,
      login_attempts: 0,
    });

    return this.sanitize(updated as UserEntity);
  }
  private sanitize(user: UserEntity) {
    const { password_hash, staff, store, ...rest } = user;
    const staff_name = staff ? staff.full_name : undefined;
    const store_name = store ? store.name : undefined;
    const sanitizedUser: any = {
      ...rest,
      staff_name: staff_name,
      store_name: store_name,
    };

    return sanitizedUser;
  }
}