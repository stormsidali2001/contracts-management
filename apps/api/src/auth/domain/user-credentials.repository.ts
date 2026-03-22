import { UserCredentials } from './user-credentials.aggregate';

export interface IUserCredentialsRepository {
  save(credentials: UserCredentials): Promise<void>;

  /** Loads credential columns for a user — used for refresh-token and logout flows. */
  findByUserId(userId: string): Promise<UserCredentials | null>;

  /** Loads credential columns by email — used for login. */
  findByEmail(email: string): Promise<UserCredentials | null>;

  /** Loads credential columns + password_token by email — used for forgot-password. */
  findByEmailWithToken(email: string): Promise<UserCredentials | null>;

  /** Loads credential columns + password_token by userId — used for reset-password. */
  findByUserIdWithToken(userId: string): Promise<UserCredentials | null>;
}

export const USER_CREDENTIALS_REPOSITORY = Symbol('IUserCredentialsRepository');
