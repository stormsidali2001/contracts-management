import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/core/entities/Notification.entity';
import { PasswordTokenEntity } from 'src/core/entities/PasswordToken';
import { UserEntity } from 'src/core/entities/User.entity';
import { DirectionModule } from 'src/direction/direction.module';
import { EventModule } from 'src/Event/Event.module';
import { UserImageController } from './controllers/user-image.controller';
import { UserController } from './controllers/user.controller';
import { USER_REPOSITORY } from './domain/user.repository';
import { NotificationsGateWay } from './Notification.gateway';
import { NotificationRepository } from './notification.repository';
import { UserNotificationService } from './user-notification.service';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, NotificationEntity, PasswordTokenEntity]),
    DirectionModule,
    EventModule,
  ],
  controllers: [UserController, UserImageController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepository },
    NotificationRepository,
    UserService,
    UserNotificationService,
    NotificationsGateWay,
  ],
  exports: [UserService, UserNotificationService],
})
export class UserModule {}
