import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationEntity } from "src/core/entities/Notification.entity";
import { Repository } from "typeorm";


@Injectable()
export class UserNotificationService{
    constructor(
        @InjectRepository(NotificationEntity) private notificationRepository:Repository<NotificationEntity>
    ){}
    getUserNotifications(userId:string){
        return this.notificationRepository.findBy({user:{id:userId}})
    }
}