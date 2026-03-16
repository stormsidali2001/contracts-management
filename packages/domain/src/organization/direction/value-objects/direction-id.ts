import { Uuid } from '../../../shared/value-objects/uuid';

export class DirectionId extends Uuid {
  constructor(value: string) {
    super(value);
  }
}
