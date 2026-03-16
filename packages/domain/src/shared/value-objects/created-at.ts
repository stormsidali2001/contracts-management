export class CreatedAt {
  readonly value: Date;

  constructor(value: Date = new Date()) {
    this.value = new Date(value.getTime());
  }

  equals(other: CreatedAt): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  toString(): string {
    return this.value.toISOString();
  }
}
