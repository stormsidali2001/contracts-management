import { Entity } from "./Entity.enum";
import { Operation } from "./Operation.enum";


export interface UserEvent{
    entityId:string;
    entity:Entity;
    operation:Operation;
    createAt:Date;
    departementId:string;
    directionId:string;
}