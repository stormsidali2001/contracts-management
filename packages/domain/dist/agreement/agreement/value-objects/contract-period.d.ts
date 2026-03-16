export interface ContractPeriodProps {
    signatureDate: Date;
    expirationDate: Date;
}
export declare class ContractPeriod {
    readonly signatureDate: Date;
    readonly expirationDate: Date;
    constructor(props: ContractPeriodProps);
    isExpired(): boolean;
    equals(other: ContractPeriod): boolean;
}
//# sourceMappingURL=contract-period.d.ts.map