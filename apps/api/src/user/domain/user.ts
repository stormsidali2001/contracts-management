import { UserRole } from 'src/core/types/UserRole.enum';

export class User {
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
