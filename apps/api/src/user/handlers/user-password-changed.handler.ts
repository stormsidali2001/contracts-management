import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { EventService } from 'src/Event/application/Event.service';
import { SocketStateService } from 'src/socket/SocketState.service';
import { IUserRepository, USER_REPOSITORY } from '../domain/user.repository';
import { UserNotificationService } from '../application/user-notification.service';
import { UserPasswordChangedEvent } from '../domain/events/user-password-changed.event';

@Injectable()
@EventsHandler(UserPasswordChangedEvent)
export class UserPasswordChangedHandler
  implements IEventHandler<UserPasswordChangedEvent>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly notificationService: UserNotificationService,
    private readonly eventService: EventService,
    private readonly socketStateService: SocketStateService,
  ) {}

  async handle(event: UserPasswordChangedEvent): Promise<void> {
    const profile = await this.userRepository.findProfileById(event.userId);
    if (!profile) return;

    const extraMessage =
      profile.departement && profile.direction
        ? `au ${profile.departement.abriviation} de ${profile.direction.abriviation}`
        : '';

    const admins = await this.userRepository.findAdmins();
    const notifications = admins.map((u) => ({
      userId: u.id,
      message: `l'utilisateur ${profile.email} de type ${profile.role} ${extraMessage} est mise a jour avec success`,
    }));

    if (notifications.length > 0) {
      await this.notificationService.saveNotifications(notifications);
      this.socketStateService.emitIfConnected(
        notifications.map((n) => ({ userId: n.userId, data: n.message })),
        'send_notification',
      );
    }

    const eventParams = {
      entity: profile.role as unknown as Entity,
      operation: Operation.UPDATE,
      departementId: profile.departement?.id,
      directionId: profile.direction?.id,
      entityId: profile.id,
      departementAbriviation: profile.departement?.abriviation ?? '',
      directionAbriviation: profile.direction?.abriviation ?? '',
    };
    await this.eventService.addEvent(eventParams);
    this.socketStateService.emitDataToAdminsOnly('SEND_EVENT', eventParams);
  }
}
