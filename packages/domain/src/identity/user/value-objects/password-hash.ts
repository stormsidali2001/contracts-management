export class PasswordHash {
  readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Password hash must not be empty');
    }
    this.value = value;
  }

  equals(other: PasswordHash): boolean {
    return this.value === other.value;
  }

  /** Never expose the raw hash in serialization */
  toJSON(): string {
    return '[REDACTED]';
  }
}
