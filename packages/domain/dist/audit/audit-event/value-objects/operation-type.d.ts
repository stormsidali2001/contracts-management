export declare enum OperationTypeEnum {
    INSERT = "INSERT",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    EXECUTE = "EXECUTE"
}
export declare class OperationType {
    readonly value: OperationTypeEnum;
    constructor(value: OperationTypeEnum);
    equals(other: OperationType): boolean;
    toString(): string;
}
//# sourceMappingURL=operation-type.d.ts.map