import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { UserRole } from 'src/core/types/UserRole.enum';
import { DirectionService } from 'src/direction/services/direction.service';
import { UserService } from 'src/user/user.service';
import { UserNotificationService } from 'src/user/user-notification.service';
import {
  IVendorRepository,
  VENDOR_REPOSITORY,
} from '../domain/vendor.repository';
import { AgreementCreatedEvent } from '../domain/events/agreement-created.event';

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
  ) {}

  async handle(event: AgreementCreatedEvent): Promise<void> {
    const { agreementId, type, departementId, directionId, vendorId } = event;

    const [vendor, orgInfo] = await Promise.all([
      this.vendorRepository.findById(vendorId),
      this.directionService.findWithDepartement(directionId, departementId),
    ]);

    const vendorName = vendor?.company_name ?? '';
    const deptAbriviation = orgInfo?.departements[0]?.abriviation ?? '';
    const dirAbriviation = orgInfo?.abriviation ?? '';
    const extraMessage = `au ${deptAbriviation} de ${dirAbriviation}`;
    const isContract = type === AgreementType.CONTRACT;
    const typeLabel = isContract
      ? 'un nouveau contrat'
      : 'une nouvelle convension';

    await this.notificationService.sendToUsersInDepartement(
      departementId,
      `${typeLabel} est ajoute a votre departement avec le fournisseur: ${vendorName}`,
    );

    const juridicals = await this.userService.findAllBy({
      role: UserRole.JURIDICAL,
    });
    const notifications = juridicals.map((j) => ({
      message: `${typeLabel} est ajoute ${extraMessage} avec le fournisseur: ${vendorName}`,
      userId: j.id,
    }));
    if (notifications.length > 0) {
      await this.notificationService.sendNotifications(notifications);
    }

    await this.notificationService.sendNewEventaToConnectedUsersWithContrainsts(
      {
        entity: type.toUpperCase() as unknown as Entity,
        operation: Operation.INSERT,
        entityId: agreementId,
        departementId,
        directionId,
        departementAbriviation: deptAbriviation,
        directionAbriviation: dirAbriviation,
        createdAt: new Date(),
      },
      departementId,
    );

    await this.notificationService.IncrementAgreementsStats(
      {
        operation: Operation.INSERT,
        type: type.toUpperCase() as unknown as Entity,
      },
      departementId,
    );
  }
}
