import { Injectable, Logger } from '@nestjs/common';
import { CreateEventDTO } from 'src/core/entities/event.dto';
import { UserEntity } from 'src/core/entities/User.entity';
import { User } from 'src/user/domain/user';
import { EventView } from 'src/core/views/event.view';
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

  async getEvents(limit: number, user: UserEntity | User): Promise<EventView[]> {
    const entities = await this.eventRepository.findPaginated(limit, user);
    return EventView.fromMany(entities);
  }
}
