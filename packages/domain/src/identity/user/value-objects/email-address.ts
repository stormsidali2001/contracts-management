const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailAddress {
  readonly value: string;

  constructor(value: string) {
    const trimmed = value?.trim() ?? '';
    if (!EMAIL_REGEX.test(trimmed)) {
      throw new Error(`Invalid email address: "${value}"`);
    }
    this.value = trimmed.toLowerCase();
  }

  equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
