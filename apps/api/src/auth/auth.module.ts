import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/core/entities/User.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthModule } from './jwt-auth.module';
import { USER_CREDENTIALS_REPOSITORY } from './domain/user-credentials.repository';
import { UserCredentialsRepository } from './user-credentials.repository';

@Module({
  imports: [CqrsModule, JwtAuthModule, TypeOrmModule.forFeature([UserEntity])],
  providers: [
    AuthService,
    {
      provide: USER_CREDENTIALS_REPOSITORY,
      useClass: UserCredentialsRepository,
    },
  ],
  controllers: [AuthController],
  exports: [JwtAuthModule],
})
export class AuthModule {}
