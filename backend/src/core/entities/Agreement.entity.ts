import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AgreementStatus } from "../types/agreement-status.enum";
import { AgreementType } from "../types/agreement-type.enum";
import { DepartementEntity } from "./Departement.entity";
import { DirectionEntity } from "./Direction.entity";
import { VendorEntity } from "./Vendor.entity";


@Entity('agreements')
export class AgreementEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Index({fulltext:true})
    @Column()
    number:string;

    @Column({
        type:'enum',
        enum:AgreementType,
        default:AgreementType.CONTRACT
    })
    type:AgreementType;

    @Index({fulltext:true})
    @Column()
    object:string;

    @Column()
    amount:number; //fr: montant

    @Column({
        type:'date'
    })
    expiration_date:Date;

    @Column({
        type:'date'
    })
    signature_date:Date;

    @Index({fulltext:true})
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

    //relations
    @ManyToOne(type =>DirectionEntity,dr=>dr.agreements)
    direction:DirectionEntity;

    @ManyToOne(type =>DepartementEntity,dp=>dp.agreements)
    departement:DepartementEntity;

    @ManyToOne(type=>VendorEntity,vn=>vn.agreements) 
    vendor:VendorEntity;
}


