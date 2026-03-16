"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenHash = void 0;
class RefreshTokenHash {
    constructor(value) {
        this.value = value ?? null;
    }
    static empty() {
        return new RefreshTokenHash(null);
    }
    isPresent() {
        return this.value !== null;
    }
    equals(other) {
        return this.value === other.value;
    }
    toJSON() {
        return '[REDACTED]';
    }
}
exports.RefreshTokenHash = RefreshTokenHash;
//# sourceMappingURL=refresh-token-hash.js.map