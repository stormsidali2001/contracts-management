export class AgreementNumber {
  readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Agreement number must not be empty');
    }
    this.value = value.trim();
  }

  equals(other: AgreementNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
