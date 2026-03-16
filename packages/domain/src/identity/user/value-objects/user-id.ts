import { Uuid } from '../../../shared/value-objects/uuid';

export class UserId extends Uuid {
  constructor(value: string) {
    super(value);
  }
}
