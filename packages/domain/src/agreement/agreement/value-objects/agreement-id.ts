import { Uuid } from '../../../shared/value-objects/uuid';

export class AgreementId extends Uuid {
  constructor(value: string) {
    super(value);
  }
}
