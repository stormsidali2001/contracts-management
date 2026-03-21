import { UserRole } from '../types/UserRole.enum';
import { UserEntity } from '../entities/User.entity';
import { User } from 'src/user/domain/user';
import { UserProfile } from 'src/user/domain/user.repository';
import { stripPrivateKeys } from './strip-private-keys.util';

type UserLike = UserEntity | User | UserProfile;

export class UserView {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  active: boolean;
  role: UserRole;
  recieve_notifications: boolean;
  created_at: Date;
  departementId: string | null;
  directionId: string | null;
  departement?: any;
  direction?: any;

  static from(source: UserLike): UserView {
    const { notifications: _n, ...safe } = source as any;
    return Object.assign(new UserView(), stripPrivateKeys(safe));
  }

  static fromMany(sources: UserLike[]): UserView[] {
    return sources.map(UserView.from);
  }
}
