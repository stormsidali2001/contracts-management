import {Module} from '@nestjs/common'
import { CronJobService } from './Cronjob.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronJobsEntity } from 'src/core/entities/cronJobs.entity';

@Module({
    imports:[TypeOrmModule.forFeature([CronJobsEntity])],
    controllers:[],
    providers:[CronJobService]
})
export class CronJobsModule{}