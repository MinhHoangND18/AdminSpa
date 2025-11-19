import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
  FilterServiceDto,
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  FilterServiceCategoryDto,
} from './services.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // ============= SERVICE CATEGORY ENDPOINTS =============
  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'store_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create service category' })
  createCategory(@Body() dto: CreateServiceCategoryDto) {
    return this.servicesService.createCategory(dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all service categories' })
  findAllCategories(@Query() filter: FilterServiceCategoryDto) {
    return this.servicesService.findAllCategories(filter);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by id' })
  findOneCategory(@Param('id') id: string) {
    return this.servicesService.findOneCategory(+id);
  }

  @Put('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'store_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateServiceCategoryDto) {
    return this.servicesService.updateCategory(+id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category' })
  removeCategory(@Param('id') id: string) {
    return this.servicesService.removeCategory(+id);
  }

  // ============= SERVICE ENDPOINTS =============
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'store_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create service' })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  findAll(@Query() filter: FilterServiceDto) {
    return this.servicesService.findAll(filter);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active services' })
  findAllActive(@Query() filter: FilterServiceDto) {
    return this.servicesService.findAllActive(filter);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get services by category' })
  findByCategory(@Param('categoryId') categoryId: string, @Query() filter: FilterServiceDto) {
    return this.servicesService.findByCategory(+categoryId, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by id' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'store_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete service' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'store_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.servicesService.updateStatus(+id, status);
  }
}