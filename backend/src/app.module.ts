import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';


@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),AuthModule,UserModule,TypeOrmModule.forRoot({
    
    
    username:process.env.MYSQL_USERNAME,
    password:process.env.MYSQL_PASSWORD,
    type:"mysql",
    host:process.env.MYSQL_DATABASE_HOST,
    port:parseInt(process.env.MYSQL_DATABASE_PORT),
    database:process.env.MYSQL_DATABASE_NAME,
    synchronize:true,
    logging:true,
    autoLoadEntities:true,

  })],
  controllers: [],
  providers: [],
})
export class AppModule {}
