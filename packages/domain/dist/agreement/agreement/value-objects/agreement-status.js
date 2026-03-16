"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgreementStatus = exports.AgreementStatusEnum = void 0;
var AgreementStatusEnum;
(function (AgreementStatusEnum) {
    AgreementStatusEnum["NOT_EXECUTED"] = "not_executed";
    AgreementStatusEnum["IN_EXECUTION"] = "in_execution";
    AgreementStatusEnum["IN_EXECUTION_WITH_DELAY"] = "in_execution_with_delay";
    AgreementStatusEnum["EXECUTED"] = "executed";
    AgreementStatusEnum["EXECUTED_WITH_DELAY"] = "executed_with_delay";
})(AgreementStatusEnum || (exports.AgreementStatusEnum = AgreementStatusEnum = {}));
class AgreementStatus {
    constructor(value) {
        if (!Object.values(AgreementStatusEnum).includes(value)) {
            throw new Error(`Invalid agreement status: "${value}"`);
        }
        this.value = value;
    }
    /** NOT_EXECUTED → IN_EXECUTION */
    transitionToInExecution() {
        if (this.value !== AgreementStatusEnum.NOT_EXECUTED) {
            throw new Error(`Cannot transition to IN_EXECUTION from "${this.value}"`);
        }
        return new AgreementStatus(AgreementStatusEnum.IN_EXECUTION);
    }
    /** NOT_EXECUTED → IN_EXECUTION_WITH_DELAY */
    transitionToInExecutionWithDelay() {
        if (this.value !== AgreementStatusEnum.NOT_EXECUTED) {
            throw new Error(`Cannot transition to IN_EXECUTION_WITH_DELAY from "${this.value}"`);
        }
        return new AgreementStatus(AgreementStatusEnum.IN_EXECUTION_WITH_DELAY);
    }
    /** IN_EXECUTION → EXECUTED  |  IN_EXECUTION_WITH_DELAY → EXECUTED_WITH_DELAY */
    transitionToCompleted() {
        if (this.value === AgreementStatusEnum.IN_EXECUTION) {
            return new AgreementStatus(AgreementStatusEnum.EXECUTED);
        }
        if (this.value === AgreementStatusEnum.IN_EXECUTION_WITH_DELAY) {
            return new AgreementStatus(AgreementStatusEnum.EXECUTED_WITH_DELAY);
        }
        throw new Error(`Cannot complete execution from "${this.value}"`);
    }
    isNotExecuted() {
        return this.value === AgreementStatusEnum.NOT_EXECUTED;
    }
    isInExecution() {
        return (this.value === AgreementStatusEnum.IN_EXECUTION ||
            this.value === AgreementStatusEnum.IN_EXECUTION_WITH_DELAY);
    }
    isCompleted() {
        return (this.value === AgreementStatusEnum.EXECUTED ||
            this.value === AgreementStatusEnum.EXECUTED_WITH_DELAY);
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.AgreementStatus = AgreementStatus;
//# sourceMappingURL=agreement-status.js.map