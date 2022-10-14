import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

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