import { AggregateRoot } from 'src/shared/domain/aggregate-root';

export interface PasswordToken {
  id?: string;
  token: string;
  expiresIn: Date;
}

export class UserCredentials extends AggregateRoot {
  readonly userId: string;
  passwordHash: string;
  refreshTokenHash: string | null;
  // undefined = not loaded, null = explicitly cleared, value = set
  passwordToken: PasswordToken | null | undefined;

  private constructor(props: {
    userId: string;
    passwordHash: string;
    refreshTokenHash?: string | null;
    passwordToken?: PasswordToken | null;
  }) {
    super();
    this.userId = props.userId;
    this.passwordHash = props.passwordHash;
    this.refreshTokenHash = props.refreshTokenHash ?? null;
    this.passwordToken = props.passwordToken;
  }

  static create(props: {
    userId: string;
    passwordHash: string;
    refreshTokenHash?: string | null;
    passwordToken?: PasswordToken | null;
  }): UserCredentials {
    return new UserCredentials(props);
  }

  /** Reconstitutes existing credentials from persistence — no side effects. */
  static reconstitute(props: {
    userId: string;
    passwordHash: string;
    refreshTokenHash?: string | null;
    passwordToken?: PasswordToken | null;
  }): UserCredentials {
    return new UserCredentials(props);
  }

  setRefreshToken(hash: string): void {
    this.refreshTokenHash = hash;
  }

  clearRefreshToken(): void {
    this.refreshTokenHash = null;
  }

  requestPasswordReset(hashedToken: string, expiresIn: Date): void {
    this.passwordToken = { token: hashedToken, expiresIn };
  }

  resetPassword(hashedPassword: string): void {
    this.passwordHash = hashedPassword;
    this.passwordToken = null;
  }

  clearPasswordToken(): void {
    this.passwordToken = null;
  }
}
