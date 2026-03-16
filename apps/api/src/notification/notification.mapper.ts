import { NotificationEntity } from 'src/core/entities/Notification.entity';
import { Notification, NotificationId, NotificationMessage, CreatedAt } from '@contracts/domain';

export class NotificationMapper {
  static toDomain(entity: NotificationEntity): Notification {
    return Notification.reconstitute({
      id: new NotificationId(entity.id),
      message: new NotificationMessage(entity.message),
      userId: (entity.user as any)?.id ?? (entity as any).userId,
      createdAt: new CreatedAt(entity.createdAt),
    });
  }

  static toPersistence(domain: Notification): Partial<NotificationEntity> {
    return {
      id: domain.getId().value,
      message: domain.message.value,
      user: { id: domain.userId } as any,
      createdAt: domain.createdAt.value,
    };
  }
}
