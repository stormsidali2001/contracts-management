import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AppModule } from 'src/app.module';
import { AgreementModule } from 'src/Agreement/Agreement.module';
import { AuthModule } from 'src/auth/auth.module';
import { DirectionModule } from 'src/direction/direction.module';
import { SeedService } from './seed.service';

@Module({
  imports: [AppModule, DirectionModule, AgreementModule, AuthModule, CqrsModule],
  providers: [SeedService],
})
export class SeedModule {}
