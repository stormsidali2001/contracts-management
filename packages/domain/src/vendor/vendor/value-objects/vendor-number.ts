export class VendorNumber {
  readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Vendor number must not be empty');
    }
    this.value = value.trim();
  }

  equals(other: VendorNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
