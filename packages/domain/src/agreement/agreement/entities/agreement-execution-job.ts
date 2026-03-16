import { Entity } from '../../../shared/entity';
import { AgreementStatusEnum } from '../value-objects/agreement-status';
import { AgreementTypeEnum } from '../value-objects/agreement-type';

export interface AgreementExecutionJobProps {
  /** DB auto-increment int — null when not yet persisted */
  id: number | null;
  agreementId: string;
  agreementType: AgreementTypeEnum;
  /** Unique cron job name: "agreement:{type}:{agreementId}" */
  name: string;
  /** Scheduled run date — equals execution_end_date */
  date: Date;
  newStatus:
    | AgreementStatusEnum.EXECUTED
    | AgreementStatusEnum.EXECUTED_WITH_DELAY;
}

export class AgreementExecutionJob extends Entity<number | null> {
  readonly agreementId: string;
  /** Unique cron job name stored in DB */
  readonly name: string;
  readonly date: Date;
  readonly newStatus:
    | AgreementStatusEnum.EXECUTED
    | AgreementStatusEnum.EXECUTED_WITH_DELAY;

  private constructor(props: AgreementExecutionJobProps) {
    super(props.id);
    this.agreementId = props.agreementId;
    this.name = props.name;
    this.date = new Date(props.date.getTime());
    this.newStatus = props.newStatus;
  }

  static create(
    agreementId: string,
    agreementType: AgreementTypeEnum,
    scheduledDate: Date,
    newStatus:
      | AgreementStatusEnum.EXECUTED
      | AgreementStatusEnum.EXECUTED_WITH_DELAY,
  ): AgreementExecutionJob {
    return new AgreementExecutionJob({
      id: null, // assigned by DB on insert
      agreementId,
      agreementType,
      name: `agreement:${agreementType}:${agreementId}`,
      date: scheduledDate,
      newStatus,
    });
  }

  static reconstitute(props: AgreementExecutionJobProps): AgreementExecutionJob {
    return new AgreementExecutionJob(props);
  }
}
