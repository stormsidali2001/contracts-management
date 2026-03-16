export abstract class AggregateRoot<TId> {
  private readonly _domainEvents: unknown[] = [];

  protected constructor(private readonly _id: TId) {}

  getId(): TId {
    return this._id;
  }

  equals(other: AggregateRoot<TId>): boolean {
    if (!(other instanceof AggregateRoot)) return false;
    return JSON.stringify(this._id) === JSON.stringify(other._id);
  }

  protected addDomainEvent(event: unknown): void {
    this._domainEvents.push(event);
  }

  pullDomainEvents(): unknown[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }
}
