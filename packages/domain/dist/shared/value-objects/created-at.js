"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatedAt = void 0;
class CreatedAt {
    constructor(value = new Date()) {
        this.value = new Date(value.getTime());
    }
    equals(other) {
        return this.value.getTime() === other.value.getTime();
    }
    toString() {
        return this.value.toISOString();
    }
}
exports.CreatedAt = CreatedAt;
//# sourceMappingURL=created-at.js.map