import { AgreementType } from 'src/core/types/agreement-type.enum';

export class AgreementCreatedEvent {
  constructor(
    public readonly agreementId: string,
    public readonly type: AgreementType,
    public readonly departementId: string,
    public readonly directionId: string,
    public readonly vendorId: string,
  ) {}
}
