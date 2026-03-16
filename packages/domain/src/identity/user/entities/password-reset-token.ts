import { Entity } from '../../../shared/entity';

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

export interface PasswordResetTokenProps {
  /** DB auto-increment int — null when not yet persisted */
  id: number | null;
  /** Maps to `token` column in DB */
  token: string;
  createdAt: Date;
  /** Maps to `expiresIn` column in DB */
  expiresIn: Date;
}

export class PasswordResetToken extends Entity<number | null> {
  readonly token: string;
  readonly createdAt: Date;
  readonly expiresIn: Date;

  private constructor(props: PasswordResetTokenProps) {
    super(props.id);
    this.token = props.token;
    this.createdAt = new Date(props.createdAt.getTime());
    this.expiresIn = new Date(props.expiresIn.getTime());
  }

  static create(tokenValue: string): PasswordResetToken {
    const now = new Date();
    return new PasswordResetToken({
      id: null, // assigned by DB on insert
      token: tokenValue,
      createdAt: now,
      expiresIn: new Date(now.getTime() + TOKEN_TTL_MS),
    });
  }

  static reconstitute(props: PasswordResetTokenProps): PasswordResetToken {
    return new PasswordResetToken(props);
  }

  isExpired(): boolean {
    return new Date() > this.expiresIn;
  }

  isValid(tokenValue: string): boolean {
    return !this.isExpired() && this.token === tokenValue;
  }
}
