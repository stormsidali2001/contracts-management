import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";

@Entity('password_token')
export class PasswordTokenEntity{
    @PrimaryGeneratedColumn()
    id:string;

    @Column()
    token:string;

    @CreateDateColumn()
    createdAt:Date;

    @Column()
    expiresIn:Date;

   

}