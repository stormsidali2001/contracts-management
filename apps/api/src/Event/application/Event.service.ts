import { Injectable, Logger } from '@nestjs/common';
import { CreateEventDTO } from 'src/core/entities/event.dto';
import { UserRole } from 'src/core/types/UserRole.enum';
import { EventEntity } from 'src/core/entities/Event.entity';
import { EventRepository } from '../infrastructure/persistence/event.repository';

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

  getEvents(
    limit: number,
    role: UserRole,
    departementId?: string | null,
    directionId?: string | null,
  ): Promise<EventEntity[]> {
    return this.eventRepository.findPaginated(
      limit,
      role,
      departementId,
      directionId,
    );
  }
}
