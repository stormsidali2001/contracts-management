export declare enum AgreementStatusEnum {
    NOT_EXECUTED = "not_executed",
    IN_EXECUTION = "in_execution",
    IN_EXECUTION_WITH_DELAY = "in_execution_with_delay",
    EXECUTED = "executed",
    EXECUTED_WITH_DELAY = "executed_with_delay"
}
export declare class AgreementStatus {
    readonly value: AgreementStatusEnum;
    constructor(value: AgreementStatusEnum);
    /** NOT_EXECUTED → IN_EXECUTION */
    transitionToInExecution(): AgreementStatus;
    /** NOT_EXECUTED → IN_EXECUTION_WITH_DELAY */
    transitionToInExecutionWithDelay(): AgreementStatus;
    /** IN_EXECUTION → EXECUTED  |  IN_EXECUTION_WITH_DELAY → EXECUTED_WITH_DELAY */
    transitionToCompleted(): AgreementStatus;
    isNotExecuted(): boolean;
    isInExecution(): boolean;
    isCompleted(): boolean;
    equals(other: AgreementStatus): boolean;
    toString(): string;
}
//# sourceMappingURL=agreement-status.d.ts.map