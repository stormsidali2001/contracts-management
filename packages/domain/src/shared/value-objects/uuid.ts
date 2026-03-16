const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class Uuid {
  readonly value: string;

  constructor(value: string) {
    if (!UUID_REGEX.test(value)) {
      throw new Error(`Invalid UUID: "${value}"`);
    }
    this.value = value;
  }

  equals(other: Uuid): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
