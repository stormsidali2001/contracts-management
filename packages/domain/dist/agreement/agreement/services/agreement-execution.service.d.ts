import { AgreementStatusEnum } from '../value-objects/agreement-status';
import { ContractPeriod } from '../value-objects/contract-period';
import { ExecutionPeriod } from '../value-objects/execution-period';
export interface ExecutionDecision {
    isDelayed: boolean;
    targetStatus: AgreementStatusEnum.EXECUTED | AgreementStatusEnum.EXECUTED_WITH_DELAY;
    inExecutionStatus: AgreementStatusEnum.IN_EXECUTION | AgreementStatusEnum.IN_EXECUTION_WITH_DELAY;
}
/**
 * Domain service for pure execution-related computations.
 *
 * Determines whether an execution is delayed and what the resulting
 * status transitions should be — logic that requires both the contract
 * period and the execution period but does not belong to either VO alone.
 */
export declare class AgreementExecutionService {
    /**
     * Given a contract period and a proposed execution period, computes
     * whether the execution is delayed and what status transitions apply.
     *
     * Delayed = execution starts on or after the contract expiration date.
     */
    static computeExecutionDecision(contractPeriod: ContractPeriod, executionPeriod: ExecutionPeriod): ExecutionDecision;
    /**
     * Validates that the proposed execution period is structurally sound
     * relative to the contract period (e.g. execution cannot end before
     * the contract is signed).
     */
    static validateExecutionPeriod(contractPeriod: ContractPeriod, executionPeriod: ExecutionPeriod): void;
}
//# sourceMappingURL=agreement-execution.service.d.ts.map