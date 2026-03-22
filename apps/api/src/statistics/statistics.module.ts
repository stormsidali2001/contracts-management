import { Module } from '@nestjs/common';
import { AgreementModule } from 'src/Agreement/Agreement.module';
import { UserModule } from 'src/user/user.module';
import { DirectionModule } from 'src/direction/direction.module';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [UserModule, AgreementModule, DirectionModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}

