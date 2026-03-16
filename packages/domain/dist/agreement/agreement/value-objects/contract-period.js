"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractPeriod = void 0;
class ContractPeriod {
    constructor(props) {
        if (props.signatureDate > props.expirationDate) {
            throw new Error('Signature date must not be after expiration date');
        }
        this.signatureDate = new Date(props.signatureDate.getTime());
        this.expirationDate = new Date(props.expirationDate.getTime());
    }
    isExpired() {
        return new Date() > this.expirationDate;
    }
    equals(other) {
        return (this.signatureDate.getTime() === other.signatureDate.getTime() &&
            this.expirationDate.getTime() === other.expirationDate.getTime());
    }
}
exports.ContractPeriod = ContractPeriod;
//# sourceMappingURL=contract-period.js.map