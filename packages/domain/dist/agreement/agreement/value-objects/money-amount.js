"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoneyAmount = void 0;
class MoneyAmount {
    constructor(value) {
        this.currency = 'DA';
        if (!Number.isFinite(value) || value <= 0) {
            throw new Error(`Money amount must be a positive number, got: ${value}`);
        }
        this.value = value;
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return `${this.value} ${this.currency}`;
    }
}
exports.MoneyAmount = MoneyAmount;
//# sourceMappingURL=money-amount.js.map