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
  ): Promise<{ userId: string; notification: Notification }[]> {
    const saved = await this.notificationRepository.saveMany(notifications);
    return notifications.map((n, i) => ({
      userId: n.userId,
      notification: saved[i],
    }));
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(
      notificationId,
      userId,
    );
    if (!notification) return;
    notification.markAsRead();
    await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.notificationRepository.findByUserId(
      userId,
    );
    const unread = notifications.filter((n) => !n.isRead);
    for (const n of unread) n.markAsRead();
    await Promise.all(unread.map((n) => this.notificationRepository.save(n)));
  }
}
