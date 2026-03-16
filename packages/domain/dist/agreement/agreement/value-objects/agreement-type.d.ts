export declare enum AgreementTypeEnum {
    CONTRACT = "contract",
    CONVENSION = "convension"
}
export declare class AgreementType {
    readonly value: AgreementTypeEnum;
    constructor(value: AgreementTypeEnum);
    isContract(): boolean;
    isConvension(): boolean;
    equals(other: AgreementType): boolean;
    toString(): string;
}
//# sourceMappingURL=agreement-type.d.ts.map