import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('cron_jobs')
export class CronJobsEntity{
    @PrimaryGeneratedColumn()
    id:string;

    @Column({unique:true})
    name:string;

    @Column({type:"date"})
    date:Date;
}