export declare enum EntityTypeEnum {
    CONTRACT = "CONTRACT",
    CONVENSION = "CONVENSION",
    EMPLOYEE = "EMPLOYEE",
    JURIDICAL = "JURIDICAL",
    ADMIN = "ADMIN",
    VENDOR = "VENDOR"
}
export declare class EntityType {
    readonly value: EntityTypeEnum;
    constructor(value: EntityTypeEnum);
    equals(other: EntityType): boolean;
    toString(): string;
}
//# sourceMappingURL=entity-type.d.ts.map