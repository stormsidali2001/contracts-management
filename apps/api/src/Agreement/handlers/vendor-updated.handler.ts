import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { UserNotificationService } from 'src/user/user-notification.service';
import { VendorUpdatedEvent } from '../domain/events/vendor-updated.event';

@Injectable()
@EventsHandler(VendorUpdatedEvent)
export class VendorUpdatedHandler implements IEventHandler<VendorUpdatedEvent> {
  constructor(private readonly notificationService: UserNotificationService) {}

  async handle(event: VendorUpdatedEvent): Promise<void> {
    await this.notificationService.sendEventToAllUsers({
      entity: Entity.VENDOR,
      operation: Operation.UPDATE,
      entityId: event.vendorId,
      createdAt: new Date(),
      departementAbriviation: '',
      directionId: null,
      departementId: null,
      directionAbriviation: '',
    });
  }
}
