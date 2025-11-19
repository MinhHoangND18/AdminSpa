import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ServiceEntity, ServiceStatus } from './entities/service.entity';
import { ServiceCategoryEntity } from './entities/service-category.entity';
import {
  CreateServiceDto,
  UpdateServiceDto,
  FilterServiceDto,
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  FilterServiceCategoryDto,
} from './services.dto';

@Injectable()
export class ServicesRepository {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly serviceRepo: Repository<ServiceEntity>,
    @InjectRepository(ServiceCategoryEntity)
    private readonly categoryRepo: Repository<ServiceCategoryEntity>,
  ) {}

  // ============= CATEGORY METHODS =============
  async createCategory(dto: CreateServiceCategoryDto): Promise<ServiceCategoryEntity> {
    const entity = this.categoryRepo.create(dto);
    return await this.categoryRepo.save(entity);
  }

  async findAllCategories(filter: FilterServiceCategoryDto): Promise<{
    data: ServiceCategoryEntity[];
    total: number;
  }> {
    const { page = 1, limit = 10, search, is_active } = filter;
    const skip = (page - 1) * limit;

    const queryBuilder = this.categoryRepo
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.services', 'services');

    if (search) {
      queryBuilder.andWhere(
        '(category.name LIKE :search OR category.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (is_active !== undefined) {
      queryBuilder.andWhere('category.is_active = :is_active', { is_active });
    }

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .orderBy('category.display_order', 'ASC')
      .addOrderBy('category.created_at', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOneCategory(id: number): Promise<ServiceCategoryEntity> {
    return await this.categoryRepo.findOne({
      where: { id },
      relations: ['services'],
    });
  }

  async findCategoryBySlug(slug: string): Promise<ServiceCategoryEntity> {
    return await this.categoryRepo.findOne({
      where: { slug },
    });
  }

  async updateCategory(
    id: number,
    dto: UpdateServiceCategoryDto,
  ): Promise<ServiceCategoryEntity> {
    await this.categoryRepo.update(id, dto);
    return this.findOneCategory(id);
  }

  async removeCategory(id: number): Promise<void> {
    await this.categoryRepo.delete(id);
  }

  async countServicesByCategory(categoryId: number): Promise<number> {
    return await this.serviceRepo.count({
      where: { category_id: categoryId },
    });
  }

  // ============= SERVICE METHODS =============
  async create(dto: CreateServiceDto): Promise<ServiceEntity> {
    const entity = this.serviceRepo.create(dto);
    return await this.serviceRepo.save(entity);
  }

  async findAll(filter: FilterServiceDto): Promise<{
    data: ServiceEntity[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      category_id,
      is_combo,
      min_price,
      max_price,
      min_duration,
      max_duration,
    } = filter;
    const skip = (page - 1) * limit;

    const queryBuilder = this.serviceRepo
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category');

    if (search) {
      queryBuilder.andWhere(
        '(service.name LIKE :search OR service.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('service.status = :status', { status });
    }

    if (category_id) {
      queryBuilder.andWhere('service.category_id = :category_id', { category_id });
    }

    if (is_combo !== undefined) {
      queryBuilder.andWhere('service.is_combo = :is_combo', { is_combo });
    }

    if (min_price !== undefined && max_price !== undefined) {
      queryBuilder.andWhere('service.price BETWEEN :min_price AND :max_price', {
        min_price,
        max_price,
      });
    } else if (min_price !== undefined) {
      queryBuilder.andWhere('service.price >= :min_price', { min_price });
    } else if (max_price !== undefined) {
      queryBuilder.andWhere('service.price <= :max_price', { max_price });
    }

    if (min_duration !== undefined && max_duration !== undefined) {
      queryBuilder.andWhere(
        'service.duration_minutes BETWEEN :min_duration AND :max_duration',
        { min_duration, max_duration },
      );
    } else if (min_duration !== undefined) {
      queryBuilder.andWhere('service.duration_minutes >= :min_duration', { min_duration });
    } else if (max_duration !== undefined) {
      queryBuilder.andWhere('service.duration_minutes <= :max_duration', { max_duration });
    }

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .orderBy('service.created_at', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<ServiceEntity> {
    return await this.serviceRepo.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async update(id: number, dto: UpdateServiceDto): Promise<ServiceEntity> {
    await this.serviceRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.serviceRepo.delete(id);
  }

  async findByCategory(categoryId: number): Promise<ServiceEntity[]> {
    return await this.serviceRepo.find({
      where: { category_id: categoryId },
      relations: ['category'],
    });
  }

  async findActiveServices(): Promise<ServiceEntity[]> {
    return await this.serviceRepo.find({
      where: { status: ServiceStatus.ACTIVE },
      relations: ['category'],
      order: { created_at: 'DESC' },
    });
  }

  async findComboServices(): Promise<ServiceEntity[]> {
    return await this.serviceRepo.find({
      where: { is_combo: true, status: ServiceStatus.ACTIVE },
      relations: ['category'],
    });
  }
}