import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Store } from '../stores/entities/store.entity';
import { CreateStoreDto, UpdateStoreDto, QueryStoreDto } from './stores.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    // Check if code already exists
    const existingCode = await this.storeRepository.findOne({
      where: { code: createStoreDto.code },
    });
    if (existingCode) {
      throw new ConflictException('Store code already exists');
    }

    // Check if domain already exists (if provided)
    if (createStoreDto.domain) {
      const existingDomain = await this.storeRepository.findOne({
        where: { domain: createStoreDto.domain },
      });
      if (existingDomain) {
        throw new ConflictException('Store domain already exists');
      }
    }

    const store = this.storeRepository.create(createStoreDto);
    return await this.storeRepository.save(store);
  }

  async findAll(queryDto: QueryStoreDto) {
    const { search, isActive, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.storeRepository
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.manager', 'manager');

    if (search) {
      queryBuilder.where(
        '(store.name LIKE :search OR store.code LIKE :search OR store.address LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('store.isActive = :isActive', { isActive });
    }

    queryBuilder.skip(skip).take(limit).orderBy('store.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['manager'],
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return store;
  }

  async findByCode(code: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { code },
      relations: ['manager'],
    });

    if (!store) {
      throw new NotFoundException(`Store with code ${code} not found`);
    }

    return store;
  }

  async update(id: number, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);

    // Check if code is being updated and already exists
    if (updateStoreDto.code && updateStoreDto.code !== store.code) {
      const existingCode = await this.storeRepository.findOne({
        where: { code: updateStoreDto.code },
      });
      if (existingCode) {
        throw new ConflictException('Store code already exists');
      }
    }

    // Check if domain is being updated and already exists
    if (updateStoreDto.domain && updateStoreDto.domain !== store.domain) {
      const existingDomain = await this.storeRepository.findOne({
        where: { domain: updateStoreDto.domain },
      });
      if (existingDomain) {
        throw new ConflictException('Store domain already exists');
      }
    }

    Object.assign(store, updateStoreDto);
    return await this.storeRepository.save(store);
  }

  async remove(id: number): Promise<void> {
    const store = await this.findOne(id);
    await this.storeRepository.remove(store);
  }

  async softDelete(id: number): Promise<Store> {
    const store = await this.findOne(id);
    store.isActive = false;
    return await this.storeRepository.save(store);
  }

  async activate(id: number): Promise<Store> {
    const store = await this.findOne(id);
    store.isActive = true;
    return await this.storeRepository.save(store);
  }
}