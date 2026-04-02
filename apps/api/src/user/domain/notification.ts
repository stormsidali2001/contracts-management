export class Notification {
  constructor(
    public readonly id: string,
    public readonly message: string,
    public readonly createdAt: Date,
    private _isRead: boolean,
  ) {}

  get isRead(): boolean {
    return this._isRead;
  }

  markAsRead(): void {
    this._isRead = true;
  }

  static reconstitute(
    id: string,
    message: string,
    createdAt: Date,
    isRead: boolean,
  ): Notification {
    return new Notification(id, message, createdAt, isRead);
  }
}
