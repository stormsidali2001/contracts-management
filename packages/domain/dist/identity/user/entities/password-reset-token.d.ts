import { Entity } from '../../../shared/entity';
export interface PasswordResetTokenProps {
    /** DB auto-increment int — null when not yet persisted */
    id: number | null;
    /** Maps to `token` column in DB */
    token: string;
    createdAt: Date;
    /** Maps to `expiresIn` column in DB */
    expiresIn: Date;
}
export declare class PasswordResetToken extends Entity<number | null> {
    readonly token: string;
    readonly createdAt: Date;
    readonly expiresIn: Date;
    private constructor();
    static create(tokenValue: string): PasswordResetToken;
    static reconstitute(props: PasswordResetTokenProps): PasswordResetToken;
    isExpired(): boolean;
    isValid(tokenValue: string): boolean;
}
//# sourceMappingURL=password-reset-token.d.ts.map