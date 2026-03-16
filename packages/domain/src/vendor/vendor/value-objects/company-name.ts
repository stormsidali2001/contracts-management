export class CompanyName {
  readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Company name must not be empty');
    }
    this.value = value.trim();
  }

  equals(other: CompanyName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
