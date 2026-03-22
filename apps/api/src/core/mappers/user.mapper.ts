import { UserView } from '@contracts/types';
import { User } from 'src/user/domain/user.aggregate';
import { UserProfile } from 'src/user/domain/user.repository';

export class UserMapper {
  static from(source: User | UserProfile): UserView {
    const profile = source as UserProfile;
    return {
      id: source.id,
      email: source.email,
      username: source.username,
      firstName: source.firstName,
      lastName: source.lastName,
      imageUrl: source.imageUrl,
      active: source.active,
      role: source.role,
      recieve_notifications: source.recieve_notifications,
      created_at: source.created_at,
      departementId: source.departementId,
      directionId: source.directionId,
      departement: profile.departement,
      direction: profile.direction,
    };
  }

  static fromMany(sources: (User | UserProfile)[]): UserView[] {
    return sources.map(UserMapper.from);
  }
}
