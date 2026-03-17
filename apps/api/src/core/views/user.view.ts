import { UserRole } from '../types/UserRole.enum';
import { UserEntity } from '../entities/User.entity';

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

  static from(entity: UserEntity): UserView {
    const {
      password: _p,
      refresh_token_hash: _r,
      password_token: _pt,
      notifications: _n,
      ...safe
    } = entity as any;
    return Object.assign(new UserView(), safe);
  }

  static fromMany(entities: UserEntity[]): UserView[] {
    return entities.map(UserView.from);
  }
}
