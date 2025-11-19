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
import { ServiceCategoriesService } from './service_categories.service';
import {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  QueryServiceCategoryDto,
  ReorderCategoryDto,
} from './dto/service_categories.dto';

@ApiTags('service-categories')
@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(
    private readonly categoriesService: ServiceCategoriesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo danh mục dịch vụ mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Danh mục được tạo thành công. Tự động generate slug nếu không cung cấp',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Slug đã tồn tại',
  })
  create(@Body() createDto: CreateServiceCategoryDto) {
    return this.categoriesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách danh mục với phân trang và lọc' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách danh mục được trả về thành công',
  })
  findAll(@Query() queryDto: QueryServiceCategoryDto) {
    return this.categoriesService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy tất cả danh mục đang active (không phân trang)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách danh mục active, sắp xếp theo displayOrder',
  })
  findAllActive() {
    return this.categoriesService.findAllActive();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Lấy thống kê danh mục' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thống kê danh mục',
  })
  getStatistics() {
    return this.categoriesService.getStatistics();
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Sắp xếp lại thứ tự hiển thị danh mục' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thứ tự thành công',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID danh mục không hợp lệ',
  })
  reorder(@Body() reorderDto: ReorderCategoryDto) {
    return this.categoriesService.reorder(reorderDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết danh mục theo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tìm thấy danh mục',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy danh mục',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy danh mục theo slug' })
  @ApiParam({ name: 'slug', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tìm thấy danh mục',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy danh mục',
  })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật danh mục thành công. Tự động generate slug nếu đổi tên',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy danh mục',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Slug đã tồn tại',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateServiceCategoryDto,
  ) {
    return this.categoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa danh mục vĩnh viễn' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Xóa danh mục thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy danh mục',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Kích hoạt danh mục' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Kích hoạt danh mục thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy danh mục',
  })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Vô hiệu hóa danh mục' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vô hiệu hóa danh mục thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy danh mục',
  })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deactivate(id);
  }
}