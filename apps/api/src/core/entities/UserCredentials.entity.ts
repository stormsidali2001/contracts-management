import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PasswordTokenEntity } from './PasswordToken';
import { UserEntity } from './User.entity';

@Entity('user_credentials')
export class UserCredentialsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId', unique: true })
  userId: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  refresh_token_hash: string;

  @OneToOne(() => PasswordTokenEntity, { nullable: true })
  @JoinColumn()
  password_token: PasswordTokenEntity;
}
