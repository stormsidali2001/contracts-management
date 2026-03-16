import { AggregateRoot } from '../../shared/aggregate-root';
import { CreatedAt } from '../../shared/value-objects/created-at';
import { AgreementExecutionJob } from './entities/agreement-execution-job';
import { AgreementId } from './value-objects/agreement-id';
import { AgreementNumber } from './value-objects/agreement-number';
import { AgreementStatus } from './value-objects/agreement-status';
import { AgreementType, AgreementTypeEnum } from './value-objects/agreement-type';
import { ContractPeriod } from './value-objects/contract-period';
import { DocumentUrl } from './value-objects/document-url';
import { ExecutionPeriod } from './value-objects/execution-period';
import { MoneyAmount } from './value-objects/money-amount';
import { Observation } from './value-objects/observation';
export interface AgreementProps {
    id: AgreementId;
    number: AgreementNumber;
    type: AgreementType;
    object: string;
    amount: MoneyAmount;
    contractPeriod: ContractPeriod;
    executionPeriod: ExecutionPeriod | null;
    status: AgreementStatus;
    /** Maps to the `url` column in DB */
    documentUrl: DocumentUrl;
    observation: Observation;
    vendorId: string;
    directionId: string;
    departementId: string;
    createdAt: CreatedAt;
    executionJob: AgreementExecutionJob | null;
}
export interface CreateAgreementProps {
    id: string;
    number: string;
    type: AgreementTypeEnum;
    object: string;
    amount: number;
    signatureDate: Date;
    expirationDate: Date;
    /** Maps to the `url` column in DB */
    url: string;
    observation?: string | null;
    vendorId: string;
    directionId: string;
    departementId: string;
}
export declare class Agreement extends AggregateRoot<AgreementId> {
    private _number;
    private _type;
    private _object;
    private _amount;
    private _contractPeriod;
    private _executionPeriod;
    private _status;
    private _documentUrl;
    private _observation;
    readonly vendorId: string;
    readonly directionId: string;
    readonly departementId: string;
    readonly createdAt: CreatedAt;
    private _executionJob;
    private constructor();
    static create(props: CreateAgreementProps): Agreement;
    static reconstitute(props: AgreementProps): Agreement;
    get number(): AgreementNumber;
    get type(): AgreementType;
    get object(): string;
    get amount(): MoneyAmount;
    get contractPeriod(): ContractPeriod;
    get executionPeriod(): ExecutionPeriod | null;
    get status(): AgreementStatus;
    get documentUrl(): DocumentUrl;
    get observation(): Observation;
    get executionJob(): AgreementExecutionJob | null;
    canBeExecuted(): boolean;
    execute(executionPeriod: ExecutionPeriod): void;
    /** Called by cron when execution end_date is reached */
    completeExecution(): void;
    clearExecutionJob(): void;
}
//# sourceMappingURL=agreement.d.ts.map