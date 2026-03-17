import { UserRole } from 'src/core/types/UserRole.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { User } from './user';

/**
 * Read model — assembles user data with org info for views.
 * Not a domain aggregate; used only by the presentation/notification layer.
 * References to Direction/Departement are by ID only on the User aggregate;
 * this DTO is built by a dedicated read-model query in the repository.
 */
export interface UserProfile extends Omit<User, 'setRefreshToken' | 'clearRefreshToken' | 'requestPasswordReset' | 'resetPassword' | 'clearPasswordToken' | 'toggleNotifications' | 'update' | 'updateImage'> {
  direction?: { id: string; title: string; abriviation: string } | null;
  departement?: { id: string; title: string; abriviation: string } | null;
}

export interface IUserRepository {
  // ── Persistence ────────────────────────────────────────────────────────────
  save(user: User): Promise<User>;
  delete(userId: string): Promise<void>;

  // ── Aggregate loaders ──────────────────────────────────────────────────────

  findById(id: string): Promise<User | null>;

  /** Loads user including `password` column (needed for login). */
  findByEmailOrUsername(email: string, username: string): Promise<User | null>;

  /**
   * Read-model query: loads user with direction + departement relations joined.
   * Returns a UserProfile (not the domain aggregate) — used for views and
   * notification message assembly only.
   */
  findProfileById(id: string): Promise<UserProfile | null>;

  /** Loads user with password_token relation (for forgot-password flow). */
  findByEmailWithPasswordToken(email: string): Promise<User | null>;

  /** Loads user with password_token relation (for reset-password flow). */
  findByIdWithPasswordToken(id: string): Promise<User | null>;

  /** Loads user with `password` column selected (for connected-user reset-password). */
  findByIdWithPassword(id: string): Promise<User | null>;

  findAdmins(): Promise<User[]>;

  // ── Read-model queries (bypass aggregate for lightweight reads) ─────────────

  findPaginated(
    offset: number,
    limit: number,
    orderBy?: string,
    searchQuery?: string,
    departementId?: string,
    directionId?: string,
    active?: 'active' | 'not_active',
    role?: UserRole,
  ): Promise<PaginationResponse<User>>;

  getUserTypesStats(
    params: StatsParamsDTO,
  ): Promise<{ role: string; total: string }[]>;

  /** Used by UserNotificationService to notify users in a departement. */
  findByDepartementId(departementId: string): Promise<User[]>;

  /** Used by AgreementService to find juridical users in an org unit. */
  findJuridicalsByOrg(
    departementId: string,
    directionId: string,
  ): Promise<User[]>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
