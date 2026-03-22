import { Injectable, Logger } from '@nestjs/common';
import { CreateEventDTO } from 'src/core/entities/event.dto';
import { UserEntity } from 'src/core/entities/User.entity';
import { User } from 'src/user/domain/user.aggregate';
import { EventEntity } from 'src/core/entities/Event.entity';
import { EventRepository } from '../event.repository';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async addEvent(event: CreateEventDTO): Promise<void> {
    Logger.debug(
      'yooooooooow' +
        event.directionAbriviation +
        ' ' +
        event.departementAbriviation,
    );
    await this.eventRepository.save(event);
  }

  async getEvents(
    limit: number,
    user: UserEntity | User,
  ): Promise<EventEntity[]> {
    return this.eventRepository.findPaginated(limit, user);
  }
}
