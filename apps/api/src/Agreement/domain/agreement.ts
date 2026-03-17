import { AgreementStatus } from 'src/core/types/agreement-status.enum';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { BadRequestException } from '@nestjs/common';

export class Agreement {
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
  status: AgreementStatus;
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
    status?: AgreementStatus;
    url: string;
    departementId: string;
    directionId: string;
    vendorId: string;
  }) {
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
    this.status = props.status ?? AgreementStatus.NOT_EXECUTED;
    this.url = props.url;
    this.departementId = props.departementId;
    this.directionId = props.directionId;
    this.vendorId = props.vendorId;
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
    status?: AgreementStatus;
    url: string;
    departementId: string;
    directionId: string;
    vendorId: string;
  }): Agreement {
    return new Agreement(props);
  }

  /**
   * Validates execution dates and sets execution fields + status.
   * Returns the status the cron job should apply when the execution period ends.
   */
  execute(
    startDate: Date,
    endDate: Date,
    observation: string,
  ): { cronStatus: AgreementStatus } {
    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException("l'intervalle d'execution est non valide");
    }
    if (new Date(startDate) < new Date(this.signature_date)) {
      throw new BadRequestException(
        "la date de debut d'execution dout etre supperieur ou rgale a la date de signature",
      );
    }

    this.execution_start_date = startDate;
    this.execution_end_date = endDate;
    this.observation = observation;

    const isDelayed = new Date(startDate) >= new Date(this.expiration_date);
    this.status = isDelayed
      ? AgreementStatus.IN_EXECUTION_WITH_DELAY
      : AgreementStatus.IN_EXECUTION;

    return {
      cronStatus: isDelayed
        ? AgreementStatus.EXECUTED_WITH_DELAY
        : AgreementStatus.EXECUTED,
    };
  }
}
