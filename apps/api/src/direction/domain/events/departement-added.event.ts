export class DepartementAddedEvent {
  constructor(
    public readonly departementId: string,
    public readonly directionId: string,
  ) {}
}
