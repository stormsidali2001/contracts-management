"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordHash = void 0;
class PasswordHash {
    constructor(value) {
        if (!value || value.trim().length === 0) {
            throw new Error('Password hash must not be empty');
        }
        this.value = value;
    }
    equals(other) {
        return this.value === other.value;
    }
    /** Never expose the raw hash in serialization */
    toJSON() {
        return '[REDACTED]';
    }
}
exports.PasswordHash = PasswordHash;
//# sourceMappingURL=password-hash.js.map