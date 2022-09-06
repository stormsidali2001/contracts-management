import {Entity , PrimaryGeneratedColumn , Column} from 'typeorm';

@Entity('users')
export class UserEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({unique:true})
    email:string;

    @Column()
    password:string;

    @Column({unique:true})
    username:string
}