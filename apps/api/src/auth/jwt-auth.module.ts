import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { JwtAccessTokenGuard } from './infrastructure/guards/jwt-access-token.guard';
import { JwtRefreshTokenGuard } from './infrastructure/guards/jwt-refresh-token.guard';
import { RoleGuard } from './infrastructure/guards/Role.guard';
import { JwtAccessTokenStrategy } from './infrastructure/strategies/jwt-access-token.strategy';
import { JwtRefreshTokenStrategy } from './infrastructure/strategies/jwt-refresh-token.strategy';

@Global()
@Module({
  imports: [UserModule, PassportModule, JwtModule.register({})],
  providers: [
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    JwtAccessTokenGuard,
    JwtRefreshTokenGuard,
    RoleGuard,
  ],
  exports: [
    JwtAccessTokenGuard,
    JwtRefreshTokenGuard,
    RoleGuard,
    JwtModule,
    UserModule,
  ],
})
export class JwtAuthModule {}
