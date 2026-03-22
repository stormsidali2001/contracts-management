import { UserRole } from '../enums/user-role.enum';

export interface UserView {
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
  departement?: { id: string; title: string; abriviation: string } | null;
  direction?: { id: string; title: string; abriviation: string } | null;
}
