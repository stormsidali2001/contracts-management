import { UserRole } from 'src/core/types/UserRole.enum';
import { AggregateRoot } from 'src/shared/domain/aggregate-root';
import { UserCreatedEvent } from './events/user-created.event';
import { UserUpdatedEvent } from './events/user-updated.event';
import { UserDeletedEvent } from './events/user-deleted.event';

export class User extends AggregateRoot {
  readonly id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  active: boolean;
  role: UserRole;
  recieve_notifications: boolean;
  readonly created_at?: Date;
  directionId: string | null;
  departementId: string | null;

  private constructor(props: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
    active?: boolean;
    role?: UserRole;
    recieve_notifications?: boolean;
    created_at?: Date;
    directionId?: string | null;
    departementId?: string | null;
  }) {
    super();
    this.id = props.id;
    this.email = props.email;
    this.username = props.username;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.imageUrl = props.imageUrl ?? '';
    this.active = props.active ?? true;
    this.role = props.role ?? UserRole.EMPLOYEE;
    this.recieve_notifications = props.recieve_notifications ?? false;
    this.created_at = props.created_at;
    this.directionId = props.directionId ?? null;
    this.departementId = props.departementId ?? null;
  }

  /**
   * Factory for creating a new user. The caller must call `recordCreated()` after
   * saving to attach the org abbreviations to the domain event.
   */
  static create(props: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
    active?: boolean;
    role?: UserRole;
    recieve_notifications?: boolean;
    created_at?: Date;
    directionId?: string | null;
    departementId?: string | null;
  }): User {
    return new User(props);
  }

  /** Reconstitutes an existing user from persistence — no events emitted. */
  static reconstitute(props: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
    active?: boolean;
    role?: UserRole;
    recieve_notifications?: boolean;
    created_at?: Date;
    directionId?: string | null;
    departementId?: string | null;
  }): User {
    return new User(props);
  }

  recordCreated(departementAbriviation: string, directionAbriviation: string): void {
    this.addEvent(
      new UserCreatedEvent(
        this.id,
        this.role,
        this.email,
        this.departementId,
        this.directionId,
        departementAbriviation,
        directionAbriviation,
      ),
    );
  }

  recordUpdated(departementAbriviation: string, directionAbriviation: string): void {
    this.addEvent(
      new UserUpdatedEvent(
        this.id,
        this.role,
        this.email,
        this.departementId,
        this.directionId,
        departementAbriviation,
        directionAbriviation,
      ),
    );
  }

  recordDeleted(departementAbriviation: string, directionAbriviation: string): void {
    this.addEvent(
      new UserDeletedEvent(
        this.id,
        this.role,
        this.email,
        this.departementId,
        this.directionId,
        departementAbriviation,
        directionAbriviation,
      ),
    );
  }

  toggleNotifications(): void {
    this.recieve_notifications = !this.recieve_notifications;
  }

  update(partial: {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    active?: boolean;
    role?: UserRole;
  }): void {
    Object.assign(this, partial);
  }

  updateImage(imageUrl: string): void {
    this.imageUrl = imageUrl;
  }
}
