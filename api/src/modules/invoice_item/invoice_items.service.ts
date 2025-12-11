import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceItem } from './entities/invoice_item.entity';
import { CreateInvoiceItemDto, UpdateInvoiceItemDto, QueryInvoiceItemDto } from './dto/invoice_item.dto';

@Injectable()
export class InvoiceItemsService {
  constructor(
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  async create(createInvoiceItemDto: CreateInvoiceItemDto): Promise<InvoiceItem> {

    const expectedTotal = (createInvoiceItemDto.unitPrice * (createInvoiceItemDto.quantity || 1)) - (createInvoiceItemDto.discount || 0);
    
    if (Math.abs(expectedTotal - createInvoiceItemDto.totalPrice) > 0.01) {
      throw new BadRequestException(
        `Total price mismatch. Expected: ${expectedTotal}, Got: ${createInvoiceItemDto.totalPrice}`
      );
    }

    const invoiceItem = this.invoiceItemRepository.create(createInvoiceItemDto);
    return await this.invoiceItemRepository.save(invoiceItem);
  }

  async createMultiple(createInvoiceItemDtos: CreateInvoiceItemDto[]): Promise<InvoiceItem[]> {
    const items: InvoiceItem[] = [];
    
    for (const dto of createInvoiceItemDtos) {
      const item = await this.create(dto);
      items.push(item);
    }
    
    return items;
  }

  async findAll(query: QueryInvoiceItemDto = {}) {
    const { 
      page = 1, 
      limit = 10, 
      invoiceId,
      itemType,
      staffId
    } = query;
    
    const queryBuilder = this.invoiceItemRepository
      .createQueryBuilder('invoiceItem')
      .leftJoinAndSelect('invoiceItem.invoice', 'invoice')
      .leftJoinAndSelect('invoiceItem.staff', 'staff');

    if (invoiceId) {
      queryBuilder.andWhere('invoiceItem.invoiceId = :invoiceId', { invoiceId });
    }

    if (itemType) {
      queryBuilder.andWhere('invoiceItem.itemType = :itemType', { itemType });
    }

    if (staffId) {
      queryBuilder.andWhere('invoiceItem.staffId = :staffId', { staffId });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('invoiceItem.id', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<InvoiceItem> {
    const invoiceItem = await this.invoiceItemRepository.findOne({
      where: { id },
      relations: ['invoice', 'staff'],
    });

    if (!invoiceItem) {
      throw new NotFoundException(`Invoice item with ID ${id} not found`);
    }

    return invoiceItem;
  }

  async findByInvoiceId(invoiceId: number): Promise<InvoiceItem[]> {
    return await this.invoiceItemRepository.find({
      where: { invoiceId },
      relations: ['invoice', 'staff'],
      order: { id: 'DESC' }
    });
  }

  async update(id: number, updateInvoiceItemDto: UpdateInvoiceItemDto): Promise<InvoiceItem> {
    const invoiceItem = await this.findOne(id);

    // Validate totalPrice if any pricing field is updated
    if (updateInvoiceItemDto.unitPrice || updateInvoiceItemDto.quantity || updateInvoiceItemDto.discount || updateInvoiceItemDto.totalPrice) {
      const unitPrice = updateInvoiceItemDto.unitPrice ?? invoiceItem.unitPrice;
      const quantity = updateInvoiceItemDto.quantity ?? invoiceItem.quantity;
      const discount = updateInvoiceItemDto.discount ?? invoiceItem.discount;
      const totalPrice = updateInvoiceItemDto.totalPrice ?? invoiceItem.totalPrice;

      const expectedTotal = (unitPrice * quantity) - discount;
      
      if (Math.abs(expectedTotal - totalPrice) > 0.01) {
        throw new BadRequestException(
          `Total price mismatch. Expected: ${expectedTotal}, Got: ${totalPrice}`
        );
      }
    }

    Object.assign(invoiceItem, updateInvoiceItemDto);
    return await this.invoiceItemRepository.save(invoiceItem);
  }

  async remove(id: number): Promise<void> {
    const invoiceItem = await this.findOne(id);
    await this.invoiceItemRepository.remove(invoiceItem);
  }

  async removeByInvoiceId(invoiceId: number): Promise<void> {
    await this.invoiceItemRepository.delete({ invoiceId });
  }

  async calculateInvoiceTotal(invoiceId: number): Promise<number> {
    const result = await this.invoiceItemRepository
      .createQueryBuilder('invoiceItem')
      .select('SUM(invoiceItem.totalPrice)', 'total')
      .where('invoiceItem.invoiceId = :invoiceId', { invoiceId })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  async getItemsByStaff(staffId: number, startDate?: string, endDate?: string) {
    const queryBuilder = this.invoiceItemRepository
      .createQueryBuilder('invoiceItem')
      .leftJoinAndSelect('invoiceItem.invoice', 'invoice')
      .where('invoiceItem.staffId = :staffId', { staffId });

    if (startDate && endDate) {
      queryBuilder.andWhere('invoice.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });
    }

    return await queryBuilder.getMany();
  }
}