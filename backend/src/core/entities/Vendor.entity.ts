import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AgreementEntity } from "./Agreement.entity";

@Entity('vendors')
//fulltext
@Index('vendor-fulltext-num-idx', ['num'], { fulltext: true })
@Index('vendor-fulltext-nif-idx', ['nif'], { fulltext: true })
@Index('vendor-fulltext-nrc-idx', ['nrc'], { fulltext: true })
@Index('vendor-fulltext-company_name-idx', ['company_name'], { fulltext: true })
@Index('vendor-fulltext-address-idx', ['address'], { fulltext: true })
@Index('vendor-fulltext-mobile_phone_number-idx', ['mobile_phone_number'], { fulltext: true })
@Index('vendor-fulltext-home_phone_number-idx', ['home_phone_number'], { fulltext: true })
//
@Index('vendor-fulltext-num-idx', { synchronize: false })
@Index('vendor-fulltext-nif-idx', { synchronize: false })
@Index('vendor-fulltext-nrc-idx', { synchronize: false })
@Index('vendor-fulltext-company_name-idx', { synchronize: false })
@Index('vendor-fulltext-address-idx', { synchronize: false })
@Index('vendor-fulltext-mobile_phone_number-idx', { synchronize: false })
@Index('vendor-fulltext-home_phone_number-idx', { synchronize: false })
//unique
@Index('vendor-num-unique-idx', ['num'], { unique: true })
@Index('vendor-company_name-unique-idx', ['company_name'], { unique: true })
@Index('vendor-nif-unique-idx', ['nif'], { unique: true })
@Index('vendor-nrc-unique-idx', ['nrc'], { unique: true })
//
@Index('vendor-num-unique-idx', { synchronize: false })
@Index('vendor-company_name-unique-idx', { synchronize: false })
@Index('vendor-nif-unique-idx', { synchronize: false })
@Index('vendor-nrc-unique-idx', { synchronize: false })
export class VendorEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({type:'varchar'})
    num:string; //numero de fournisseur

    @Column({type:'varchar'})
    company_name:string// raison sociale : le nom de l'entreprise

    @Column({type:'varchar'})
    nif:string; //numero d'identification fascale

    @Column({type:'varchar'})
    nrc:string // numero de registre de commerce

    @Column()
    address:string;

    @Column()
    mobile_phone_number:string;

    @Column()
    home_phone_number:string;

    @Column({type:"date",default:new Date(Date.now())})
    createdAt:Date;
    
    @OneToMany(type=>AgreementEntity,ag=>ag.vendor) 
    agreements:AgreementEntity[];
    


}