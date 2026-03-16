"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetToken = void 0;
const entity_1 = require("../../../shared/entity");
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
class PasswordResetToken extends entity_1.Entity {
    constructor(props) {
        super(props.id);
        this.token = props.token;
        this.createdAt = new Date(props.createdAt.getTime());
        this.expiresIn = new Date(props.expiresIn.getTime());
    }
    static create(tokenValue) {
        const now = new Date();
        return new PasswordResetToken({
            id: null, // assigned by DB on insert
            token: tokenValue,
            createdAt: now,
            expiresIn: new Date(now.getTime() + TOKEN_TTL_MS),
        });
    }
    static reconstitute(props) {
        return new PasswordResetToken(props);
    }
    isExpired() {
        return new Date() > this.expiresIn;
    }
    isValid(tokenValue) {
        return !this.isExpired() && this.token === tokenValue;
    }
}
exports.PasswordResetToken = PasswordResetToken;
//# sourceMappingURL=password-reset-token.js.map