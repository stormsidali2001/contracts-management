const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;

export class Username {
  readonly value: string;

  constructor(value: string) {
    const trimmed = value?.trim() ?? '';
    if (!USERNAME_REGEX.test(trimmed)) {
      throw new Error(
        `Invalid username "${value}". Must be 3–30 characters, letters/digits/underscore/dot/dash only.`,
      );
    }
    this.value = trimmed;
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
