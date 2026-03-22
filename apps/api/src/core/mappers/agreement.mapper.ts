import { AgreementView } from '@contracts/types';
import { Agreement } from 'src/Agreement/domain/agreement.aggregate';
import { AgreementDetail } from 'src/Agreement/domain/agreement.repository';

export class AgreementMapper {
  static from(source: Agreement | AgreementDetail): AgreementView {
    const detail = source as AgreementDetail;
    return {
      id: source.id,
      number: source.number,
      type: source.type,
      object: source.object,
      amount: source.amount,
      expiration_date: source.expiration_date,
      signature_date: source.signature_date,
      createdAt: source.createdAt,
      execution_start_date: source.execution_start_date,
      execution_end_date: source.execution_end_date,
      observation: source.observation,
      status: source.status,
      url: source.url,
      departementId: source.departementId,
      directionId: source.directionId,
      vendor: detail.vendor,
      direction: detail.direction,
      departement: detail.departement,
    };
  }

  static fromMany(sources: (Agreement | AgreementDetail)[]): AgreementView[] {
    return sources.map(AgreementMapper.from);
  }
}
