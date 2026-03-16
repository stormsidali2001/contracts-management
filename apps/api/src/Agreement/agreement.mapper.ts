import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import {
  Agreement,
  AgreementId,
  AgreementNumber,
  AgreementType,
  AgreementTypeEnum,
  AgreementStatus,
  AgreementStatusEnum,
  ContractPeriod,
  ExecutionPeriod,
  MoneyAmount,
  DocumentUrl,
  Observation,
  CreatedAt,
} from '@contracts/domain';

export class AgreementMapper {
  static toDomain(entity: AgreementEntity): Agreement {
    const executionPeriod =
      entity.execution_start_date && entity.execution_end_date
        ? new ExecutionPeriod({
            startDate: new Date(entity.execution_start_date),
            endDate: new Date(entity.execution_end_date),
          })
        : null;

    return Agreement.reconstitute({
      id: new AgreementId(entity.id),
      number: new AgreementNumber(entity.number),
      type: new AgreementType(entity.type as unknown as AgreementTypeEnum),
      object: entity.object,
      amount: new MoneyAmount(entity.amount),
      contractPeriod: new ContractPeriod({
        signatureDate: new Date(entity.signature_date),
        expirationDate: new Date(entity.expiration_date),
      }),
      executionPeriod,
      status: new AgreementStatus(entity.status as unknown as AgreementStatusEnum),
      documentUrl: new DocumentUrl(entity.url),
      observation: new Observation(entity.observation),
      vendorId: (entity.vendor as any)?.id ?? (entity as any).vendorId,
      directionId: entity.directionId,
      departementId: entity.departementId,
      createdAt: new CreatedAt(entity.createdAt),
      executionJob: null, // loaded separately if needed
    });
  }

  static toPersistence(domain: Agreement): Partial<AgreementEntity> {
    return {
      id: domain.getId().value,
      number: domain.number.value,
      type: domain.type.value as unknown as AgreementEntity['type'],
      object: domain.object,
      amount: domain.amount.value,
      signature_date: domain.contractPeriod.signatureDate,
      expiration_date: domain.contractPeriod.expirationDate,
      execution_start_date: domain.executionPeriod?.startDate ?? undefined,
      execution_end_date: domain.executionPeriod?.endDate ?? undefined,
      status: domain.status.value as unknown as AgreementEntity['status'],
      url: domain.documentUrl.value,
      observation: domain.observation.value ?? undefined,
      directionId: domain.directionId,
      departementId: domain.departementId,
      vendor: { id: domain.vendorId } as any,
    };
  }
}
