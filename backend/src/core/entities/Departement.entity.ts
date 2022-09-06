import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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

}