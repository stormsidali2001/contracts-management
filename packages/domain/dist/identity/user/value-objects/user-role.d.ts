export declare enum UserRoleEnum {
    EMPLOYEE = "EMPLOYEE",
    JURIDICAL = "JURIDICAL",
    ADMIN = "ADMIN"
}
export declare class UserRole {
    readonly value: UserRoleEnum;
    constructor(value: UserRoleEnum);
    isAdmin(): boolean;
    isJuridical(): boolean;
    isEmployee(): boolean;
    /** Admins and juridical users cannot belong to a departement */
    requiresOrganizationMembership(): boolean;
    equals(other: UserRole): boolean;
    toString(): string;
}
//# sourceMappingURL=user-role.d.ts.map