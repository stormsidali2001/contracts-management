import { AggregateRoot } from '../../shared/aggregate-root';
import { CreatedAt } from '../../shared/value-objects/created-at';
import { NotificationId } from './value-objects/notification-id';
import { NotificationMessage } from './value-objects/notification-message';

export interface NotificationProps {
  id: NotificationId;
  message: NotificationMessage;
  /** FK to User — maps via `@ManyToOne` relation in DB */
  userId: string;
  createdAt: CreatedAt;
}

export class Notification extends AggregateRoot<NotificationId> {
  readonly message: NotificationMessage;
  readonly userId: string;
  readonly createdAt: CreatedAt;

  private constructor(props: NotificationProps) {
    super(props.id);
    this.message = props.message;
    this.userId = props.userId;
    this.createdAt = props.createdAt;
  }

  static create(id: string, userId: string, message: string): Notification {
    return new Notification({
      id: new NotificationId(id),
      message: new NotificationMessage(message),
      userId,
      createdAt: new CreatedAt(),
    });
  }

  static reconstitute(props: NotificationProps): Notification {
    return new Notification(props);
  }
}
