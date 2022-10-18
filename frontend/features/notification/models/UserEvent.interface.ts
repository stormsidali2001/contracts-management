import { Entity } from "./Entity.enum";
import { Operation } from "./Operation.enum";


export interface UserEvent{
    entityId:string;
    entity:Entity;
    operation:Operation;
    createdAt:Date;
    departementId:string;
    directionId:string;
    departementAbriviation:string;
    directionAbriviation:string;
    
}