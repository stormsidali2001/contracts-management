"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgreementExecutionService = void 0;
const agreement_status_1 = require("../value-objects/agreement-status");
/**
 * Domain service for pure execution-related computations.
 *
 * Determines whether an execution is delayed and what the resulting
 * status transitions should be — logic that requires both the contract
 * period and the execution period but does not belong to either VO alone.
 */
class AgreementExecutionService {
    /**
     * Given a contract period and a proposed execution period, computes
     * whether the execution is delayed and what status transitions apply.
     *
     * Delayed = execution starts on or after the contract expiration date.
     */
    static computeExecutionDecision(contractPeriod, executionPeriod) {
        const isDelayed = executionPeriod.startDate >= contractPeriod.expirationDate;
        return {
            isDelayed,
            inExecutionStatus: isDelayed
                ? agreement_status_1.AgreementStatusEnum.IN_EXECUTION_WITH_DELAY
                : agreement_status_1.AgreementStatusEnum.IN_EXECUTION,
            targetStatus: isDelayed
                ? agreement_status_1.AgreementStatusEnum.EXECUTED_WITH_DELAY
                : agreement_status_1.AgreementStatusEnum.EXECUTED,
        };
    }
    /**
     * Validates that the proposed execution period is structurally sound
     * relative to the contract period (e.g. execution cannot end before
     * the contract is signed).
     */
    static validateExecutionPeriod(contractPeriod, executionPeriod) {
        if (executionPeriod.startDate < contractPeriod.signatureDate) {
            throw new Error('Execution cannot start before the contract signature date');
        }
    }
}
exports.AgreementExecutionService = AgreementExecutionService;
//# sourceMappingURL=agreement-execution.service.js.map