export class DepartementUpdatedEvent {
  constructor(
    public readonly departementId: string,
    public readonly directionId: string,
  ) {}
}
