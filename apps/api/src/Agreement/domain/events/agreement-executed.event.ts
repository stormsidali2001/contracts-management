import { AgreementType } from 'src/core/types/agreement-type.enum';

export class AgreementExecutedEvent {
  constructor(
    public readonly agreementId: string,
    public readonly type: AgreementType,
    public readonly departementId: string,
    public readonly directionId: string,
  ) {}
}
