import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Entity as ET } from "../types/entity.enum";
import { Operation } from "../types/operation.enum";


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

    @Column({
        nullable:true
    })
    departementId:string;

    @Column({
        nullable:true
    })
    directionId:string;

}