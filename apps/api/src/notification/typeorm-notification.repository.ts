import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationRepository } from '@contracts/domain';
import { NotificationEntity } from 'src/core/entities/Notification.entity';
import { NotificationMapper } from './notification.mapper';

@Injectable()
export class TypeOrmNotificationRepository implements NotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  async save(notification: Notification): Promise<void> {
    await this.repo.save(NotificationMapper.toPersistence(notification));
  }

  async findById(id: string): Promise<Notification | null> {
    const entity = await this.repo.findOne({ where: { id }, relations: ['user'] });
    return entity ? NotificationMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const entities = await this.repo.findBy({ user: { id: userId } });
    return entities.map(NotificationMapper.toDomain);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.repo.delete({ user: { id: userId } });
  }
}
