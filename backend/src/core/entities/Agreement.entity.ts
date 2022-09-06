import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AgreementStatus } from "../types/agreement-status.enum";
import { AgreementType } from "../types/agreement-type.enum";


@Entity('agreements')
export class AgreementEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    number:string;

    @Column({
        type:'enum',
        enum:AgreementType,
        default:AgreementType.CONTRACT
    })
    type:AgreementType;

    @Column()
    object:string;

    @Column()
    amount:string; //fr: montant

    @Column({
        type:'date'
    })
    expiration_date:Date;

    @Column({
        type:'date'
    })
    signature_date:Date;

    @Column({nullable:true})
    observation?:string;

    @Column({
        type:'enum',
        enum:AgreementStatus,
        default:AgreementStatus.NOT_EXECUTED
    })
    status:AgreementStatus;

    @Column()
    url:string;

}

