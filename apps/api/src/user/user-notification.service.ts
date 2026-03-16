import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationRepository } from "@contracts/domain";
import { CreateEventDTO } from "src/core/entities/event.dto";
import { Entity } from "src/core/types/entity.enum";
import { Operation } from "src/core/types/operation.enum";
import { EventService } from "src/Event/services/Event.service";
import { SocketStateService } from "src/socket/SocketState.service";
import { UserService } from "./user.service";

export interface NotificationBody{
    message:string;
    userId:string;
}

@Injectable()
export class UserNotificationService{
    constructor(
        private readonly eventService:EventService,
        @Inject('INotificationRepository') private readonly notificationRepository: NotificationRepository,
        private readonly socketStateService:SocketStateService,
        @Inject(forwardRef(()=>UserService)) private readonly userService:UserService,
    ){}

    async getUserNotifications(userId:string){
        return this.notificationRepository.findByUserId(userId);
    }

    async sendNotifications(notifications:NotificationBody[]){
        const domainNotifications = notifications.map(({ message, userId }) =>
            Notification.create(uuidv4(), userId, message),
        );
        await Promise.all(domainNotifications.map(n => this.notificationRepository.save(n)));
        this.socketStateService.emitIfConnected(
            notifications.map((n) => ({ data: n.message, userId: n.userId })),
            "send_notification",
        );
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
