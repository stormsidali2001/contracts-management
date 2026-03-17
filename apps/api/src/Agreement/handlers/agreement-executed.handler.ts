import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { DirectionService } from 'src/direction/services/direction.service';
import { UserNotificationService } from 'src/user/user-notification.service';
import { AgreementExecutedEvent } from '../domain/events/agreement-executed.event';

@Injectable()
@EventsHandler(AgreementExecutedEvent)
export class AgreementExecutedHandler
  implements IEventHandler<AgreementExecutedEvent>
{
  constructor(
    private readonly directionService: DirectionService,
    private readonly notificationService: UserNotificationService,
  ) {}

  async handle(event: AgreementExecutedEvent): Promise<void> {
    const { agreementId, type, departementId, directionId } = event;

    const orgInfo = await this.directionService.findWithDepartement(
      directionId,
      departementId,
    );
    const deptAbriviation = orgInfo?.departements[0]?.abriviation ?? '';
    const dirAbriviation = orgInfo?.abriviation ?? '';

    await this.notificationService.sendNewEventaToConnectedUsersWithContrainsts(
      {
        entity: type.toUpperCase() as unknown as Entity,
        operation: Operation.EXECUTE,
        entityId: agreementId,
        departementId,
        directionId,
        createdAt: new Date(),
        departementAbriviation: deptAbriviation,
        directionAbriviation: dirAbriviation,
      },
      departementId,
    );
  }
}
