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
import { PermissionsService } from './permissions.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  AssignPermissionDto,
  FilterPermissionDto,
} from './permissions.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create new permission' })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  findAll(@Query() filter: FilterPermissionDto) {
    return this.permissionsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by id' })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Put(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update permission' })
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionsService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Delete permission' })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }

  @Post('assign')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Assign permission to role' })
  assignToRole(@Body() dto: AssignPermissionDto) {
    return this.permissionsService.assignToRole(dto);
  }

  @Get('role/:role')
  @ApiOperation({ summary: 'Get permissions by role' })
  getByRole(@Param('role') role: string) {
    return this.permissionsService.getByRole(role);
  }

  @Delete('role/:role/permission/:permissionId')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Remove permission from role' })
  removeFromRole(
    @Param('role') role: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.permissionsService.removeFromRole(role, +permissionId);
  }
}
