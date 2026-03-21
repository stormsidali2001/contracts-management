import { Module } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { AgreementModule } from 'src/Agreement/Agreement.module';
import { AuthModule } from 'src/auth/auth.module';
import { DirectionModule } from 'src/direction/direction.module';
import { SeedService } from './seed.service';

@Module({
  imports: [AppModule, DirectionModule, AgreementModule, AuthModule],
  providers: [SeedService],
})
export class SeedModule {}
