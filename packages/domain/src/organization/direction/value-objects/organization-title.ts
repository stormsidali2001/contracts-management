export class OrganizationTitle {
  readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Organization title must not be empty');
    }
    this.value = value.trim();
  }

  equals(other: OrganizationTitle): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
