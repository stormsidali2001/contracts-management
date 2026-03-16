import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Repository } from "typeorm";
import { CronJobsEntity } from "src/core/entities/cronJobs.entity";


@Injectable()
export class CronJobService implements OnModuleInit{
    private readonly logger = new Logger(CronJobService.name)
    constructor(
        private readonly schdulerRegistry:SchedulerRegistry,
        private readonly cronJobsRepository:Repository<CronJobsEntity>

    ){

    }
    async onModuleInit() {
        const percistedJobs = await this.getPercistedJobs();
        for(let job of percistedJobs){
            if(job.date > new Date(Date.now())){
                await this.cronJobsRepository.delete({name:job.name})
                continue;
            }
        }
     
    }
    async getPercistedJobs(){
        return await this.cronJobsRepository.find()
    }
    async addCronJob(name:string,date:Date, cb:()=>void){
        const job = new CronJob(date,()=>{
            cb();
        })
        this.schdulerRegistry.addCronJob(name,job);
        await this.cronJobsRepository.save({name,date})
        job.start();
        this.logger.warn(`the job : ${name} is running`);
    }
}