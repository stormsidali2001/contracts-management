import { AggregateRoot } from '../../shared/aggregate-root';
import { CreatedAt } from '../../shared/value-objects/created-at';
import { AgreementExecutionJob } from './entities/agreement-execution-job';
import { AgreementExecutionService } from './services/agreement-execution.service';
import { AgreementId } from './value-objects/agreement-id';
import { AgreementNumber } from './value-objects/agreement-number';
import { AgreementStatus, AgreementStatusEnum } from './value-objects/agreement-status';
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

export class Agreement extends AggregateRoot<AgreementId> {
  private _number: AgreementNumber;
  private _type: AgreementType;
  private _object: string;
  private _amount: MoneyAmount;
  private _contractPeriod: ContractPeriod;
  private _executionPeriod: ExecutionPeriod | null;
  private _status: AgreementStatus;
  private _documentUrl: DocumentUrl;
  private _observation: Observation;
  readonly vendorId: string;
  readonly directionId: string;
  readonly departementId: string;
  readonly createdAt: CreatedAt;
  private _executionJob: AgreementExecutionJob | null;

  private constructor(props: AgreementProps) {
    super(props.id);
    this._number = props.number;
    this._type = props.type;
    this._object = props.object;
    this._amount = props.amount;
    this._contractPeriod = props.contractPeriod;
    this._executionPeriod = props.executionPeriod;
    this._status = props.status;
    this._documentUrl = props.documentUrl;
    this._observation = props.observation;
    this.vendorId = props.vendorId;
    this.directionId = props.directionId;
    this.departementId = props.departementId;
    this.createdAt = props.createdAt;
    this._executionJob = props.executionJob;
  }

  static create(props: CreateAgreementProps): Agreement {
    return new Agreement({
      id: new AgreementId(props.id),
      number: new AgreementNumber(props.number),
      type: new AgreementType(props.type),
      object: props.object,
      amount: new MoneyAmount(props.amount),
      contractPeriod: new ContractPeriod({
        signatureDate: props.signatureDate,
        expirationDate: props.expirationDate,
      }),
      executionPeriod: null,
      status: new AgreementStatus(AgreementStatusEnum.NOT_EXECUTED),
      documentUrl: new DocumentUrl(props.url),
      observation: new Observation(props.observation),
      vendorId: props.vendorId,
      directionId: props.directionId,
      departementId: props.departementId,
      createdAt: new CreatedAt(),
      executionJob: null,
    });
  }

  static reconstitute(props: AgreementProps): Agreement {
    return new Agreement(props);
  }

  get number(): AgreementNumber { return this._number; }
  get type(): AgreementType { return this._type; }
  get object(): string { return this._object; }
  get amount(): MoneyAmount { return this._amount; }
  get contractPeriod(): ContractPeriod { return this._contractPeriod; }
  get executionPeriod(): ExecutionPeriod | null { return this._executionPeriod; }
  get status(): AgreementStatus { return this._status; }
  get documentUrl(): DocumentUrl { return this._documentUrl; }
  get observation(): Observation { return this._observation; }
  get executionJob(): AgreementExecutionJob | null { return this._executionJob; }

  canBeExecuted(): boolean {
    return this._status.isNotExecuted();
  }

  execute(executionPeriod: ExecutionPeriod): void {
    if (!this.canBeExecuted()) {
      throw new Error(
        `Agreement "${this._number.value}" cannot be executed in status "${this._status.value}"`,
      );
    }

    AgreementExecutionService.validateExecutionPeriod(this._contractPeriod, executionPeriod);
    const { inExecutionStatus, targetStatus } =
      AgreementExecutionService.computeExecutionDecision(this._contractPeriod, executionPeriod);

    this._executionPeriod = executionPeriod;
    this._status = new AgreementStatus(inExecutionStatus);
    this._executionJob = AgreementExecutionJob.create(
      this.getId().value,
      this._type.value,
      executionPeriod.endDate,
      targetStatus,
    );
  }

  /** Called by cron when execution end_date is reached */
  completeExecution(): void {
    this._status = this._status.transitionToCompleted();
    this._executionJob = null;
  }

  clearExecutionJob(): void {
    this._executionJob = null;
  }
}
