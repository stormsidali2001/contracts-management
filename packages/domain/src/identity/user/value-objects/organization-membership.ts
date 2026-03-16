export interface OrganizationMembershipProps {
  directionId: string | null;
  departementId: string | null;
}

export class OrganizationMembership {
  readonly directionId: string | null;
  readonly departementId: string | null;

  constructor(props: OrganizationMembershipProps) {
    this.directionId = props.directionId ?? null;
    this.departementId = props.departementId ?? null;
  }

  static none(): OrganizationMembership {
    return new OrganizationMembership({ directionId: null, departementId: null });
  }

  static of(directionId: string, departementId: string): OrganizationMembership {
    if (!directionId || !departementId) {
      throw new Error('Both directionId and departementId are required for organization membership');
    }
    return new OrganizationMembership({ directionId, departementId });
  }

  isAssigned(): boolean {
    return this.directionId !== null && this.departementId !== null;
  }

  equals(other: OrganizationMembership): boolean {
    return (
      this.directionId === other.directionId &&
      this.departementId === other.departementId
    );
  }
}
