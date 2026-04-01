import { NotificationView } from '@contracts/types';
import { Notification } from 'src/user/domain/notification';

export class NotificationPresenter {
  static from(source: Notification): NotificationView {
    return {
      id: source.id,
      message: source.message,
      createdAt: source.createdAt,
    };
  }

  static fromMany(sources: Notification[]): NotificationView[] {
    return sources.map(NotificationPresenter.from);
  }
}
