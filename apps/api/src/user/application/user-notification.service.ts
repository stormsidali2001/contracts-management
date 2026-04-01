import { Inject, Injectable } from '@nestjs/common';
import { Notification } from 'src/user/domain/notification';
import {
  INotificationRepository,
  NOTIFICATION_REPOSITORY,
} from 'src/user/domain/notification.repository';

@Injectable()
export class UserNotificationService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  async saveForUsers(
    notifications: { userId: string; message: string }[],
  ): Promise<void> {
    await this.notificationRepository.saveMany(notifications);
  }
}
