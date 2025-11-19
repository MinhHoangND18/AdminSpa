import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { StaffEntity } from './entities/staff.entity';
import { CreateStaffDto, UpdateStaffDto, FilterStaffDto } from './staff.dto';

@Injectable()
export class StaffRepository {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly repository: Repository<StaffEntity>,
  ) {}

  async create(dto: CreateStaffDto): Promise<StaffEntity> {
    const entity = this.repository.create(dto);
    return await this.repository.save(entity);
  }

  async findAll(filter: FilterStaffDto): Promise<{
    data: StaffEntity[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      store_id,
      gender,
      salary_type,
    } = filter;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.store', 'store');

    // Search by name, code, phone, email
    if (search) {
      queryBuilder.andWhere(
        '(staff.full_name LIKE :search OR staff.code LIKE :search OR staff.phone LIKE :search OR staff.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere('staff.status = :status', { status });
    }

    // Filter by store
    if (store_id) {
      queryBuilder.andWhere('staff.store_id = :store_id', { store_id });
    }

    // Filter by gender
    if (gender) {
      queryBuilder.andWhere('staff.gender = :gender', { gender });
    }

    // Filter by salary type
    if (salary_type) {
      queryBuilder.andWhere('staff.salary_type = :salary_type', { salary_type });
    }

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .orderBy('staff.created_at', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<StaffEntity> {
    return await this.repository.findOne({
      where: { id },
      relations: ['store'],
    });
  }

  async findByCode(code: string): Promise<StaffEntity> {
    return await this.repository.findOne({
      where: { code },
      relations: ['store'],
    });
  }

  async findByPhone(phone: string): Promise<StaffEntity> {
    return await this.repository.findOne({
      where: { phone },
    });
  }

  async update(id: number, dto: UpdateStaffDto): Promise<StaffEntity> {
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async countByStore(storeId: number): Promise<number> {
    return await this.repository.count({
      where: { store_id: storeId },
    });
  }

  async findByStore(storeId: number): Promise<StaffEntity[]> {
    return await this.repository.find({
      where: { store_id: storeId },
      relations: ['store'],
    });
  }
}