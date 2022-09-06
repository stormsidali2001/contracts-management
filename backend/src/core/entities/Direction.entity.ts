import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DepartementsEntity } from "./Departement.entity";

@Entity('directions')
export class DirectionEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    title:string;

    //relations
    @OneToMany(type=>DepartementsEntity,dp=>dp.direction)
    departements:DepartementsEntity[];
}