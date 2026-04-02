import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/core/entities/Notification.entity';
import { Notification } from 'src/user/domain/notification';
import { INotificationRepository } from 'src/user/domain/notification.repository';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  async findByUserId(userId: string): Promise<Notification[]> {
    const entities = await this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) =>
      Notification.reconstitute(e.id, e.message, e.createdAt, e.isRead),
    );
  }

  async findById(id: string, userId: string): Promise<Notification | null> {
    const entity = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!entity) return null;
    return Notification.reconstitute(
      entity.id,
      entity.message,
      entity.createdAt,
      entity.isRead,
    );
  }

  async saveMany(items: { message: string; userId: string }[]): Promise<Notification[]> {
    const entities = await this.repo.save(
      items.map(({ message, userId }) => ({ message, user: { id: userId } })),
    );
    return entities.map((e) =>
      Notification.reconstitute(e.id, e.message, e.createdAt, e.isRead),
    );
  }

  async save(notification: Notification): Promise<void> {
    await this.repo.update({ id: notification.id }, { isRead: notification.isRead });
  }
}
