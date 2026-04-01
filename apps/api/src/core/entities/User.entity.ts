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
@Index('users-fulltext-idx', ['username', 'email', 'firstName', 'lastName'], { fulltext: true })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
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
