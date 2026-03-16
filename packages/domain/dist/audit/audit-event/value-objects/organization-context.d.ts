export interface OrganizationContextProps {
    departementAbriviation?: string | null;
    directionAbriviation?: string | null;
}
export declare class OrganizationContext {
    readonly departementAbriviation: string | null;
    readonly directionAbriviation: string | null;
    constructor(props?: OrganizationContextProps);
    static empty(): OrganizationContext;
    hasContext(): boolean;
    equals(other: OrganizationContext): boolean;
}
//# sourceMappingURL=organization-context.d.ts.map