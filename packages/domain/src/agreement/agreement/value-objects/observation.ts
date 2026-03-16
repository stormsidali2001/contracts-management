export class Observation {
  readonly value: string | null;

  constructor(value?: string | null) {
    this.value = value?.trim() ?? null;
  }

  hasValue(): boolean {
    return this.value !== null && this.value.length > 0;
  }

  equals(other: Observation): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value ?? '';
  }
}
