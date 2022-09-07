import {Entity , PrimaryGeneratedColumn , Column, ManyToOne} from 'typeorm';
import { UserRole } from '../types/UserRole.enum';
import { DepartementEntity } from './Departement.entity';
import { DirectionEntity } from './Direction.entity';

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

    @Column({
        type:'enum',
        enum:UserRole,
        default:UserRole.EMPLOYEE
    })
    role:UserRole
    //relations
    @ManyToOne(type=>DepartementEntity,dp=>dp.employees)
    departement:DepartementEntity;

    @ManyToOne(type=>DirectionEntity,dr=>dr.employees)
    direction:DirectionEntity;
}