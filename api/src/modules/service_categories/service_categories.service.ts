import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ServiceCategory } from './entities/service_categories.entity';
import {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  QueryServiceCategoryDto,
  ReorderCategoryDto,
} from './dto/service_categories.dto';

@Injectable()
export class ServiceCategoriesService {
  constructor(
    @InjectRepository(ServiceCategory)
    private readonly categoryRepository: Repository<ServiceCategory>,
  ) {}

  /**
   * Generate slug from Vietnamese text
   */
  private generateSlug(text: string): string {
    // Remove Vietnamese accents
    const from =
      'àáãảạăằắằắặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ';
    const to =
      'aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy';

    let slug = text.toLowerCase();
    for (let i = 0; i < from.length; i++) {
      slug = slug.replace(new RegExp(from[i], 'g'), to[i]);
    }

    slug = slug
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    return slug;
  }

  async create(
    createDto: CreateServiceCategoryDto,
  ): Promise<ServiceCategory> {
    // Generate slug if not provided
    if (!createDto.slug) {
      createDto.slug = this.generateSlug(createDto.name);
    }

    // Check if slug already exists
    const existingSlug = await this.categoryRepository.findOne({
      where: { slug: createDto.slug },
    });
    if (existingSlug) {
      throw new ConflictException(
        `Category with slug "${createDto.slug}" already exists`,
      );
    }

    // If displayOrder not provided, set it to max + 1
    if (createDto.displayOrder === undefined) {
      const maxOrder = await this.categoryRepository
        .createQueryBuilder('category')
        .select('MAX(category.displayOrder)', 'max')
        .getRawOne();
      createDto.displayOrder = (maxOrder?.max || 0) + 1;
    }

    const category = this.categoryRepository.create(createDto);
    return await this.categoryRepository.save(category);
  }

  async findAll(queryDto: QueryServiceCategoryDto) {
    const { search, isActive, sortByOrder, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.categoryRepository.createQueryBuilder('category');

    if (search) {
      queryBuilder.where(
        '(category.name LIKE :search OR category.slug LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }

    // Sort by displayOrder if requested, otherwise by createdAt
    if (sortByOrder) {
      queryBuilder.orderBy('category.displayOrder', 'ASC');
    } else {
      queryBuilder.orderBy('category.createdAt', 'ASC');
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

  async findAllActive(): Promise<ServiceCategory[]> {
    return await this.categoryRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<ServiceCategory> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException(
        `Service category with slug "${slug}" not found`,
      );
    }

    return category;
  }

  async findOne(id: number): Promise<ServiceCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Service category with ID ${id} not found`);
    }

    return category;
  }

  async update(
    id: number,
    updateDto: UpdateServiceCategoryDto,
  ): Promise<ServiceCategory> {
    const category = await this.findOne(id);

    // If name is being updated and slug is not provided, regenerate slug
    if (updateDto.name && !updateDto.slug) {
      updateDto.slug = this.generateSlug(updateDto.name);
    }

    // Check if slug is being updated and already exists
    if (updateDto.slug && updateDto.slug !== category.slug) {
      const existingSlug = await this.categoryRepository.findOne({
        where: { slug: updateDto.slug },
      });
      if (existingSlug) {
        throw new ConflictException(
          `Category with slug "${updateDto.slug}" already exists`,
        );
      }
    }

    Object.assign(category, updateDto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  async activate(id: number): Promise<ServiceCategory> {
    const category = await this.findOne(id);
    category.isActive = true;
    return await this.categoryRepository.save(category);
  }

  async deactivate(id: number): Promise<ServiceCategory> {
    const category = await this.findOne(id);
    category.isActive = false;
    return await this.categoryRepository.save(category);
  }

  async reorder(reorderDto: ReorderCategoryDto): Promise<ServiceCategory[]> {
    const { categoryIds } = reorderDto;

    // Verify all categories exist
    const categories = await this.categoryRepository.find({
      where: { id: In(categoryIds) },
    });

    if (categories.length !== categoryIds.length) {
      throw new BadRequestException('Some category IDs are invalid');
    }

    // Update display order for each category
    const updatePromises = categoryIds.map((id, index) => {
      return this.categoryRepository.update(id, { displayOrder: index + 1 });
    });

    await Promise.all(updatePromises);

    // Return updated categories in new order
    return await this.categoryRepository.find({
      where: { id: In(categoryIds) },
      order: { displayOrder: 'ASC' },
    });
  }

  async getStatistics() {
    const [total, active, inactive] = await Promise.all([
      this.categoryRepository.count(),
      this.categoryRepository.count({ where: { isActive: true } }),
      this.categoryRepository.count({ where: { isActive: false } }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }
}