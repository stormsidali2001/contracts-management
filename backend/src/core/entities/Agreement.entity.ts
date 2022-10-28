import { Column, CreateDateColumn, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AgreementStatus } from "../types/agreement-status.enum";
import { AgreementType } from "../types/agreement-type.enum";
import { DepartementEntity } from "./Departement.entity";
import { DirectionEntity } from "./Direction.entity";
import { VendorEntity } from "./Vendor.entity";


@Entity('agreements')
//fulltext
@Index('agreement-fulltext-object-idx', ['object'], { fulltext: true })
@Index('agreement-fulltext-number-idx', ['number'], { fulltext: true })
@Index('agreement-fulltext-observation-idx', ['observation'], { fulltext: true })

//
@Index('agreement-fulltext-object-idx', { synchronize: false })
@Index('agreement-fulltext-number-idx', { synchronize: false })
@Index('agreement-fulltext-observation-idx', { synchronize: false })

//unique
@Index('agreement-number-unique-idx', ['number'], { unique: true })

//
@Index('agreement-number-unique-idx', { synchronize: false })


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
    amount:number; //fr: montant

    @Column({
        type:'date'
    })
    expiration_date:Date;

    @Column({
        type:'date'
    })
    signature_date:Date;

    @CreateDateColumn()
    createdAt:Date;

    @Column({
        type:'date',
        nullable:true
    })
    execution_start_date:Date;

    @Column({
        type:'date',
        nullable:true
    })
    execution_end_date:Date;



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
    @ManyToOne(type =>DirectionEntity,dr=>dr.agreements) @JoinColumn({name:"directionId"})
    direction:DirectionEntity;

    @ManyToOne(type =>DepartementEntity,dp=>dp.agreements)
    departement:DepartementEntity;

    @ManyToOne(type=>VendorEntity,vn=>vn.agreements) 
    vendor:VendorEntity;

    //relations columns
    @Column({name:"departementId"}) @JoinColumn({name:"departementId"})
    departementId?:string;

    @Column({name:'directionId'})
    directionId?:string;


}


