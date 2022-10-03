import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AgreementStatus } from "../types/agreement-status.enum";

@Entity('agreements_exec_jobs')
export class AgreementExecJobsEntity{
    @PrimaryGeneratedColumn()
    id:string;

    @Column({
        enum:AgreementStatus,
        type:'enum'
    })
    newStatus:AgreementStatus;

    @Column({
        type:'date'
    })
    date:Date;

    @Column()
    agreementId:string;

    @Column({unique:true})
    name:string;

}