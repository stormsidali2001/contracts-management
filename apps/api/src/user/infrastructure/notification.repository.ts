import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/core/entities/Notification.entity';
import { Notification } from 'src/user/domain/notification';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  async findByUserId(userId: string): Promise<Notification[]> {
    const entities = await this.repo.findBy({ user: { id: userId } });
    return entities.map((e) => ({ id: e.id, message: e.message, createdAt: e.createdAt }));
  }

  async saveMany(
    items: { message: string; user: { id: string } }[],
  ): Promise<void> {
    await this.repo.save(items);
  }
}
