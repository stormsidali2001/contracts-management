"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorNumber = void 0;
class VendorNumber {
    constructor(value) {
        if (!value || value.trim().length === 0) {
            throw new Error('Vendor number must not be empty');
        }
        this.value = value.trim();
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.VendorNumber = VendorNumber;
//# sourceMappingURL=vendor-number.js.map