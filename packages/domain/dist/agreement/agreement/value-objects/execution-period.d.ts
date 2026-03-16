export interface ExecutionPeriodProps {
    startDate: Date;
    endDate: Date;
}
export declare class ExecutionPeriod {
    readonly startDate: Date;
    readonly endDate: Date;
    constructor(props: ExecutionPeriodProps);
    equals(other: ExecutionPeriod): boolean;
}
//# sourceMappingURL=execution-period.d.ts.map