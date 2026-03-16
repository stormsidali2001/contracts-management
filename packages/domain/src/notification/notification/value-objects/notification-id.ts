import { Uuid } from '../../../shared/value-objects/uuid';

export class NotificationId extends Uuid {
  constructor(value: string) {
    super(value);
  }
}
