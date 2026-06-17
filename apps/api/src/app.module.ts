import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgreementModule } from './Agreement/Agreement.module';
import { AuthModule } from './auth/auth.module';
import { DirectionModule } from './direction/direction.module';
import { EventModule } from './Event/Event.module';
import { HttpExceptionFilter } from './shared/infrastructure/HttpException.filter';
import { DomainExceptionFilter } from './shared/infrastructure/domain-exception.filter';
import { HttpLoggingInteceptor } from './shared/infrastructure/HttpLogging.interceptor';
import { UserModule } from './user/user.module';
import { SocketStateModule } from './socket/SocketState.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    EventModule,
    StatisticsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      logging: false,
      autoLoadEntities: true,
    }),
    AgreementModule,
    DirectionModule,
    SocketStateModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: HttpLoggingInteceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
  ],
})
export class AppModule {}
