export class DocumentUrl {
  readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Document URL must not be empty');
    }
    this.value = value.trim();
  }

  equals(other: DocumentUrl): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
