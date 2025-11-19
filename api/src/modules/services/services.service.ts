import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ServicesRepository } from './services.repository';
import {
  CreateServiceDto,
  UpdateServiceDto,
  FilterServiceDto,
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  FilterServiceCategoryDto,
} from './services.dto';
import { ServiceStatus } from './entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  // ============= CATEGORY METHODS =============
  async createCategory(dto: CreateServiceCategoryDto) {
    // Generate slug if not provided
    if (!dto.slug && dto.name) {
      dto.slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Check if slug already exists
    if (dto.slug) {
      const existing = await this.servicesRepository.findCategoryBySlug(dto.slug);
      if (existing) {
        throw new ConflictException('Category slug already exists');
      }
    }

    const category = await this.servicesRepository.createCategory(dto);
    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }

  async findAllCategories(filter: FilterServiceCategoryDto) {
    const { data, total } = await this.servicesRepository.findAllCategories(filter);
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

  async findOneCategory(id: number) {
    const category = await this.servicesRepository.findOneCategory(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return {
      success: true,
      data: category,
    };
  }

  async updateCategory(id: number, dto: UpdateServiceCategoryDto) {
    await this.findOneCategory(id);

    // Check slug uniqueness if slug is being updated
    if (dto.slug) {
      const existing = await this.servicesRepository.findCategoryBySlug(dto.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException('Category slug already exists');
      }
    }

    const category = await this.servicesRepository.updateCategory(id, dto);
    return {
      success: true,
      message: 'Category updated successfully',
      data: category,
    };
  }

  async removeCategory(id: number) {
    await this.findOneCategory(id);

    // Check if category has services
    const serviceCount = await this.servicesRepository.countServicesByCategory(id);
    if (serviceCount > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${serviceCount} services. Please reassign or delete services first.`
      );
    }

    await this.servicesRepository.removeCategory(id);
    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }

  // ============= SERVICE METHODS =============
  async create(dto: CreateServiceDto) {
    // Validate category exists if provided
    if (dto.category_id) {
      await this.findOneCategory(dto.category_id);
    }

    // Validate discount price
    if (dto.discount_price && dto.discount_price >= dto.price) {
      throw new BadRequestException('Discount price must be less than regular price');
    }

    const service = await this.servicesRepository.create(dto);
    return {
      success: true,
      message: 'Service created successfully',
      data: service,
    };
  }

  async findAll(filter: FilterServiceDto) {
    const { data, total } = await this.servicesRepository.findAll(filter);
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

  async findAllActive(filter: FilterServiceDto) {
    const modifiedFilter = { ...filter, status: ServiceStatus.ACTIVE };
    return this.findAll(modifiedFilter);
  }

  async findByCategory(categoryId: number, filter: FilterServiceDto) {
    const modifiedFilter = { ...filter, category_id: categoryId };
    return this.findAll(modifiedFilter);
  }

  async findOne(id: number) {
    const service = await this.servicesRepository.findOne(id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return {
      success: true,
      data: service,
    };
  }

  async update(id: number, dto: UpdateServiceDto) {
    await this.findOne(id);

    // Validate category exists if provided
    if (dto.category_id) {
      await this.findOneCategory(dto.category_id);
    }

    // Validate discount price
    if (dto.discount_price !== undefined && dto.price !== undefined) {
      if (dto.discount_price >= dto.price) {
        throw new BadRequestException('Discount price must be less than regular price');
      }
    }

    const service = await this.servicesRepository.update(id, dto);
    return {
      success: true,
      message: 'Service updated successfully',
      data: service,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.servicesRepository.remove(id);
    return {
      success: true,
      message: 'Service deleted successfully',
    };
  }

  async updateStatus(id: number, status: string) {
    await this.findOne(id);

    if (!Object.values(ServiceStatus).includes(status as ServiceStatus)) {
      throw new BadRequestException('Invalid status');
    }

    const service = await this.servicesRepository.update(id, { 
      status: status as ServiceStatus 
    });
    
    return {
      success: true,
      message: 'Service status updated successfully',
      data: service,
    };
  }
}