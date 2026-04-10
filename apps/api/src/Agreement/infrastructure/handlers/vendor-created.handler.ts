import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { EventService } from 'src/Event/application/Event.service';
import { SocketStateService } from 'src/socket/SocketState.service';
import { VendorService } from '../application/vendor.service';
import { VendorCreatedEvent } from '../domain/events/vendor-created.event';

@Injectable()
@EventsHandler(VendorCreatedEvent)
export class VendorCreatedHandler implements IEventHandler<VendorCreatedEvent> {
  constructor(
    private readonly vendorService: VendorService,
    private readonly eventService: EventService,
    private readonly socketStateService: SocketStateService,
  ) {}

  async handle(event: VendorCreatedEvent): Promise<void> {
    const eventParams = {
      entity: Entity.VENDOR,
      operation: Operation.INSERT,
      entityId: event.vendorId,
      createdAt: new Date(),
    };
    await this.eventService.addEvent(eventParams);
    this.socketStateService.emitConnected(eventParams, 'SEND_EVENT');

    const vendorsStats = await this.vendorService.getVendorsStats({} as any);
    this.socketStateService.emitConnected({ vendorsStats }, 'STATS_UPDATE');
  }
}
