import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto, UpdateStaffDto, FilterStaffDto } from './staff.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateStaffDto): Promise<Staff> {
    const existingByPhone = await this.staffRepo.findOne({
      where: { phone: dto.phone },
    });
    if (existingByPhone) {
      throw new ConflictException('Phone number already exists');
    }
    const staffEntity = this.staffRepo.create(dto);
    const tempStaff = await this.staffRepo.save(staffEntity);


    tempStaff.code = `ST${tempStaff.id}`;
    const savedStaff = await this.staffRepo.save(tempStaff);


    try {
      await this.usersService.create({
        username: savedStaff.code,
        password: '123456', 
        role: UserRole.STAFF,
        staff_id: savedStaff.id,
        store_id: savedStaff.store_id,
        email: savedStaff.email,
        fullname: savedStaff.full_name, 
        is_active: true,
      });
    } catch (error) {
      console.error(
        `Failed to create user for staff ${savedStaff.code}. Rolling back staff creation.`,
        error,
      );
      await this.staffRepo.delete(savedStaff.id);
      throw new ConflictException(
        `Failed to create associated user: ${error.message}`,
      );
    }

    return savedStaff;
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
      order: { created_at: 'DESC' },
      relations: ['store'],
    });

    return { data: result, total };
  }

  async findOne(id: number): Promise<Staff> {
    const staff = await this.staffRepo.findOne({
      where: { id },
    });
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async update(id: number, dto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.findOne(id);
    if (dto.phone && dto.phone !== staff.phone) {
      const existingByPhone = await this.staffRepo.findOne({
        where: { phone: dto.phone },
      });
      if (existingByPhone && existingByPhone.id !== id) {
        throw new ConflictException('Phone number already exists');
      }
    }
    Object.assign(staff, dto);
    return this.staffRepo.save(staff);
  }

  async remove(id: number): Promise<void> {
    // DB chưa có cột is_deleted, nên tạm thời xoá cứng.
    const staff = await this.findOne(id);
    await this.staffRepo.delete(staff.id);
  }
}