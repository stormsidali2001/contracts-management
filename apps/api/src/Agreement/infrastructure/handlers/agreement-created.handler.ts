import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { UserRole } from 'src/core/types/UserRole.enum';
import { EventService } from 'src/Event/application/Event.service';
import { SocketStateService } from 'src/socket/infrastructure/SocketState.service';
import { DirectionService } from 'src/direction/application/direction.service';
import { UserService } from 'src/user/application/user.service';
import { NotificationPresenter } from 'src/user/infrastructure/notification.presenter';
import { UserNotificationService } from 'src/user/application/user-notification.service';
import {
  IVendorRepository,
  VENDOR_REPOSITORY,
} from '../../domain/persistence/vendor.repository';
import { AgreementCreatedEvent } from '../../domain/events/agreement-created.event';

@Injectable()
@EventsHandler(AgreementCreatedEvent)
export class AgreementCreatedHandler
  implements IEventHandler<AgreementCreatedEvent>
{
  constructor(
    @Inject(VENDOR_REPOSITORY)
    private readonly vendorRepository: IVendorRepository,
    private readonly directionService: DirectionService,
    private readonly userService: UserService,
    private readonly notificationService: UserNotificationService,
    private readonly eventService: EventService,
    private readonly socketStateService: SocketStateService,
  ) {}

  async handle(event: AgreementCreatedEvent): Promise<void> {
    const { agreementId, type, departementId, directionId, vendorId } = event;

    const [vendor, direction] = await Promise.all([
      this.vendorRepository.findById(vendorId),
      this.directionService.find(directionId),
    ]);

    const vendorName = vendor?.company_name ?? '';
    const deptAbriviation =
      direction?.departements.find((d) => d.id === departementId)
        ?.abriviation ?? '';
    const dirAbriviation = direction?.abriviation ?? '';
    const extraMessage = `au ${deptAbriviation} de ${dirAbriviation}`;
    const isContract = type === AgreementType.CONTRACT;
    const typeLabel = isContract
      ? 'un nouveau contrat'
      : 'une nouvelle convension';

    // Dept users — persist notifications, then emit per-user socket
    const deptMessage = `${typeLabel} est ajoute a votre departement avec le fournisseur: ${vendorName}`;
    const deptUsers = await this.userService.findAllBy({
      departement: { id: departementId },
    });
    const deptNotifications = deptUsers.map((u) => ({
      userId: u.id,
      message: deptMessage,
    }));
    if (deptNotifications.length > 0) {
      const savedDept = await this.notificationService.saveForUsers(
        deptNotifications,
      );
      this.socketStateService.emitIfConnected(
        savedDept.map(({ userId, notification }) => ({
          userId,
          data: NotificationPresenter.from(notification),
        })),
        'send_notification',
      );
    }

    // Juridicals — persist notifications, then emit per-user socket
    const juridicals = await this.userService.findAllBy({
      role: UserRole.JURIDICAL,
    });
    const juridicalNotifications = juridicals.map((j) => ({
      message: `${typeLabel} est ajoute ${extraMessage} avec le fournisseur: ${vendorName}`,
      userId: j.id,
    }));
    if (juridicalNotifications.length > 0) {
      const savedJuridical = await this.notificationService.saveForUsers(
        juridicalNotifications,
      );
      this.socketStateService.emitIfConnected(
        savedJuridical.map(({ userId, notification }) => ({
          userId,
          data: NotificationPresenter.from(notification),
        })),
        'send_notification',
      );
    }

    // Activity event — persist + broadcast to constrained rooms
    const eventParams = {
      entity: type.toUpperCase() as unknown as Entity,
      operation: Operation.INSERT,
      entityId: agreementId,
      departementId,
      directionId,
      departementAbriviation: deptAbriviation,
      directionAbriviation: dirAbriviation,
      createdAt: new Date(),
    };
    await this.eventService.addEvent(eventParams);
    this.socketStateService.emitDataToConnectedUsersWithContrainsts(
      'SEND_EVENT',
      departementId,
      eventParams,
    );

    // Stats signal — triggers re-fetch on frontend (agreement stats are role-filtered)
    this.socketStateService.emitDataToConnectedUsersWithContrainsts(
      'INC_AGR',
      departementId,
      {
        operation: Operation.INSERT,
        type: type.toUpperCase() as unknown as Entity,
      },
    );
  }
}
