"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uuid = void 0;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
class Uuid {
    constructor(value) {
        if (!UUID_REGEX.test(value)) {
            throw new Error(`Invalid UUID: "${value}"`);
        }
        this.value = value;
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.Uuid = Uuid;
//# sourceMappingURL=uuid.js.map