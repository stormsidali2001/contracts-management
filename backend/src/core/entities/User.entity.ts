import {Entity , PrimaryGeneratedColumn , Column, ManyToOne, Index, CreateDateColumn, OneToMany, OneToOne, JoinColumn} from 'typeorm';
import { UserRole } from '../types/UserRole.enum';
import { DepartementEntity } from './Departement.entity';
import { DirectionEntity } from './Direction.entity';
import { NotificationEntity } from './Notification.entity';
import { PasswordTokenEntity } from './PasswordToken';

@Entity('users')
//fulltext
@Index('users-fulltext-username-idx', ['username'], { fulltext: true })
@Index('users-fulltext-email-idx', ['email'], { fulltext: true })
@Index('users-fulltext-firstName-idx', ['firstName'], { fulltext: true })
@Index('users-fulltext-lastName-idx', ['lastName'], { fulltext: true })
//
@Index('users-fulltext-username-idx', { synchronize: false })
@Index('users-fulltext-email-idx', { synchronize: false })
@Index('users-fulltext-firstName-idx', { synchronize: false })
@Index('users-fulltext-lastName-idx', { synchronize: false })
//unique
@Index('users-email-unique-idx', ['email'], { unique: true })
@Index('users-username-unique-idx', ['username'], { unique: true })
//
@Index('users-email-unique-idx', { synchronize: false })
@Index('users-username-unique-idx', { synchronize: false })
export class UserEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

   
    @Column()
    email:string;

    @Column({select:false})
    password:string;

    @Column()
    username:string;

    @Column()
    firstName:string;

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

    @OneToMany(type=>NotificationEntity,n=>n.user)
    notifications:NotificationEntity[];

    
    @OneToOne(type=>PasswordTokenEntity) @JoinColumn()
    password_token:PasswordTokenEntity;
}