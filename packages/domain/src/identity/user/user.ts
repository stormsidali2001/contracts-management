import { AggregateRoot } from '../../shared/aggregate-root';
import { CreatedAt } from '../../shared/value-objects/created-at';
import { PasswordResetToken } from './entities/password-reset-token';
import { EmailAddress } from './value-objects/email-address';
import { NotificationPreference } from './value-objects/notification-preference';
import { OrganizationMembership } from './value-objects/organization-membership';
import { PasswordHash } from './value-objects/password-hash';
import { RefreshTokenHash } from './value-objects/refresh-token-hash';
import { UserProfile } from './value-objects/user-profile';
import { UserId } from './value-objects/user-id';
import { UserRole, UserRoleEnum } from './value-objects/user-role';
import { Username } from './value-objects/username';

export interface UserProps {
  id: UserId;
  email: EmailAddress;
  username: Username;
  /** Maps to `password` column in DB */
  password: PasswordHash;
  role: UserRole;
  profile: UserProfile;
  /** Maps to `recieve_notifications` column in DB (typo preserved to match DB) */
  recieve_notifications: NotificationPreference;
  membership: OrganizationMembership;
  /** Maps to `active` column in DB */
  active: boolean;
  /** Maps to `refresh_token_hash` column in DB */
  refresh_token_hash: RefreshTokenHash;
  password_token: PasswordResetToken | null;
  /** Maps to `created_at` column in DB */
  created_at: CreatedAt;
}

export interface CreateUserProps {
  id: string;
  email: string;
  username: string;
  /** Raw bcrypt hash */
  password: string;
  role: UserRoleEnum;
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
  directionId?: string | null;
  departementId?: string | null;
}

export class User extends AggregateRoot<UserId> {
  private _email: EmailAddress;
  private _username: Username;
  private _password: PasswordHash;
  private _role: UserRole;
  private _profile: UserProfile;
  private _recieve_notifications: NotificationPreference;
  private _membership: OrganizationMembership;
  private _active: boolean;
  private _refresh_token_hash: RefreshTokenHash;
  private _password_token: PasswordResetToken | null;
  readonly created_at: CreatedAt;

  private constructor(props: UserProps) {
    super(props.id);
    this._email = props.email;
    this._username = props.username;
    this._password = props.password;
    this._role = props.role;
    this._profile = props.profile;
    this._recieve_notifications = props.recieve_notifications;
    this._membership = props.membership;
    this._active = props.active;
    this._refresh_token_hash = props.refresh_token_hash;
    this._password_token = props.password_token;
    this.created_at = props.created_at;
  }

  static create(props: CreateUserProps): User {
    const role = new UserRole(props.role);
    const membership =
      role.requiresOrganizationMembership() &&
      props.directionId &&
      props.departementId
        ? OrganizationMembership.of(props.directionId, props.departementId)
        : OrganizationMembership.none();

    return new User({
      id: new UserId(props.id),
      email: new EmailAddress(props.email),
      username: new Username(props.username),
      password: new PasswordHash(props.password),
      role,
      profile: new UserProfile({
        firstName: props.firstName,
        lastName: props.lastName,
        imageUrl: props.imageUrl,
      }),
      recieve_notifications: new NotificationPreference(false),
      membership,
      active: true,
      refresh_token_hash: RefreshTokenHash.empty(),
      password_token: null,
      created_at: new CreatedAt(),
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  get email(): EmailAddress { return this._email; }
  get username(): Username { return this._username; }
  get password(): PasswordHash { return this._password; }
  get role(): UserRole { return this._role; }
  get profile(): UserProfile { return this._profile; }
  get recieve_notifications(): NotificationPreference { return this._recieve_notifications; }
  get membership(): OrganizationMembership { return this._membership; }
  get active(): boolean { return this._active; }
  get refresh_token_hash(): RefreshTokenHash { return this._refresh_token_hash; }
  get password_token(): PasswordResetToken | null { return this._password_token; }

  changeRole(role: UserRoleEnum): void {
    this._role = new UserRole(role);
    if (!this._role.requiresOrganizationMembership()) {
      this._membership = OrganizationMembership.none();
    }
  }

  assignToOrganization(directionId: string, departementId: string): void {
    if (!this._role.requiresOrganizationMembership()) {
      throw new Error(
        `Role "${this._role.value}" cannot be assigned to an organization`,
      );
    }
    this._membership = OrganizationMembership.of(directionId, departementId);
  }

  toggleNotifications(): void {
    this._recieve_notifications = this._recieve_notifications.toggle();
  }

  activate(): void { this._active = true; }
  deactivate(): void { this._active = false; }

  setRefreshToken(hash: string): void {
    this._refresh_token_hash = new RefreshTokenHash(hash);
  }

  clearRefreshToken(): void {
    this._refresh_token_hash = RefreshTokenHash.empty();
  }

  requestPasswordReset(tokenValue: string): PasswordResetToken {
    const token = PasswordResetToken.create(tokenValue);
    this._password_token = token;
    return token;
  }

  resetPassword(newHash: string): void {
    this._password = new PasswordHash(newHash);
    this._password_token = null;
  }

  canAccessDepartement(departementId: string): boolean {
    return this._membership.departementId === departementId;
  }

  isInOrganization(directionId: string, departementId: string): boolean {
    return (
      this._membership.directionId === directionId &&
      this._membership.departementId === departementId
    );
  }
}
