import { NotificationEntity } from '../entities/Notification.entity';
import { stripPrivateKeys } from './strip-private-keys.util';

export class NotificationView {
  id: string;
  message: string;
  createdAt: Date;

  static from(e: NotificationEntity): NotificationView {
    const { user: _u, ...safe } = e as any;
    return Object.assign(new NotificationView(), stripPrivateKeys(safe));
  }

  static fromMany(entities: NotificationEntity[]): NotificationView[] {
    return entities.map(NotificationView.from);
  }
}
