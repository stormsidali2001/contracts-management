import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Entity as ET } from "../types/entity.enum";
import { Operation } from "../types/operation.enum";
import { DepartementEntity } from "./Departement.entity";
import { DirectionEntity } from "./Direction.entity";


@Entity('event')
export class EventEntity{

    @PrimaryGeneratedColumn()
    id:string;

    @Column({
        type:"enum",
        enum:ET,
        default:ET.CONTRACT
    })
    entity:ET;

    @CreateDateColumn()
    createdAt:Date;

    @Column({
        type:"enum",
        enum:Operation,
        default:Operation.INSERT
    })
    operation:Operation;

    @Column()
    entityId:string;

    @Column({name:"departementId",nullable:true})
    departementId:string;
    @ManyToOne(type=>DepartementEntity,dp=>dp.employees) @JoinColumn({name:"departementId"})
    departement:DepartementEntity;

    @Column({name:"directionId",nullable:true})
    directionId:string;

    @ManyToOne(type=>DirectionEntity,dr=>dr.employees) @JoinColumn({name:"directionId"})
    direction:DirectionEntity;

}