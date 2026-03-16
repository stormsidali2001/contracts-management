export class NotificationMessage {
  readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Notification message must not be empty');
    }
    this.value = value.trim();
  }

  equals(other: NotificationMessage): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
