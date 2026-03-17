import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { UserNotificationService } from 'src/user/user-notification.service';
import { VendorCreatedEvent } from '../domain/events/vendor-created.event';

@Injectable()
@EventsHandler(VendorCreatedEvent)
export class VendorCreatedHandler implements IEventHandler<VendorCreatedEvent> {
  constructor(private readonly notificationService: UserNotificationService) {}

  async handle(event: VendorCreatedEvent): Promise<void> {
    await this.notificationService.sendEventToAllUsers({
      entity: Entity.VENDOR,
      operation: Operation.INSERT,
      entityId: event.vendorId,
      createdAt: new Date(),
    });
  }
}
