export class DepartementRemovedEvent {
  constructor(
    public readonly departementId: string,
    public readonly directionId: string,
  ) {}
}
