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
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto, QueryStoreDto } from './stores.dto';

@ApiTags('stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new store' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Store created successfully',
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Code or domain already exists' })
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stores with pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Stores retrieved successfully' })
  findAll(@Query() queryDto: QueryStoreDto) {
    return this.storesService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a store by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Store found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Store not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storesService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get a store by code' })
  @ApiParam({ name: 'code', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Store found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Store not found' })
  findByCode(@Param('code') code: string) {
    return this.storesService.findByCode(code);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a store' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Store updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Store not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Code or domain already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a store permanently' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Store deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Store not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.storesService.remove(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a store (soft delete)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Store deactivated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Store not found' })
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.storesService.softDelete(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a store' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Store activated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Store not found' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.storesService.activate(id);
  }
}