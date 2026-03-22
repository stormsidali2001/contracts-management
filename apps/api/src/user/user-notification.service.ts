import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { NotificationView } from 'src/core/views/notification.view';
import { NotificationRepository } from './notification.repository';
import { UserService } from './user.service';

export interface NotificationBody {
  message: string;
  userId: string;
}

@Injectable()
export class UserNotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async getUserNotifications(userId: string): Promise<NotificationView[]> {
    const entities = await this.notificationRepository.findByUserId(userId);
    return NotificationView.fromMany(entities);
  }

  async saveNotifications(notifications: NotificationBody[]): Promise<void> {
    await this.notificationRepository.saveMany(
      notifications.map(({ message, userId }) => ({
        message,
        user: { id: userId },
      })),
    );
  }

  /**
   * Finds all users in a departement, persists notifications, and returns
   * the user IDs so the caller can emit the corresponding socket events.
   */
  async saveNotificationsForDepartement(
    departementId: string,
    message: string,
  ): Promise<string[]> {
    const users = await this.userService.findAllBy({
      departement: { id: departementId },
    });
    if (!users?.length) return [];
    await this.saveNotifications(users.map((u) => ({ userId: u.id, message })));
    Logger.warn(
      `notifications saved for departement ${departementId} — ${users.length} users`,
    );
    return users.map((u) => u.id);
  }
}
