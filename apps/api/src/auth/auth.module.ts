import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordTokenEntity } from 'src/core/entities/PasswordToken';
import { UserCredentialsEntity } from 'src/core/entities/UserCredentials.entity';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthService } from './application/auth.service';
import { JwtAuthModule } from './jwt-auth.module';
import { USER_CREDENTIALS_REPOSITORY } from './domain/persistence/user-credentials.repository';
import { UserCredentialsRepository } from './infrastructure/persistence/user-credentials.repository';
import { HashService } from './infrastructure/services/hash.service';
import { TokenService } from './infrastructure/services/token.service';
import { EmailModule } from 'src/shared/infrastructure/email/email.module';
import { RegistrationService } from './application/registration.service';
import { PasswordManagementService } from './application/password-management.service';
import { AuthenticationService } from './application/authentication.service';

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
    RegistrationService,
    PasswordManagementService,
    AuthenticationService,
    {
      provide: USER_CREDENTIALS_REPOSITORY,
      useClass: UserCredentialsRepository,
    },
  ],
  controllers: [AuthController],
  exports: [JwtAuthModule, AuthService],
})
export class AuthModule {}
