"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
class Address {
    constructor(value) {
        this.value = value?.trim() ?? '';
    }
    isEmpty() {
        return this.value.length === 0;
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.Address = Address;
//# sourceMappingURL=address.js.map