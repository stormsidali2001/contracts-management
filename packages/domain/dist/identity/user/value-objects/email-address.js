"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAddress = void 0;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
class EmailAddress {
    constructor(value) {
        const trimmed = value?.trim() ?? '';
        if (!EMAIL_REGEX.test(trimmed)) {
            throw new Error(`Invalid email address: "${value}"`);
        }
        this.value = trimmed.toLowerCase();
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.EmailAddress = EmailAddress;
//# sourceMappingURL=email-address.js.map