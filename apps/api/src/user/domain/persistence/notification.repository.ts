import { Notification } from './notification';

export interface INotificationRepository {
  findByUserId(userId: string): Promise<Notification[]>;
  findById(id: string, userId: string): Promise<Notification | null>;
  saveMany(
    items: { message: string; userId: string }[],
  ): Promise<Notification[]>;
  save(notification: Notification): Promise<void>;
}

export const NOTIFICATION_REPOSITORY = Symbol('INotificationRepository');
