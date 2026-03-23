import { Notification } from './notification';

export interface INotificationRepository {
  findByUserId(userId: string): Promise<Notification[]>;
  saveMany(items: { message: string; userId: string }[]): Promise<void>;
}

export const NOTIFICATION_REPOSITORY = Symbol('INotificationRepository');
