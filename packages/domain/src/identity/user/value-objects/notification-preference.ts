export class NotificationPreference {
  readonly receiveNotifications: boolean;

  constructor(receiveNotifications: boolean) {
    this.receiveNotifications = receiveNotifications;
  }

  toggle(): NotificationPreference {
    return new NotificationPreference(!this.receiveNotifications);
  }

  equals(other: NotificationPreference): boolean {
    return this.receiveNotifications === other.receiveNotifications;
  }
}
