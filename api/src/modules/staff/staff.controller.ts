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
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto, FilterStaffDto } from './staff.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @Roles('super_admin', 'store_admin', 'manager')
  @ApiOperation({ summary: 'Create new staff' })
  create(@Body() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all staff' })
  findAll(@Query() filter: FilterStaffDto) {
    return this.staffService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff by id' })
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(+id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get staff by code' })
  findByCode(@Param('code') code: string) {
    return this.staffService.findByCode(code);
  }

  @Put(':id')
  @Roles('super_admin', 'store_admin', 'manager')
  @ApiOperation({ summary: 'Update staff' })
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.staffService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('super_admin', 'store_admin')
  @ApiOperation({ summary: 'Delete staff' })
  remove(@Param('id') id: string) {
    return this.staffService.remove(+id);
  }

  @Put(':id/status')
  @Roles('super_admin', 'store_admin', 'manager')
  @ApiOperation({ summary: 'Update staff status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.staffService.updateStatus(+id, status);
  }
}