import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/core/entities/Notification.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  async findByUserId(userId: string): Promise<NotificationEntity[]> {
    return this.repo.findBy({ user: { id: userId } });
  }

  async saveMany(
    items: { message: string; user: { id: string } }[],
  ): Promise<void> {
    await this.repo.save(items);
  }
}
