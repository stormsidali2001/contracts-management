"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneNumbers = void 0;
class PhoneNumbers {
    constructor(props) {
        this.mobilePhone = props.mobilePhone?.trim() ?? '';
        this.homePhone = props.homePhone?.trim() ?? '';
    }
    equals(other) {
        return this.mobilePhone === other.mobilePhone && this.homePhone === other.homePhone;
    }
}
exports.PhoneNumbers = PhoneNumbers;
//# sourceMappingURL=phone-numbers.js.map