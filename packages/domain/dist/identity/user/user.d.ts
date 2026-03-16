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
export declare class User extends AggregateRoot<UserId> {
    private _email;
    private _username;
    private _password;
    private _role;
    private _profile;
    private _recieve_notifications;
    private _membership;
    private _active;
    private _refresh_token_hash;
    private _password_token;
    readonly created_at: CreatedAt;
    private constructor();
    static create(props: CreateUserProps): User;
    static reconstitute(props: UserProps): User;
    get email(): EmailAddress;
    get username(): Username;
    get password(): PasswordHash;
    get role(): UserRole;
    get profile(): UserProfile;
    get recieve_notifications(): NotificationPreference;
    get membership(): OrganizationMembership;
    get active(): boolean;
    get refresh_token_hash(): RefreshTokenHash;
    get password_token(): PasswordResetToken | null;
    changeRole(role: UserRoleEnum): void;
    assignToOrganization(directionId: string, departementId: string): void;
    toggleNotifications(): void;
    activate(): void;
    deactivate(): void;
    setRefreshToken(hash: string): void;
    clearRefreshToken(): void;
    requestPasswordReset(tokenValue: string): PasswordResetToken;
    resetPassword(newHash: string): void;
    canAccessDepartement(departementId: string): boolean;
    isInOrganization(directionId: string, departementId: string): boolean;
}
//# sourceMappingURL=user.d.ts.map