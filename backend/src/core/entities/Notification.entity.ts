import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";

@Entity("notifications")
export class NotificationEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    message:string;

    @CreateDateColumn({type:"datetime"})
    createdAt:Date;

    //realations

    @ManyToOne(type=>UserEntity,u=>u.notifications)
    user:UserEntity


}