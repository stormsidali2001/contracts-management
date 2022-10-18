import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateEventDTO } from "src/core/entities/event.dto";
import { EventEntity } from "src/core/entities/Event.entity";
import { Repository } from "typeorm";


@Injectable()
export class EventService{
    constructor(
        @InjectRepository(EventEntity) private readonly eventRepository:Repository<EventEntity> 
    ){}
    async addEvent({entity,entityId,operation,departementId = null,directionId = null , departementAbrivation = '',directionAbriviation = ''}:CreateEventDTO){
        if(directionId && departementId){
            await this.eventRepository.save({entity,entityId,operation,departementId,directionId,departementAbrivation, directionAbriviation });
            return;
        }

        await this.eventRepository.save({entity,entityId,operation});

    }
    async getEvents(limit:number){
        return this.eventRepository.createQueryBuilder("e")
        .limit(limit)
        .orderBy("e.createdAt",'ASC')
        .getMany()
    }
    

}