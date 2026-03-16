export class MoneyAmount {
  readonly value: number;
  readonly currency = 'DA' as const;

  constructor(value: number) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`Money amount must be a positive number, got: ${value}`);
    }
    this.value = value;
  }

  equals(other: MoneyAmount): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return `${this.value} ${this.currency}`;
  }
}
