import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { IUserRepository, USER_REPOSITORY } from '../domain/user.repository';
import { UserNotificationService } from '../user-notification.service';
import { UserUpdatedEvent } from '../domain/events/user-updated.event';

@Injectable()
@EventsHandler(UserUpdatedEvent)
export class UserUpdatedHandler implements IEventHandler<UserUpdatedEvent> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly notificationService: UserNotificationService,
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
      await this.notificationService.sendNotifications(notifications);
    }

    await this.notificationService.emitDataToAdminsOnly({
      entity: role as unknown as Entity,
      operation: Operation.UPDATE,
      departementId,
      directionId,
      entityId: userId,
      departementAbriviation,
      directionAbriviation,
    });

    await this.notificationService.IncrementUsersStats({
      type: role as unknown as Entity,
      operation: Operation.UPDATE,
    });
  }
}
