import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto, UpdateStaffDto, FilterStaffDto } from './staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
  ) {}

  async create(dto: CreateStaffDto): Promise<Staff> {
    const staff = this.staffRepo.create(dto);
    return this.staffRepo.save(staff);
  }

async findAll(filter: FilterStaffDto): Promise<{ data: Staff[], total: number }> {
    const { page = 1, limit = 10 } = filter; 
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter.status) where.status = filter.status;
    if (filter.store_id) where.store_id = filter.store_id;
    if (filter.keyword)
      where.full_name = Like(`%${filter.keyword}%`);

    const [result, total] = await this.staffRepo.findAndCount({
      where,
      take: limit,
      skip: skip,
      order: { created_at: 'ASC' },
      relations: ['store'],
    });

    return { data: result, total };
  }

  async findOne(id: number): Promise<Staff> {
    const staff = await this.staffRepo.findOne({ where: { id } });
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async update(id: number, dto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.findOne(id);
    Object.assign(staff, dto);
    return this.staffRepo.save(staff);
  }

  async remove(id: number): Promise<void> {
    const staff = await this.findOne(id);
    await this.staffRepo.remove(staff);
  }
}
