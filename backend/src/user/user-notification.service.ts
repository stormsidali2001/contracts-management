import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationEntity } from "src/core/entities/Notification.entity";
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
        @InjectRepository(NotificationEntity) private notificationRepository:Repository<NotificationEntity>,
        private readonly socketStateService:SocketStateService,
        private readonly userService:UserService
    ){}
    async getUserNotifications(userId:string){
        return this.notificationRepository.findBy({user:{id:userId}})
    }
    async sendNotifications(notifications:NotificationBody[]){
         await this.notificationRepository.save(notifications.map(({message,userId})=>({message,user:{id:userId}})));
         this.socketStateService.emitConnected(notifications.map((n)=>({data:n.message,userId:n.userId})),"send_notification");
    }

    async sendToUsersInDepartement(departementId:string,message:string){
        const users = await this.userService.findAllBy({departement:{id:departementId}});
        if(!users) return null;
        await this.sendNotifications(users.map(u=>({userId:u.id,message})))
        Logger.warn(`notification sent to departement: ${departementId} ${users.length} users`)
    }
}