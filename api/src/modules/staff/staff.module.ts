import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Staff]), forwardRef(() => UsersModule)],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService], // nếu module khác cần dùng
})
export class StaffModule {}