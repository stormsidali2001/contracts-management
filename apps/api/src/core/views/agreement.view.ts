import { AgreementStatus } from '../types/agreement-status.enum';
import { AgreementType } from '../types/agreement-type.enum';
import { Agreement } from 'src/Agreement/domain/agreement';
import { AgreementDetail } from 'src/Agreement/domain/agreement.repository';
import { stripPrivateKeys } from './strip-private-keys.util';

type AgreementLike = Agreement | AgreementDetail;

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

  static from(source: AgreementLike): AgreementView {
    return Object.assign(new AgreementView(), stripPrivateKeys(source));
  }

  static fromMany(sources: AgreementLike[]): AgreementView[] {
    return sources.map(AgreementView.from);
  }
}
