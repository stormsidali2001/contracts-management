import { UserEntity } from 'src/core/entities/User.entity';
import {
  User,
  UserId,
  EmailAddress,
  Username,
  PasswordHash,
  UserRole as DomainUserRole,
  UserRoleEnum,
  UserProfile,
  NotificationPreference,
  OrganizationMembership,
  RefreshTokenHash,
  CreatedAt,
  PasswordResetToken,
} from '@contracts/domain';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    const passwordToken = entity.password_token
      ? PasswordResetToken.reconstitute({
          id: entity.password_token.id as unknown as number,
          token: entity.password_token.token,
          createdAt: entity.password_token.createdAt,
          expiresIn: entity.password_token.expiresIn,
        })
      : null;

    // password may be null when loaded without select; use placeholder to reconstitute
    const passwordValue = (entity as any).password ?? '[NOT_LOADED]';

    return User.reconstitute({
      id: new UserId(entity.id),
      email: new EmailAddress(entity.email),
      username: new Username(entity.username),
      password: new PasswordHash(passwordValue),
      role: new DomainUserRole(entity.role as unknown as UserRoleEnum),
      profile: new UserProfile({
        firstName: entity.firstName,
        lastName: entity.lastName,
        imageUrl: entity.imageUrl,
      }),
      recieve_notifications: new NotificationPreference(entity.recieve_notifications),
      membership: entity.departementId && entity.directionId
        ? OrganizationMembership.of(entity.directionId, entity.departementId)
        : OrganizationMembership.none(),
      active: entity.active,
      refresh_token_hash: entity.refresh_token_hash
        ? new RefreshTokenHash(entity.refresh_token_hash)
        : RefreshTokenHash.empty(),
      password_token: passwordToken,
      created_at: new CreatedAt(entity.created_at),
    });
  }

  static toPersistence(domain: User): Partial<UserEntity> {
    const passwordValue = domain.password.value;
    return {
      id: domain.getId().value,
      email: domain.email.value,
      username: domain.username.value,
      ...(passwordValue !== '[NOT_LOADED]' ? { password: passwordValue } : {}),
      role: domain.role.value as unknown as UserEntity['role'],
      firstName: domain.profile.firstName,
      lastName: domain.profile.lastName,
      imageUrl: domain.profile.imageUrl ?? '',
      recieve_notifications: domain.recieve_notifications.receiveNotifications,
      departementId: domain.membership.departementId ?? undefined,
      directionId: domain.membership.directionId ?? undefined,
      active: domain.active,
      refresh_token_hash: domain.refresh_token_hash.isPresent()
        ? domain.refresh_token_hash.value
        : undefined,
      created_at: domain.created_at.value,
    };
  }
}
