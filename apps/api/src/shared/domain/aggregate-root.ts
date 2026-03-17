export abstract class AggregateRoot {
  private readonly _domainEvents: object[] = [];

  protected addEvent(event: object): void {
    this._domainEvents.push(event);
  }

  /**
   * Drains and returns all recorded domain events.
   * Called by the application service after aggregate mutation + persist.
   */
  pullEvents(): object[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }
}
