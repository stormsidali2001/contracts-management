"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgreementType = exports.AgreementTypeEnum = void 0;
var AgreementTypeEnum;
(function (AgreementTypeEnum) {
    AgreementTypeEnum["CONTRACT"] = "contract";
    AgreementTypeEnum["CONVENSION"] = "convension";
})(AgreementTypeEnum || (exports.AgreementTypeEnum = AgreementTypeEnum = {}));
class AgreementType {
    constructor(value) {
        if (!Object.values(AgreementTypeEnum).includes(value)) {
            throw new Error(`Invalid agreement type: "${value}"`);
        }
        this.value = value;
    }
    isContract() {
        return this.value === AgreementTypeEnum.CONTRACT;
    }
    isConvension() {
        return this.value === AgreementTypeEnum.CONVENSION;
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.AgreementType = AgreementType;
//# sourceMappingURL=agreement-type.js.map