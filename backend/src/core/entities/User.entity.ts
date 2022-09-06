import {Entity , PrimaryGeneratedColumn , Column, ManyToOne} from 'typeorm';
import { DepartementEntity } from './Departement.entity';

@Entity('users')
export class UserEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({unique:true})
    email:string;

    @Column({select:false})
    password:string;

    @Column({unique:true})
    username:string;

    @Column({nullable:true})
    refresh_token_hash:string;

    //relations
    @ManyToOne(type=>DepartementEntity,dp=>dp.employees)
    departement:DepartementEntity;
}