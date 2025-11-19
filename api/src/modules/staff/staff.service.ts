import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { StaffRepository } from './staff.repository';
import { CreateStaffDto, UpdateStaffDto, FilterStaffDto } from './staff.dto';
import { StaffStatus } from './entities/staff.entity';

@Injectable()
export class StaffService {
  constructor(private readonly staffRepository: StaffRepository) {}

  async create(dto: CreateStaffDto) {
    // Check if code already exists
    const existingCode = await this.staffRepository.findByCode(dto.code);
    if (existingCode) {
      throw new ConflictException('Staff code already exists');
    }

    // Check if phone already exists
    const existingPhone = await this.staffRepository.findByPhone(dto.phone);
    if (existingPhone) {
      throw new ConflictException('Phone number already exists');
    }

    const staff = await this.staffRepository.create(dto);
    return {
      success: true,
      message: 'Staff created successfully',
      data: staff,
    };
  }

  async findAll(filter: FilterStaffDto) {
    const { data, total } = await this.staffRepository.findAll(filter);
    return {
      success: true,
      data,
      pagination: {
        total,
        page: filter.page || 1,
        limit: filter.limit || 10,
        totalPages: Math.ceil(total / (filter.limit || 10)),
      },
    };
  }

  async findOne(id: number) {
    const staff = await this.staffRepository.findOne(id);
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    return {
      success: true,
      data: staff,
    };
  }

  async findByCode(code: string) {
    const staff = await this.staffRepository.findByCode(code);
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    return {
      success: true,
      data: staff,
    };
  }

  async update(id: number, dto: UpdateStaffDto) {
    await this.findOne(id);

    // Check code uniqueness if code is being updated
    if (dto.code) {
      const existing = await this.staffRepository.findByCode(dto.code);
      if (existing && existing.id !== id) {
        throw new ConflictException('Staff code already exists');
      }
    }

    // Check phone uniqueness if phone is being updated
    if (dto.phone) {
      const existing = await this.staffRepository.findByPhone(dto.phone);
      if (existing && existing.id !== id) {
        throw new ConflictException('Phone number already exists');
      }
    }

    const staff = await this.staffRepository.update(id, dto);
    return {
      success: true,
      message: 'Staff updated successfully',
      data: staff,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.staffRepository.remove(id);
    return {
      success: true,
      message: 'Staff deleted successfully',
    };
  }

  async updateStatus(id: number, status: string) {
    await this.findOne(id);

    if (!Object.values(StaffStatus).includes(status as StaffStatus)) {
      throw new BadRequestException('Invalid status');
    }

    const staff = await this.staffRepository.update(id, { 
      status: status as StaffStatus 
    });
    
    return {
      success: true,
      message: 'Staff status updated successfully',
      data: staff,
    };
  }
}