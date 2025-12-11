import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Service, ServiceStatus } from './entities/service.entity';
import { ServiceCategory } from '../service_categories/entities/service_categories.entity';
import {
  CreateServiceDto,
  UpdateServiceDto,
  QueryServiceDto,
  ServiceStatisticsDto,
} from './services.dto';

const USD_TO_VND_RATE = 27000;

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private readonly categoryRepository: Repository<ServiceCategory>,
  ) {}

  private calculatePriceUSD(priceVND: number): number {
    const roundedVND = Math.round(priceVND);
    return Number((roundedVND / USD_TO_VND_RATE).toFixed(2));
  }

  async create(createDto: CreateServiceDto): Promise<Service> {
    // Validate discount price
    if (
      createDto.discountPrice !== undefined &&
      createDto.discountPrice !== null &&
      createDto.discountPrice >= createDto.price
    ) {
      throw new BadRequestException(
        'Discount price must be less than regular price',
      );
    }

    const priceUSD = this.calculatePriceUSD(createDto.price);
    const service = this.serviceRepository.create({
      ...createDto,
      priceUSD: priceUSD,
    });
    
    return await this.serviceRepository.save(service);
  }

  async findAll(queryDto: QueryServiceDto) {
    const {
      search,
      categoryId,
      status,
      isCombo,
      hasDiscount,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      sortBy,
      page = 1,
      limit = 10,
    } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category');

    if (search) {
      queryBuilder.where(
        '(service.name LIKE :search OR service.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('service.categoryId = :categoryId', { categoryId });
    }

    if (status) {
      queryBuilder.andWhere('service.status = :status', { status });
    }

    if (isCombo !== undefined) {
      queryBuilder.andWhere('service.isCombo = :isCombo', { isCombo });
    }

    if (hasDiscount) {
      queryBuilder.andWhere('service.discountPrice IS NOT NULL');
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('service.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('service.price <= :maxPrice', { maxPrice });
    }

    if (minDuration !== undefined) {
      queryBuilder.andWhere('service.durationMinutes >= :minDuration', {
        minDuration,
      });
    }

    if (maxDuration !== undefined) {
      queryBuilder.andWhere('service.durationMinutes <= :maxDuration', {
        maxDuration,
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        queryBuilder.orderBy('service.price', 'DESC');
        break;
      case 'price_desc':
        queryBuilder.orderBy('service.price', 'DESC');
        break;
      case 'duration_asc':
        queryBuilder.orderBy('service.durationMinutes', 'DESC');
        break;
      case 'duration_desc':
        queryBuilder.orderBy('service.durationMinutes', 'DESC');
        break;
      case 'newest':
        queryBuilder.orderBy('service.createdAt', 'DESC');
        break;
      default:
        queryBuilder.orderBy('service.createdAt', 'DESC');
    }

    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllActive(): Promise<Service[]> {
    return await this.serviceRepository.find({
      where: { status: ServiceStatus.ACTIVE },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCategory(categoryId: number): Promise<Service[]> {
    return await this.serviceRepository.find({
      where: {
        categoryId,
        status: ServiceStatus.ACTIVE,
      },
      relations: ['category'],
      order: { price: 'DESC' },
    });
  }

  async findCombos(): Promise<Service[]> {
    return await this.serviceRepository.find({
      where: {
        isCombo: true,
        status: ServiceStatus.ACTIVE,
      },
      relations: ['category'],
      order: { price: 'DESC' },
    });
  }

  async findDiscounted(): Promise<Service[]> {
    const queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category')
      .where('service.discountPrice IS NOT NULL')
      .andWhere('service.status = :status', { status: ServiceStatus.ACTIVE })
      .orderBy('service.discountPrice', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async update(id: number, updateDto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOne(id);

    // Validate discount price
    const newPrice = updateDto.price ?? service.price;
    const newDiscountPrice =
      updateDto.discountPrice !== undefined
        ? updateDto.discountPrice
        : service.discountPrice;

    if (
      newDiscountPrice !== null &&
      newDiscountPrice !== undefined &&
      newDiscountPrice >= newPrice
    ) {
      throw new BadRequestException(
        'Discount price must be less than regular price',
      );
    }
    
    if (updateDto.price !== undefined) {
      updateDto.priceUSD = this.calculatePriceUSD(updateDto.price);
    }

    Object.assign(service, updateDto);
    return await this.serviceRepository.save(service);
  }

  async remove(id: number): Promise<void> {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
  }

  async activate(id: number): Promise<Service> {
    const service = await this.findOne(id);
    service.status = ServiceStatus.ACTIVE;
    return await this.serviceRepository.save(service);
  }

  async deactivate(id: number): Promise<Service> {
    const service = await this.findOne(id);
    service.status = ServiceStatus.INACTIVE;
    return await this.serviceRepository.save(service);
  }

  async getStatistics(statsDto: ServiceStatisticsDto) {
    const { categoryId } = statsDto;

    const queryBuilder = this.serviceRepository.createQueryBuilder('service');

    if (categoryId) {
      queryBuilder.where('service.categoryId = :categoryId', { categoryId });
    }

    const [
      totalServices,
      activeServices,
      inactiveServices,
      comboServices,
      discountedServices,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .clone()
        .andWhere('service.status = :status', { status: ServiceStatus.ACTIVE })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('service.status = :status', { status: ServiceStatus.INACTIVE })
        .getCount(),
      queryBuilder.clone().andWhere('service.isCombo = :isCombo', { isCombo: true }).getCount(),
      queryBuilder.clone().andWhere('service.discountPrice IS NOT NULL').getCount(),
    ]);

    const priceStats = await queryBuilder
      .select('AVG(service.price)', 'avgPrice')
      .addSelect('MIN(service.price)', 'minPrice')
      .addSelect('MAX(service.price)', 'maxPrice')
      .getRawOne();

    const durationStats = await queryBuilder
      .select('AVG(service.durationMinutes)', 'avgDuration')
      .addSelect('MIN(service.durationMinutes)', 'minDuration')
      .addSelect('MAX(service.durationMinutes)', 'maxDuration')
      .getRawOne();

    // Top services by price
    const topExpensive = await this.serviceRepository.find({
      where: categoryId ? { categoryId } : {},
      order: { price: 'DESC' },
      take: 5,
      relations: ['category'],
    });

    // Services by category
    const servicesByCategory = await this.serviceRepository
      .createQueryBuilder('service')
      .select('category.name', 'categoryName')
      .addSelect('COUNT(service.id)', 'count')
      .leftJoin('service.category', 'category')
      .groupBy('service.categoryId')
      .addGroupBy('category.name')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      totalServices,
      activeServices,
      inactiveServices,
      comboServices,
      discountedServices,
      priceStatistics: {
        average: Math.round(priceStats?.avgPrice || 0),
        min: priceStats?.minPrice || 0,
        max: priceStats?.maxPrice || 0,
      },
      durationStatistics: {
        average: Math.round(durationStats?.avgDuration || 0),
        min: durationStats?.minDuration || 0,
        max: durationStats?.maxDuration || 0,
      },
      topExpensiveServices: topExpensive,
      servicesByCategory,
    };
  }

  async findForMenu(): Promise<{ categories: any[]; servicesByCategory: any }> {
    // Get all active categories ordered by displayOrder
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'DESC' },
    });

    // Get all active services with their categories
    const services = await this.serviceRepository.find({
      where: { status: ServiceStatus.ACTIVE },
      relations: ['category'],
      order: { price: 'DESC' },
    });

    // Group services by category
    const servicesByCategory: { [key: string]: any[] } = {};
    
    categories.forEach((category) => {
      servicesByCategory[category.id.toString()] = services
        .filter((service) => service.categoryId === category.id)
        .map((service) => ({
          id: service.id.toString(),
          title: service.name,
          description: service.description || '',
          duration: `${service.durationMinutes} ${service.durationMinutes === 1 ? 'minute' : 'minutes'}`,
          price: this.formatPrice(service.discountPrice || service.price),
          priceValue: Number(service.discountPrice || service.price),
        }));
    });

    return {
      categories: categories.map((cat) => ({
        id: cat.id.toString(),
        name: cat.name,
        displayOrder: cat.displayOrder,
      })),
      servicesByCategory,
    };
  }

  private formatPrice(price: number): string {
    const vndPrice = Math.round(price);
    const usdPrice = (price / USD_TO_VND_RATE).toFixed(2); 
    return `${vndPrice.toLocaleString('vi-VN')} ₫ ($${usdPrice})`;
  }
}