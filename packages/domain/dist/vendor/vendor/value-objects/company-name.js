"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyName = void 0;
class CompanyName {
    constructor(value) {
        if (!value || value.trim().length === 0) {
            throw new Error('Company name must not be empty');
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
exports.CompanyName = CompanyName;
//# sourceMappingURL=company-name.js.map