import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { StaffModule } from './modules/staff/staff.module';
import { StoresModule } from './modules/stores/stores.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ServicesModule } from './modules/services/services.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ServiceCategoriesModule } from './modules/service_categories/service_categories.module';
//import { PaymentsModule } from './modules/payments/payments.module';
//import { PromotionsModule } from './modules/promotions/promotions.module';
import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          synchronize: false,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PermissionsModule,
    StaffModule,
    StoresModule,
    CustomersModule,
    ServicesModule,
    BookingsModule,
    InvoicesModule,
    ServiceCategoriesModule,
    //PaymentsModule,
    //PromotionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
