export interface ContractPeriodProps {
  signatureDate: Date;
  expirationDate: Date;
}

export class ContractPeriod {
  readonly signatureDate: Date;
  readonly expirationDate: Date;

  constructor(props: ContractPeriodProps) {
    if (props.signatureDate > props.expirationDate) {
      throw new Error('Signature date must not be after expiration date');
    }
    this.signatureDate = new Date(props.signatureDate.getTime());
    this.expirationDate = new Date(props.expirationDate.getTime());
  }

  isExpired(): boolean {
    return new Date() > this.expirationDate;
  }

  equals(other: ContractPeriod): boolean {
    return (
      this.signatureDate.getTime() === other.signatureDate.getTime() &&
      this.expirationDate.getTime() === other.expirationDate.getTime()
    );
  }
}
