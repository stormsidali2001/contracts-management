import { UserRole } from 'src/core/types/UserRole.enum';

export interface PasswordToken {
  id?: string;
  token: string;
  expiresIn: Date;
}

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

  // Auth data — stripped in UserView
  password?: string;
  refresh_token_hash?: string | null;
  // undefined = not loaded, null = explicitly cleared, value = set
  password_token?: PasswordToken | null;

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
    password?: string;
    refresh_token_hash?: string | null;
    password_token?: PasswordToken | null;
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
    this.password = props.password;
    this.refresh_token_hash = props.refresh_token_hash;
    this.password_token = props.password_token;
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
    password?: string;
    refresh_token_hash?: string | null;
    password_token?: PasswordToken | null;
  }): User {
    return new User(props);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  setRefreshToken(hash: string): void {
    this.refresh_token_hash = hash;
  }

  clearRefreshToken(): void {
    this.refresh_token_hash = null;
  }

  requestPasswordReset(hashedToken: string, expiresIn: Date): void {
    this.password_token = { token: hashedToken, expiresIn };
  }

  resetPassword(hashedPassword: string): void {
    this.password = hashedPassword;
    this.password_token = null;
  }

  clearPasswordToken(): void {
    this.password_token = null;
  }

  // ── Profile ───────────────────────────────────────────────────────────────

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
