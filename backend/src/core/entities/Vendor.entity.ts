import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { AgreementEntity } from "./Agreement.entity";

@Entity('vendors')
export class VendorEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({unique:true})
    num:string; //numero de fournisseur

    @Column({unique:true})
    company_name:string// raison sociale : le nom de l'entreprise

    @Column({unique:true})
    nif:string; //numero d'identification fascale

    @Column({unique:true})
    nrc:string // numero de registre de commerce

    @Column()
    address:string;

    @Column()
    mobile_phone_number:string;

    @Column()
    home_phone_number:string;

    @ManyToMany(type=>AgreementEntity,ag=>ag.vendors) 
    agreements:AgreementEntity[];
    

}