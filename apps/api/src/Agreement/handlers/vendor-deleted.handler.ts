import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { UserNotificationService } from 'src/user/user-notification.service';
import { VendorDeletedEvent } from '../domain/events/vendor-deleted.event';

@Injectable()
@EventsHandler(VendorDeletedEvent)
export class VendorDeletedHandler implements IEventHandler<VendorDeletedEvent> {
  constructor(private readonly notificationService: UserNotificationService) {}

  async handle(event: VendorDeletedEvent): Promise<void> {
    await this.notificationService.sendEventToAllUsers({
      entity: Entity.VENDOR,
      operation: Operation.DELETE,
      entityId: event.vendorId,
      createdAt: new Date(),
      departementAbriviation: '',
      directionId: null,
      departementId: null,
      directionAbriviation: '',
    });
  }
}
