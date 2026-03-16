import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateEventDTO } from "src/core/entities/event.dto";
import { EventEntity } from "src/core/entities/Event.entity";
import { UserEntity } from "src/core/entities/User.entity";
import { Entity } from "src/core/types/entity.enum";
import { UserRole } from "src/core/types/UserRole.enum";
import { Repository } from "typeorm";


@Injectable()
export class EventService{
    constructor(
        @InjectRepository(EventEntity) private readonly eventRepository:Repository<EventEntity> 
    ){}
    async addEvent({entity,entityId,operation,departementId = null,directionId = null , departementAbriviation,directionAbriviation }:CreateEventDTO){
        Logger.debug('yooooooooow'+directionAbriviation+" "+departementAbriviation)
        if(directionId && departementId){
            await this.eventRepository.save({entity,entityId,operation,departementId,directionId,departementAbriviation, directionAbriviation });
            return;
        }

        await this.eventRepository.save({entity,entityId,operation});

    }
    async getEvents(limit:number,user:UserEntity){
        let query =  this.eventRepository.createQueryBuilder("e")
        .limit(limit)
        .orderBy("e.createdAt",'DESC')

       


        if(user.role === UserRole.EMPLOYEE){
            query = query
            .where('(e.departementId = :departementId or e.departementId IS NULL)',{departementId:user.departementId})
            .andWhere('(e.directionId = :directionId or e.directionId IS NULL)',{directionId:user.directionId})

        }
        if(user.role === UserRole.JURIDICAL || user.role === UserRole.EMPLOYEE){
            query = query 
            .andWhere('e.entity in (:...entities)',{entities:[Entity.CONTRACT,Entity.CONVENSION,Entity.VENDOR]})
        }

        return await query.getMany();
    }
    

}