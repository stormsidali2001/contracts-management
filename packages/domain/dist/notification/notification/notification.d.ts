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
export declare class Notification extends AggregateRoot<NotificationId> {
    readonly message: NotificationMessage;
    readonly userId: string;
    readonly createdAt: CreatedAt;
    private constructor();
    static create(id: string, userId: string, message: string): Notification;
    static reconstitute(props: NotificationProps): Notification;
}
//# sourceMappingURL=notification.d.ts.map