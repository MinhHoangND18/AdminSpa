import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Customer,
  CustomerType,
  CustomerStatus,
} from './entities/customer.entity';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  QueryCustomerDto,
} from './customers.dto';
import { Invoice, PaymentStatus } from '../invoices/entities/invoice.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async findOrCreate(customerData: {
    phone: string;
    fullName: string;
    email?: string;
  }): Promise<Customer> {
    let customer = await this.customerRepository.findOne({
      where: { phone: customerData.phone },
    });

    if (customer) {
      return customer;
    }

    customer = this.customerRepository.create({
      ...customerData,
      customerType: CustomerType.NEW,
      status: CustomerStatus.ACTIVE,
    });

    return await this.customerRepository.save(customer);
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const existingPhone = await this.customerRepository.findOne({
      where: { phone: createCustomerDto.phone },
    });
    if (existingPhone) {
      throw new ConflictException('Phone number already exists');
    }
    if (createCustomerDto.email) {
      const existingEmail = await this.customerRepository.findOne({
        where: { email: createCustomerDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    const customer = this.customerRepository.create(createCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async findAll(queryDto: QueryCustomerDto) {
    const {
      search,
      gender,
      customerType,
      status,
      storeId,
      page = 1,
      limit = 10,
    } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.store', 'store');

    if (search) {
      queryBuilder.where(
        '(customer.fullName LIKE :search OR customer.phone LIKE :search OR customer.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (gender) {
      queryBuilder.andWhere('customer.gender = :gender', { gender });
    }

    if (customerType) {
      queryBuilder.andWhere('customer.customerType = :customerType', {
        customerType,
      });
    }

    if (status) {
      queryBuilder.andWhere('customer.status = :status', { status });
    }

    if (storeId) {
      queryBuilder.andWhere('customer.storeId = :storeId', { storeId });
    }

    queryBuilder.skip(skip).take(limit).orderBy('customer.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    const enhancedData = await Promise.all(
      data.map(async (customer) => {
        const stats = await this.invoiceRepository
          .createQueryBuilder('invoice')
          .select('SUM(invoice.paidAmount)', 'totalSpent')
          .addSelect('COUNT(invoice.id)', 'totalVisits')
          .where('invoice.customerId = :customerId', {
            customerId: customer.id,
          })
          .andWhere('invoice.paymentStatus = :status', {
            status: PaymentStatus.PAID,
          })
          .getRawOne();

        return {
          ...customer,
          totalSpent: parseFloat(stats.totalSpent) || 0,
          totalVisits: parseInt(stats.totalVisits, 10) || 0,
        };
      }),
    );

    return {
      data: enhancedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const stats = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.paidAmount)', 'totalSpent')
      .addSelect('COUNT(invoice.id)', 'totalVisits')
      .where('invoice.customerId = :customerId', { customerId: customer.id })
      .andWhere('invoice.paymentStatus = :status', {
        status: PaymentStatus.PAID,
      })
      .getRawOne();

    customer.totalSpent = parseFloat(stats.totalSpent) || 0;
    customer.totalVisits = parseInt(stats.totalVisits, 10) || 0;

    return customer;
  }

  async findByPhone(phone: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { phone },
      relations: ['store'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with phone ${phone} not found`);
    }

    const stats = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.paidAmount)', 'totalSpent')
      .addSelect('COUNT(invoice.id)', 'totalVisits')
      .where('invoice.customerId = :customerId', { customerId: customer.id })
      .andWhere('invoice.paymentStatus = :status', {
        status: PaymentStatus.PAID,
      })
      .getRawOne();

    customer.totalSpent = parseFloat(stats.totalSpent) || 0;
    customer.totalVisits = parseInt(stats.totalVisits, 10) || 0;

    return customer;
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    // Check if phone is being updated and already exists
    if (updateCustomerDto.phone && updateCustomerDto.phone !== customer.phone) {
      const existingPhone = await this.customerRepository.findOne({
        where: { phone: updateCustomerDto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    // Check if email is being updated and already exists
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingEmail = await this.customerRepository.findOne({
        where: { email: updateCustomerDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }

  async blockCustomer(id: number): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.status = CustomerStatus.BLOCKED;
    return await this.customerRepository.save(customer);
  }

  async unblockCustomer(id: number): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.status = CustomerStatus.ACTIVE;
    return await this.customerRepository.save(customer);
  }

  async deactivateCustomer(id: number): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.status = CustomerStatus.INACTIVE;
    return await this.customerRepository.save(customer);
  }

  async getStatistics(storeId?: number) {
    const queryBuilder = this.customerRepository.createQueryBuilder('customer');

    if (storeId) {
      queryBuilder.where('customer.storeId = :storeId', { storeId });
    }

    const [
      totalCustomers,
      activeCustomers,
      newCustomers,
      regularCustomers,
      vipCustomers,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .clone()
        .andWhere('customer.status = :status', {
          status: CustomerStatus.ACTIVE,
        })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('customer.customerType = :type', { type: CustomerType.NEW })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('customer.customerType = :type', {
          type: CustomerType.REGULAR,
        })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('customer.customerType = :type', { type: CustomerType.VIP })
        .getCount(),
    ]);

    const totalSpent = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.paidAmount)', 'total')
      .where('invoice.paymentStatus = :status', { status: PaymentStatus.PAID })
      .getRawOne();

    return {
      totalCustomers,
      activeCustomers,
      newCustomers,
      regularCustomers,
      vipCustomers,
      totalRevenue: totalSpent?.total || 0,
    };
  }
}