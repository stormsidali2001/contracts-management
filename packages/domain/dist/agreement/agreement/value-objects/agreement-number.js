"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgreementNumber = void 0;
class AgreementNumber {
    constructor(value) {
        if (!value || value.trim().length === 0) {
            throw new Error('Agreement number must not be empty');
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
exports.AgreementNumber = AgreementNumber;
//# sourceMappingURL=agreement-number.js.map