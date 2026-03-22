import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordTokenEntity } from 'src/core/entities/PasswordToken';
import { UserCredentialsEntity } from 'src/core/entities/UserCredentials.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthModule } from './jwt-auth.module';
import { USER_CREDENTIALS_REPOSITORY } from './domain/user-credentials.repository';
import { UserCredentialsRepository } from './user-credentials.repository';
import { HashService } from './services/hash.service';
import { TokenService } from './services/token.service';
import { EmailModule } from 'src/shared/email/email.module';

@Module({
  imports: [
    CqrsModule,
    JwtAuthModule,
    EmailModule,
    TypeOrmModule.forFeature([UserCredentialsEntity, PasswordTokenEntity]),
  ],
  providers: [
    AuthService,
    HashService,
    TokenService,
    {
      provide: USER_CREDENTIALS_REPOSITORY,
      useClass: UserCredentialsRepository,
    },
  ],
  controllers: [AuthController],
  exports: [JwtAuthModule, AuthService],
})
export class AuthModule {}
