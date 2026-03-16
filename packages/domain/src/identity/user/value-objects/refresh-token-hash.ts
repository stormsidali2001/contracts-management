export class RefreshTokenHash {
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value ?? null;
  }

  static empty(): RefreshTokenHash {
    return new RefreshTokenHash(null);
  }

  isPresent(): boolean {
    return this.value !== null;
  }

  equals(other: RefreshTokenHash): boolean {
    return this.value === other.value;
  }

  toJSON(): string {
    return '[REDACTED]';
  }
}
