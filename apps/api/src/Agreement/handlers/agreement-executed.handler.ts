import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { EventService } from 'src/Event/services/Event.service';
import { SocketStateService } from 'src/socket/SocketState.service';
import { DirectionService } from 'src/direction/services/direction.service';
import { AgreementExecutedEvent } from '../domain/events/agreement-executed.event';

@Injectable()
@EventsHandler(AgreementExecutedEvent)
export class AgreementExecutedHandler
  implements IEventHandler<AgreementExecutedEvent>
{
  constructor(
    private readonly directionService: DirectionService,
    private readonly eventService: EventService,
    private readonly socketStateService: SocketStateService,
  ) {}

  async handle(event: AgreementExecutedEvent): Promise<void> {
    const { agreementId, type, departementId, directionId } = event;

    const orgInfo = await this.directionService.findWithDepartement(
      directionId,
      departementId,
    );
    const deptAbriviation = orgInfo?.departements[0]?.abriviation ?? '';
    const dirAbriviation = orgInfo?.abriviation ?? '';

    const eventParams = {
      entity: type.toUpperCase() as unknown as Entity,
      operation: Operation.EXECUTE,
      entityId: agreementId,
      departementId,
      directionId,
      createdAt: new Date(),
      departementAbriviation: deptAbriviation,
      directionAbriviation: dirAbriviation,
    };
    await this.eventService.addEvent(eventParams);
    this.socketStateService.emitDataToConnectedUsersWithContrainsts(
      'SEND_EVENT',
      departementId,
      eventParams,
    );
  }
}
