export enum AgreementStatusEnum {
  NOT_EXECUTED = 'not_executed',
  IN_EXECUTION = 'in_execution',
  IN_EXECUTION_WITH_DELAY = 'in_execution_with_delay',
  EXECUTED = 'executed',
  EXECUTED_WITH_DELAY = 'executed_with_delay',
}

export class AgreementStatus {
  readonly value: AgreementStatusEnum;

  constructor(value: AgreementStatusEnum) {
    if (!Object.values(AgreementStatusEnum).includes(value)) {
      throw new Error(`Invalid agreement status: "${value}"`);
    }
    this.value = value;
  }

  /** NOT_EXECUTED → IN_EXECUTION */
  transitionToInExecution(): AgreementStatus {
    if (this.value !== AgreementStatusEnum.NOT_EXECUTED) {
      throw new Error(`Cannot transition to IN_EXECUTION from "${this.value}"`);
    }
    return new AgreementStatus(AgreementStatusEnum.IN_EXECUTION);
  }

  /** NOT_EXECUTED → IN_EXECUTION_WITH_DELAY */
  transitionToInExecutionWithDelay(): AgreementStatus {
    if (this.value !== AgreementStatusEnum.NOT_EXECUTED) {
      throw new Error(`Cannot transition to IN_EXECUTION_WITH_DELAY from "${this.value}"`);
    }
    return new AgreementStatus(AgreementStatusEnum.IN_EXECUTION_WITH_DELAY);
  }

  /** IN_EXECUTION → EXECUTED  |  IN_EXECUTION_WITH_DELAY → EXECUTED_WITH_DELAY */
  transitionToCompleted(): AgreementStatus {
    if (this.value === AgreementStatusEnum.IN_EXECUTION) {
      return new AgreementStatus(AgreementStatusEnum.EXECUTED);
    }
    if (this.value === AgreementStatusEnum.IN_EXECUTION_WITH_DELAY) {
      return new AgreementStatus(AgreementStatusEnum.EXECUTED_WITH_DELAY);
    }
    throw new Error(`Cannot complete execution from "${this.value}"`);
  }

  isNotExecuted(): boolean {
    return this.value === AgreementStatusEnum.NOT_EXECUTED;
  }

  isInExecution(): boolean {
    return (
      this.value === AgreementStatusEnum.IN_EXECUTION ||
      this.value === AgreementStatusEnum.IN_EXECUTION_WITH_DELAY
    );
  }

  isCompleted(): boolean {
    return (
      this.value === AgreementStatusEnum.EXECUTED ||
      this.value === AgreementStatusEnum.EXECUTED_WITH_DELAY
    );
  }

  equals(other: AgreementStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
