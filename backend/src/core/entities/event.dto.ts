import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { Entity } from "../types/entity.enum";
import { Operation } from "../types/operation.enum";

export class CreateEventDTO{
    @IsUUID()
    entityId:string;

    @IsEnum(Operation)
    operation:Operation;

    @IsEnum(Entity)
    entity:Entity;

    @IsOptional()
    @IsUUID()
    departementId?:string;

    @IsOptional()
    @IsUUID()
    directionId?:string;

    @IsOptional()
    departementAbrivation?:string;

    @IsOptional()
    directionAbriviation?:string;
}