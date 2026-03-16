export interface OrganizationContextProps {
  departementAbriviation?: string | null;
  directionAbriviation?: string | null;
}

export class OrganizationContext {
  readonly departementAbriviation: string | null;
  readonly directionAbriviation: string | null;

  constructor(props: OrganizationContextProps = {}) {
    this.departementAbriviation = props.departementAbriviation?.trim() ?? null;
    this.directionAbriviation = props.directionAbriviation?.trim() ?? null;
  }

  static empty(): OrganizationContext {
    return new OrganizationContext({});
  }

  hasContext(): boolean {
    return this.departementAbriviation !== null || this.directionAbriviation !== null;
  }

  equals(other: OrganizationContext): boolean {
    return (
      this.departementAbriviation === other.departementAbriviation &&
      this.directionAbriviation === other.directionAbriviation
    );
  }
}
