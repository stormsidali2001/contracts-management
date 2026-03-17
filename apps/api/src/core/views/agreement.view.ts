import { AgreementStatus } from '../types/agreement-status.enum';
import { AgreementType } from '../types/agreement-type.enum';
import { AgreementEntity } from '../entities/Agreement.entity';

export class AgreementView {
  id: string;
  number: string;
  type: AgreementType;
  object: string;
  amount: number;
  expiration_date: Date;
  signature_date: Date;
  createdAt: Date;
  execution_start_date: Date;
  execution_end_date: Date;
  observation?: string;
  status: AgreementStatus;
  url: string;
  departementId?: string;
  directionId?: string;
  direction?: any;
  departement?: any;
  vendor?: any;

  static from(entity: AgreementEntity): AgreementView {
    return Object.assign(new AgreementView(), entity);
  }

  static fromMany(entities: AgreementEntity[]): AgreementView[] {
    return entities.map(AgreementView.from);
  }
}
