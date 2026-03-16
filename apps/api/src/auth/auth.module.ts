import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthModule } from './jwt-auth.module';

@Module({
  imports: [JwtAuthModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtAuthModule],
})
export class AuthModule {}
