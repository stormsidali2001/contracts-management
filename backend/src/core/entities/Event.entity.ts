import { Column, CreateDateColumn, Entity } from "typeorm";
import { Operation } from "../types/operation.enum";


@Entity('event')
export class EventEntity{

    @Column({
        type:"enum",
        enum:Operation,
        default:Operation.INSERT
    })
    entity:string;

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
}