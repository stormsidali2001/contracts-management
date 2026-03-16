export class Address {
  readonly value: string;

  constructor(value: string) {
    this.value = value?.trim() ?? '';
  }

  isEmpty(): boolean {
    return this.value.length === 0;
  }

  equals(other: Address): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
