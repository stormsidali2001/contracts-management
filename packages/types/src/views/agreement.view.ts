import { AgreementStatus } from '../enums/agreement-status.enum';
import { AgreementType } from '../enums/agreement-type.enum';

export interface AgreementView {
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
  direction?: { id: string; abriviation: string } | null;
  departement?: { id: string; abriviation: string } | null;
  vendor?: { id: string; company_name: string } | null;
}
