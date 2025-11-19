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
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
  QueryServiceDto,
  ServiceStatisticsDto,
} from './services.dto';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo dịch vụ mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dịch vụ được tạo thành công',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Giá giảm phải nhỏ hơn giá gốc',
  })
  create(@Body() createDto: CreateServiceDto) {
    return this.servicesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách dịch vụ với phân trang và lọc' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách dịch vụ được trả về thành công',
  })
  findAll(@Query() queryDto: QueryServiceDto) {
    return this.servicesService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy tất cả dịch vụ đang active' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách dịch vụ active',
  })
  findAllActive() {
    return this.servicesService.findAllActive();
  }

  @Get('combos')
  @ApiOperation({ summary: 'Lấy tất cả dịch vụ combo đang active' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách combo',
  })
  findCombos() {
    return this.servicesService.findCombos();
  }

  @Get('discounted')
  @ApiOperation({ summary: 'Lấy tất cả dịch vụ đang giảm giá' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách dịch vụ giảm giá',
  })
  findDiscounted() {
    return this.servicesService.findDiscounted();
  }

  @Get('menu')
  @ApiOperation({ summary: 'Lấy dịch vụ theo danh mục cho menu (grouped by category)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách categories và services grouped by category',
  })
  findForMenu(@Query('lang') lang: string) {
    return this.servicesService.findForMenu();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Lấy thống kê dịch vụ' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thống kê dịch vụ chi tiết',
  })
  getStatistics(@Query() statsDto: ServiceStatisticsDto) {
    return this.servicesService.getStatistics(statsDto);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Lấy dịch vụ theo danh mục' })
  @ApiParam({ name: 'categoryId', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách dịch vụ trong danh mục',
  })
  findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.servicesService.findByCategory(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết dịch vụ theo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tìm thấy dịch vụ',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy dịch vụ',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật dịch vụ' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật dịch vụ thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy dịch vụ',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Giá giảm phải nhỏ hơn giá gốc',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa dịch vụ vĩnh viễn' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Xóa dịch vụ thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy dịch vụ',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Kích hoạt dịch vụ' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Kích hoạt dịch vụ thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy dịch vụ',
  })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Vô hiệu hóa dịch vụ' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vô hiệu hóa dịch vụ thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy dịch vụ',
  })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.deactivate(id);
  }
}