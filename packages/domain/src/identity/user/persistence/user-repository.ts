import { User } from '../user';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(filters?: {
    role?: string;
    directionId?: string;
    departementId?: string;
    isActive?: boolean;
  }): Promise<User[]>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
