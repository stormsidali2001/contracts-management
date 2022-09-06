import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AgreementEntity } from "./Agreement.entity";
import { DirectionEntity } from "./Direction.entity";

@Entity('departements')
export class DepartementsEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    title:string;

    //relations
    @ManyToOne(type=>DirectionEntity,d=>d.departements)
    direction:DirectionEntity;

    @OneToMany(type=>AgreementEntity,ag=>ag.departement)
    agreements:AgreementEntity[];

}