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
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly usersService: UsersService,
  ) {}

  private async validateManager(manager_id: number): Promise<void> {
    if (!manager_id) return;

    const managerUser = await this.usersService.findOne(manager_id);

    if (managerUser.role !== UserRole.MANAGER) {
      throw new BadRequestException(
        `User ID ${manager_id} must have the role '${UserRole.MANAGER}' to be assigned as a store manager. Current role: ${managerUser.role}.`,
      );
    }
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    if (createStoreDto.manager_id) {
      await this.validateManager(createStoreDto.manager_id);
    }

    const existingCode = await this.storeRepository.findOne({
      where: { code: createStoreDto.code },
    });
    if (existingCode) {
      throw new ConflictException('Store code already exists');
    }

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

    queryBuilder.skip(skip).take(limit).orderBy('store.id', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    const sanitizedData = data.map((store) => this.sanitize(store));
    return {
      data: sanitizedData,
      total,
      page: queryDto.page ?? 1,
      limit: queryDto.limit ?? 10,
      totalPages: Math.ceil(total / limit),
    };
  }
  private sanitize(store: Store) {
    const { manager, ...rest } = store;
    const manager_name = manager ? manager.username : undefined;
    const sanitizedStore: any = {
      ...rest,
      manager_name: manager_name,
    };
    return sanitizedStore;
  }
  async findOne(id: number): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['manager'],
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return this.sanitize(store);
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

    if (updateStoreDto.manager_id) {
      await this.validateManager(updateStoreDto.manager_id);
    }

    if (updateStoreDto.code && updateStoreDto.code !== store.code) {
      const existingCode = await this.storeRepository.findOne({
        where: { code: updateStoreDto.code },
      });
      if (existingCode && existingCode.id !== store.id) {
        throw new ConflictException('Store code already exists');
      }
    }

    if (updateStoreDto.domain && updateStoreDto.domain !== store.domain) {
      const existingDomain = await this.storeRepository.findOne({
        where: { domain: updateStoreDto.domain },
      });
      if (existingDomain && existingDomain.id !== store.id) {
        throw new ConflictException('Store domain already exists');
      }
    }

    Object.assign(store, updateStoreDto);
    const saved = await this.storeRepository.save(store);
    return this.sanitize(saved);
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
