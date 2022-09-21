import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AgreementEntity } from "./Agreement.entity";

@Entity('vendors')
export class VendorEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Index({fulltext:true})
    @Column({type:'varchar'})
    num:string; //numero de fournisseur

    @Index({fulltext:true})
    @Column({type:'varchar'})
    company_name:string// raison sociale : le nom de l'entreprise

    @Index({fulltext:true})
    @Column({type:'varchar'})
    nif:string; //numero d'identification fascale

    @Index({fulltext:true})
    @Column({type:'varchar'})
    nrc:string // numero de registre de commerce

    @Index({fulltext:true})
    @Column()
    address:string;

    @Column()
    mobile_phone_number:string;

    @Column()
    home_phone_number:string;

    @OneToMany(type=>AgreementEntity,ag=>ag.vendor) 
    agreements:AgreementEntity[];
    

}