export interface OrganizationMembershipProps {
    directionId: string | null;
    departementId: string | null;
}
export declare class OrganizationMembership {
    readonly directionId: string | null;
    readonly departementId: string | null;
    constructor(props: OrganizationMembershipProps);
    static none(): OrganizationMembership;
    static of(directionId: string, departementId: string): OrganizationMembership;
    isAssigned(): boolean;
    equals(other: OrganizationMembership): boolean;
}
//# sourceMappingURL=organization-membership.d.ts.map