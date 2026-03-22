import { AgreementStatus } from 'src/core/types/agreement-status.enum';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { ConflictError, ValidationError } from 'src/shared/domain/errors';
import { AggregateRoot } from 'src/shared/domain/aggregate-root';
import { AgreementCreatedEvent } from './events/agreement-created.event';
import { AgreementExecutedEvent } from './events/agreement-executed.event';

export class Agreement extends AggregateRoot {
  readonly id: string;
  number: string;
  type: AgreementType;
  object: string;
  amount: number;
  expiration_date: Date;
  signature_date: Date;
  createdAt: Date;
  execution_start_date?: Date;
  execution_end_date?: Date;
  observation?: string;
  url: string;
  // Reference other aggregates by ID only — DDD rule
  departementId: string;
  directionId: string;
  vendorId: string;

  private constructor(props: {
    id: string;
    number: string;
    type?: AgreementType;
    object: string;
    amount: number;
    expiration_date: Date;
    signature_date: Date;
    createdAt?: Date;
    execution_start_date?: Date;
    execution_end_date?: Date;
    observation?: string;
    url: string;
    departementId: string;
    directionId: string;
    vendorId: string;
  }) {
    super();
    this.id = props.id;
    this.number = props.number;
    this.type = props.type ?? AgreementType.CONTRACT;
    this.object = props.object;
    this.amount = props.amount;
    this.expiration_date = props.expiration_date;
    this.signature_date = props.signature_date;
    this.createdAt = props.createdAt ?? new Date();
    this.execution_start_date = props.execution_start_date;
    this.execution_end_date = props.execution_end_date;
    this.observation = props.observation;
    this.url = props.url;
    this.departementId = props.departementId;
    this.directionId = props.directionId;
    this.vendorId = props.vendorId;
  }

  /** Derived from date fields — no stored state needed. */
  get status(): AgreementStatus {
    if (!this.execution_start_date || !this.execution_end_date) {
      return AgreementStatus.NOT_EXECUTED;
    }
    const isDelayed =
      new Date(this.execution_start_date) >= new Date(this.expiration_date);
    const isEnded = new Date() >= new Date(this.execution_end_date);
    if (isEnded) {
      return isDelayed
        ? AgreementStatus.EXECUTED_WITH_DELAY
        : AgreementStatus.EXECUTED;
    }
    return isDelayed
      ? AgreementStatus.IN_EXECUTION_WITH_DELAY
      : AgreementStatus.IN_EXECUTION;
  }

  static create(props: {
    id: string;
    number: string;
    type?: AgreementType;
    object: string;
    amount: number;
    expiration_date: Date;
    signature_date: Date;
    createdAt?: Date;
    execution_start_date?: Date;
    execution_end_date?: Date;
    observation?: string;
    url: string;
    departementId: string;
    directionId: string;
    vendorId: string;
  }): Agreement {
    const instance = new Agreement(props);
    instance.addEvent(
      new AgreementCreatedEvent(
        instance.id,
        instance.type,
        instance.departementId,
        instance.directionId,
        instance.vendorId,
      ),
    );
    return instance;
  }

  /** Reconstitutes an existing agreement from persistence — no events emitted. */
  static reconstitute(props: {
    id: string;
    number: string;
    type?: AgreementType;
    object: string;
    amount: number;
    expiration_date: Date;
    signature_date: Date;
    createdAt?: Date;
    execution_start_date?: Date;
    execution_end_date?: Date;
    observation?: string;
    url: string;
    departementId: string;
    directionId: string;
    vendorId: string;
  }): Agreement {
    return new Agreement(props);
  }

  /** Validates execution dates and sets execution fields. */
  execute(startDate: Date, endDate: Date, observation: string): void {
    if (this.status !== AgreementStatus.NOT_EXECUTED) {
      throw new ConflictError('agreement is already executed');
    }
    if (new Date(startDate) >= new Date(endDate)) {
      throw new ValidationError("l'intervalle d'execution est non valide");
    }
    if (new Date(startDate) < new Date(this.signature_date)) {
      throw new ValidationError(
        "la date de debut d'execution dout etre supperieur ou rgale a la date de signature",
      );
    }

    this.execution_start_date = startDate;
    this.execution_end_date = endDate;
    this.observation = observation;

    this.addEvent(
      new AgreementExecutedEvent(
        this.id,
        this.type,
        this.departementId,
        this.directionId,
      ),
    );
  }
}
