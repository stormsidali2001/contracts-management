export class ContractExpiringEvent {
  constructor(
    public readonly agreementId: string,
    public readonly agreementNumber: string,
    public readonly daysUntilExpiry: number,
    public readonly executionEndDate: Date,
    public readonly departementId: string,
    public readonly directionId: string,
  ) {}
}
