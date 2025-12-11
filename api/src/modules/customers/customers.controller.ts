import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  QueryCustomerDto,
} from './customers.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo khách hàng mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Khách hàng được tạo thành công',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Số điện thoại hoặc email đã tồn tại',
  })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khách hàng với phân trang và lọc' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách khách hàng được trả về thành công',
  })
  findAll(@Query() queryDto: QueryCustomerDto) {
    return this.customersService.findAll(queryDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Lấy thống kê khách hàng' })
  @ApiQuery({ name: 'storeId', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thống kê khách hàng',
  })
  getStatistics(@Query('storeId') storeId?: string) {
    let parsedStoreId: number | undefined;

    if (storeId) {
      const num = parseInt(storeId, 10);

      if (!isNaN(num)) {
        parsedStoreId = num;
      }
    }

    return this.customersService.getStatistics(parsedStoreId);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin khách hàng theo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tìm thấy khách hàng' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy khách hàng',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: 'Lấy thông tin khách hàng theo số điện thoại' })
  @ApiParam({ name: 'phone', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tìm thấy khách hàng' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy khách hàng',
  })
  findByPhone(@Param('phone') phone: string) {
    return this.customersService.findByPhone(phone);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin khách hàng' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật khách hàng thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy khách hàng',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Số điện thoại hoặc email đã tồn tại',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa khách hàng vĩnh viễn' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Xóa khách hàng thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy khách hàng',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.remove(id);
  }

  @Patch(':id/block')
  @ApiOperation({ summary: 'Chặn khách hàng' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chặn khách hàng thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy khách hàng',
  })
  blockCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.blockCustomer(id);
  }

  @Patch(':id/unblock')
  @ApiOperation({ summary: 'Bỏ chặn khách hàng' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bỏ chặn khách hàng thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy khách hàng',
  })
  unblockCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.unblockCustomer(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Vô hiệu hóa khách hàng' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vô hiệu hóa khách hàng thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy khách hàng',
  })
  deactivateCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.deactivateCustomer(id);
  }
}