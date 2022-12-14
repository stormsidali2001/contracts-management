import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AgreementEntity } from "./Agreement.entity";
import { DirectionEntity } from "./Direction.entity";
import { EventEntity } from "./Event.entity";
import { UserEntity } from "./User.entity";

@Entity('departements')
export class DepartementEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    title:string;

    @Column()
    abriviation:string;

    //relations
    @ManyToOne(type=>DirectionEntity,d=>d.departements)
    direction?:DirectionEntity;

    
    @OneToMany(type=>UserEntity,u=>u.departement)
    employees:UserEntity[];
    
    @OneToMany(type=>AgreementEntity,ag=>ag.departement)
    agreements:AgreementEntity[];

    @OneToMany(type=>EventEntity , e=>e.departement)
    events:EventEntity[];

   
}