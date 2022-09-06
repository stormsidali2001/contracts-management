import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AgreementEntity } from "./Agreement.entity";
import { DepartementEntity } from "./Departement.entity";
import { UserEntity } from "./User.entity";

@Entity('directions')
export class DirectionEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    title:string;

    //relations
    @OneToMany(type=>DepartementEntity,dp=>dp.direction)
    departements:DepartementEntity[];

    @OneToMany(type=>AgreementEntity,ag=>ag.direction)
    agreements:AgreementEntity[];

    @OneToOne(type=>UserEntity) @JoinColumn()
    departement_cheif:UserEntity;
}