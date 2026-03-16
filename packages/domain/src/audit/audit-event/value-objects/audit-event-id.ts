import { Uuid } from '../../../shared/value-objects/uuid';

export class AuditEventId extends Uuid {
  constructor(value: string) {
    super(value);
  }
}
