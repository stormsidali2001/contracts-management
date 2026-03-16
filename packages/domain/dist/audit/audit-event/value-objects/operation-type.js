"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationType = exports.OperationTypeEnum = void 0;
var OperationTypeEnum;
(function (OperationTypeEnum) {
    OperationTypeEnum["INSERT"] = "INSERT";
    OperationTypeEnum["UPDATE"] = "UPDATE";
    OperationTypeEnum["DELETE"] = "DELETE";
    OperationTypeEnum["EXECUTE"] = "EXECUTE";
})(OperationTypeEnum || (exports.OperationTypeEnum = OperationTypeEnum = {}));
class OperationType {
    constructor(value) {
        if (!Object.values(OperationTypeEnum).includes(value)) {
            throw new Error(`Invalid operation type: "${value}"`);
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
exports.OperationType = OperationType;
//# sourceMappingURL=operation-type.js.map