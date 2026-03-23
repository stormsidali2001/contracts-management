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
    const entities = await this.repo.findBy({ user: { id: userId } });
    return entities.map((e) => ({ id: e.id, message: e.message, createdAt: e.createdAt }));
  }

  async saveMany(items: { message: string; userId: string }[]): Promise<void> {
    await this.repo.save(items.map(({ message, userId }) => ({ message, user: { id: userId } })));
  }
}
