import { Uuid } from '../../../shared/value-objects/uuid';

export class DepartementId extends Uuid {
  constructor(value: string) {
    super(value);
  }
}
