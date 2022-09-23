import {Entity , PrimaryGeneratedColumn , Column, ManyToOne, Index, CreateDateColumn} from 'typeorm';
import { UserRole } from '../types/UserRole.enum';
import { DepartementEntity } from './Departement.entity';
import { DirectionEntity } from './Direction.entity';

@Entity('users')
export class UserEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Index({fulltext:true})
    @Column()
    email:string;

    @Column({select:false})
    password:string;

    @Index({fulltext:true})
    @Column()
    username:string;

    @Index({fulltext:true})
    @Column()
    firstName:string;

    @Index({fulltext:true})
    @Column()
    lastName:string;
    
    @Column({default:""})
    imageUrl:string;

    @Column({default:true})
    active:boolean;


    @Column({nullable:true})
    refresh_token_hash:string;

    @Column({
        type:'enum',
        enum:UserRole,
        default:UserRole.EMPLOYEE
    })
    role:UserRole

    @CreateDateColumn({type:'datetime'})
    created_at:Date;
    //relations
    @ManyToOne(type=>DepartementEntity,dp=>dp.employees)
    departement:DepartementEntity;

    @ManyToOne(type=>DirectionEntity,dr=>dr.employees)
    direction:DirectionEntity;
}