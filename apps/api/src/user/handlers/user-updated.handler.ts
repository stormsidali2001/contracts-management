import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { EventService } from 'src/Event/services/Event.service';
import { SocketStateService } from 'src/socket/SocketState.service';
import { IUserRepository, USER_REPOSITORY } from '../domain/user.repository';
import { UserNotificationService } from '../user-notification.service';
import { UserService } from '../user.service';
import { UserUpdatedEvent } from '../domain/events/user-updated.event';

@Injectable()
@EventsHandler(UserUpdatedEvent)
export class UserUpdatedHandler implements IEventHandler<UserUpdatedEvent> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly notificationService: UserNotificationService,
    private readonly userService: UserService,
    private readonly eventService: EventService,
    private readonly socketStateService: SocketStateService,
  ) {}

  async handle(event: UserUpdatedEvent): Promise<void> {
    const {
      userId,
      role,
      email,
      departementId,
      directionId,
      departementAbriviation,
      directionAbriviation,
    } = event;

    const extraMessage =
      departementAbriviation && directionAbriviation
        ? `au ${departementAbriviation} de ${directionAbriviation}`
        : '';

    const admins = await this.userRepository.findAdmins();
    const notifications = admins.map((u) => ({
      userId: u.id,
      message: `l'utilisateur ${email} de type ${role} ${extraMessage} est mis a jour avec success`,
    }));

    if (notifications.length > 0) {
      await this.notificationService.saveNotifications(notifications);
      this.socketStateService.emitIfConnected(
        notifications.map((n) => ({ userId: n.userId, data: n.message })),
        'send_notification',
      );
    }

    const eventParams = {
      entity: role as unknown as Entity,
      operation: Operation.UPDATE,
      departementId,
      directionId,
      entityId: userId,
      departementAbriviation,
      directionAbriviation,
    };
    await this.eventService.addEvent(eventParams);
    this.socketStateService.emitDataToAdminsOnly('SEND_EVENT', eventParams);

    const userTypes = await this.userService.getUserTypesStats({} as any, null as any);
    this.socketStateService.emitDataToAdminsOnly('STATS_UPDATE', { userTypes });
  }
}
