import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { UserRole } from 'src/core/types/UserRole.enum';
import { UserService } from 'src/user/application/user.service';
import { UserNotificationService } from 'src/user/application/user-notification.service';
import { NotificationPresenter } from 'src/user/infrastructure/notification.presenter';
import { SocketStateService } from 'src/socket/infrastructure/SocketState.service';
import { ContractExpiringEvent } from '../../domain/events/contract-expiring.event';

@Injectable()
@EventsHandler(ContractExpiringEvent)
export class ContractExpiringHandler
  implements IEventHandler<ContractExpiringEvent>
{
  private readonly logger = new Logger(ContractExpiringHandler.name);

  constructor(
    private readonly userService: UserService,
    private readonly notificationService: UserNotificationService,
    private readonly socketStateService: SocketStateService,
  ) {}

  async handle(event: ContractExpiringEvent): Promise<void> {
    this.logger.log(
      `Handling ContractExpiringEvent for agreement ${event.agreementNumber}`,
    );
    const { agreementNumber, daysUntilExpiry, executionEndDate } = event;

    const endDateLabel = new Date(executionEndDate).toLocaleDateString('fr-DZ');
    const dayWord = daysUntilExpiry === 1 ? 'jour' : 'jours';
    const message = `Le contrat N° ${agreementNumber} arrive à expiration dans ${daysUntilExpiry} ${dayWord} (le ${endDateLabel})`;

    const result = await this.userService.findAll(
      0,
      1000,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      UserRole.JURIDICAL,
    );
    const juridicals = result.data;

    this.logger.log(`Found ${juridicals.length} juridical users to notify`);

    if (juridicals.length === 0) return;

    const notifications = juridicals.map((u) => ({
      userId: u.id,
      message,
    }));

    const saved = await this.notificationService.saveForUsers(notifications);
    this.logger.log(`Saved ${saved.length} notifications`);

    this.socketStateService.emitIfConnected(
      saved.map(({ userId, notification }) => ({
        userId,
        data: NotificationPresenter.from(notification),
      })),
      'send_notification',
    );
  }
}
