import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { FilterUsersDto } from './users.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  createEntity(data: Partial<UserEntity>) {
    return this.repository.create(data);
  }

  save(user: UserEntity) {
    return this.repository.save(user);
  }

  findById(id: number) {
    return this.repository.findOne({ where: { id }, relations: ['store', 'staff'] });
  }

  findByUsername(username: string) {
    return this.repository.findOne({ where: { username } });
  }

  findByEmail(email: string) {
    return this.repository.findOne({ where: { email } });
  }

  async findAll(filter: FilterUsersDto) {
    const { page = 1, limit = 10 } = filter;
    const skip = (page - 1) * limit;

    const qb = this.repository.createQueryBuilder('user')
      .leftJoinAndSelect('user.store', 'store')
      .leftJoinAndSelect('user.staff', 'staff')
      .where('1 = 1');
    if (filter.role) {
      qb.andWhere('user.role = :role', { role: filter.role });
    }

    if (typeof filter.is_active === 'boolean') {
      qb.andWhere('user.is_active = :is_active', {
        is_active: filter.is_active,
      });
    }

    if (filter.search) {
      qb.andWhere(
        '(LOWER(user.username) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${filter.search}%` },
      );
    }

    qb.orderBy('user.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async updateById(id: number, data: Partial<UserEntity>) {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async remove(id: number) {
    await this.repository.delete(id);
  }
}
