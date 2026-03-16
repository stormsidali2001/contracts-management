"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Username = void 0;
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;
class Username {
    constructor(value) {
        const trimmed = value?.trim() ?? '';
        if (!USERNAME_REGEX.test(trimmed)) {
            throw new Error(`Invalid username "${value}". Must be 3–30 characters, letters/digits/underscore/dot/dash only.`);
        }
        this.value = trimmed;
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.Username = Username;
//# sourceMappingURL=username.js.map