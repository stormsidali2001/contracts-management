import { User } from '../user';

export interface UserRepository {
  // ── Single aggregate fetch ─────────────────────────────────────────────────
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  /** Returns the user whose email OR username matches. Password hash is included. */
  findByEmailOrUsername(email: string, username: string): Promise<User | null>;
  /** Used in the forgot-password flow — loads user with password-reset token. */
  findByEmailWithPasswordToken(email: string): Promise<User | null>;
  /** Used in the reset-password flow — loads user with password-reset token. */
  findByIdWithPasswordToken(userId: string): Promise<User | null>;

  // ── Collection fetch ───────────────────────────────────────────────────────
  findAll(filters?: {
    role?: string;
    directionId?: string;
    departementId?: string;
    isActive?: boolean;
  }): Promise<User[]>;
  findAdminUsers(): Promise<User[]>;
  findPaginated(params: {
    offset: number;
    limit: number;
    orderBy?: string;
    searchQuery?: string;
    departementId?: string;
    directionId?: string;
    active?: 'active' | 'not_active';
    role?: string;
  }): Promise<{ data: User[]; total: number }>;

  // ── Write ──────────────────────────────────────────────────────────────────
  /** Persist the full aggregate. Handles password-reset token lifecycle automatically. */
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;

  // ── Infrastructure-optimised read helpers ─────────────────────────────────
  /** Returns only the bcrypt password hash — used for login/password-change checks. */
  getPasswordOnly(id: string): Promise<string | null>;
  getUserTypesStats(params: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ role: string; total: string }[]>;
}
