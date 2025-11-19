import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServicesRepository } from './services.repository';
import { ServiceEntity } from './entities/service.entity';
import { ServiceCategoryEntity } from './entities/service-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceEntity, ServiceCategoryEntity])],
  controllers: [ServicesController],
  providers: [ServicesService, ServicesRepository],
  exports: [ServicesService],
})
export class ServicesModule {}