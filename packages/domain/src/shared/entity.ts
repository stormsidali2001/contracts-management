export abstract class Entity<TId> {
  protected constructor(private readonly _id: TId) {}

  getId(): TId {
    return this._id;
  }

  equals(other: Entity<TId>): boolean {
    if (!(other instanceof Entity)) return false;
    return JSON.stringify(this._id) === JSON.stringify(other._id);
  }
}
