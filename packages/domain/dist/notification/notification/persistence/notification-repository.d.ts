import { Notification } from '../notification';
export interface NotificationRepository {
    findById(id: string): Promise<Notification | null>;
    findByUserId(userId: string): Promise<Notification[]>;
    save(notification: Notification): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
}
//# sourceMappingURL=notification-repository.d.ts.map