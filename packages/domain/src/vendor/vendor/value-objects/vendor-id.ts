import { Uuid } from '../../../shared/value-objects/uuid';

export class VendorId extends Uuid {
  constructor(value: string) {
    super(value);
  }
}
