import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../types/UserRole.enum';
import { DepartementEntity } from './Departement.entity';
import { DirectionEntity } from './Direction.entity';
import { NotificationEntity } from './Notification.entity';

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
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: '' })
  imageUrl: string;

  @Column({ default: true })
  active: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({ default: false })
  recieve_notifications: boolean;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  //relations
  @Column({ name: 'departementId', nullable: true })
  departementId: string;
  @ManyToOne(() => DepartementEntity, (dp) => dp.employees)
  @JoinColumn({ name: 'departementId' })
  departement: DepartementEntity;

  @Column({ name: 'directionId', nullable: true })
  directionId: string;

  @ManyToOne(() => DirectionEntity, (dr) => dr.employees)
  @JoinColumn({ name: 'directionId' })
  direction: DirectionEntity;

  @Exclude()
  @OneToMany(() => NotificationEntity, (n) => n.user)
  notifications: NotificationEntity[];
}
