import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateEventDTO } from "src/core/entities/event.dto";
import { NotificationEntity } from "src/core/entities/Notification.entity";
import { Entity } from "src/core/types/entity.enum";
import { Operation } from "src/core/types/operation.enum";
import { UserRole } from "src/core/types/UserRole.enum";
import { EventService } from "src/Event/services/Event.service";
import { SocketStateService } from "src/socket/SocketState.service";
import { Repository } from "typeorm";
import { UserService } from "./user.service";

export interface NotificationBody{
    message:string;
    userId:string;
}
@Injectable()
export class UserNotificationService{
    constructor(
        private readonly eventService:EventService,
        @InjectRepository(NotificationEntity) private notificationRepository:Repository<NotificationEntity>,
        private readonly socketStateService:SocketStateService,
        @Inject(forwardRef(()=>UserService)) private readonly userService:UserService,
    ){}
    async getUserNotifications(userId:string){
        return this.notificationRepository.findBy({user:{id:userId}})
    }
    async sendNotifications(notifications:NotificationBody[]){
         await this.notificationRepository.save(notifications.map(({message,userId})=>({message,user:{id:userId}})));
         this.socketStateService.emitIfConnected(notifications.map((n)=>({data:n.message,userId:n.userId})),"send_notification");
    }

    async sendToUsersInDepartement(departementId:string,message:string){
        const users = await this.userService.findAllBy({departement:{id:departementId}});
        if(!users) return null;
        await this.sendNotifications(users.map(u=>({userId:u.id,message})))
        Logger.warn(`notification sent to departement: ${departementId} ${users.length} users`)
    }

   
    async sendNewEventaToConnectedUsersWithContrainsts(params:CreateEventDTO,departementId:string){
         await this.eventService.addEvent(params)
         this.socketStateService.emitDataToConnectedUsersWithContrainsts("SEND_EVENT",departementId,{...params});

    }
    async emitDataToAdminsOnly(params:CreateEventDTO){
        await this.eventService.addEvent(params)
        this.socketStateService.emitDataToAdminsOnly("SEND_EVENT",{...params})
    }

    async sendEventToAllUsers(params:CreateEventDTO){
        await this.eventService.addEvent(params)
        this.socketStateService.emitConnected({...params},"SEND_EVENT")
    }

    async IncrementUsersStats(eventData:{type:Entity,operation:Operation}){
        this.socketStateService.emitConnected({...eventData},"INCR_USER")
    }
    async IncrementAgreementsStats(eventData:{type:Entity,operation:Operation},departementId:string){
        this.socketStateService.emitDataToConnectedUsersWithContrainsts("INC_AGR",departementId,{...eventData})
    }
   
}