import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { EventService } from 'src/Event/services/Event.service';
import { SocketStateService } from 'src/socket/SocketState.service';
import { VendorUpdatedEvent } from '../domain/events/vendor-updated.event';

@Injectable()
@EventsHandler(VendorUpdatedEvent)
export class VendorUpdatedHandler implements IEventHandler<VendorUpdatedEvent> {
  constructor(
    private readonly eventService: EventService,
    private readonly socketStateService: SocketStateService,
  ) {}

  async handle(event: VendorUpdatedEvent): Promise<void> {
    const eventParams = {
      entity: Entity.VENDOR,
      operation: Operation.UPDATE,
      entityId: event.vendorId,
      createdAt: new Date(),
      departementAbriviation: '',
      directionId: null,
      departementId: null,
      directionAbriviation: '',
    };
    await this.eventService.addEvent(eventParams);
    this.socketStateService.emitConnected(eventParams, 'SEND_EVENT');
  }
}
