import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { EventService } from 'src/Event/services/Event.service';
import { SocketStateService } from 'src/socket/SocketState.service';
import { VendorService } from '../services/vendor.service';
import { VendorDeletedEvent } from '../domain/events/vendor-deleted.event';

@Injectable()
@EventsHandler(VendorDeletedEvent)
export class VendorDeletedHandler implements IEventHandler<VendorDeletedEvent> {
  constructor(
    private readonly vendorService: VendorService,
    private readonly eventService: EventService,
    private readonly socketStateService: SocketStateService,
  ) {}

  async handle(event: VendorDeletedEvent): Promise<void> {
    const eventParams = {
      entity: Entity.VENDOR,
      operation: Operation.DELETE,
      entityId: event.vendorId,
      createdAt: new Date(),
      departementAbriviation: '',
      directionId: null,
      departementId: null,
      directionAbriviation: '',
    };
    await this.eventService.addEvent(eventParams);
    this.socketStateService.emitConnected(eventParams, 'SEND_EVENT');

    const vendorsStats = await this.vendorService.getVendorsStats({} as any);
    this.socketStateService.emitConnected({ vendorsStats }, 'STATS_UPDATE');
  }
}
