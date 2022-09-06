import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgreementModule } from './Agreement/Agreement.module';
import { AuthModule } from './auth/auth.module';
import { HttpExceptionFilter } from './shared/HttpException.filter';
import { HttpLoggingInteceptor } from './shared/HttpLogging.interceptor';
import { UserModule } from './user/user.module';


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    AuthModule,
    UserModule,
    TypeOrmModule.forRoot({
    username:process.env.MYSQL_USERNAME,
    password:process.env.MYSQL_PASSWORD,
    type:"mysql",
    host:process.env.MYSQL_DATABASE_HOST,
    port:+process.env.MYSQL_DATABASE_PORT,
    database:process.env.MYSQL_DATABASE_NAME,
    synchronize:true,
    logging:true,
    autoLoadEntities:true,

    }),
   AgreementModule,
   
],
  controllers: [],
  providers: [
    {provide:APP_INTERCEPTOR, useClass:HttpLoggingInteceptor},
    {provide:APP_FILTER,  useClass:HttpExceptionFilter}
  ],
})
export class AppModule {}
