export class Abbreviation {
  readonly value: string;

  constructor(value: string) {
    const trimmed = value?.trim() ?? '';
    if (trimmed.length < 2 || trimmed.length > 10) {
      throw new Error('Abbreviation must be between 2 and 10 characters');
    }
    this.value = trimmed.toUpperCase();
  }

  equals(other: Abbreviation): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
