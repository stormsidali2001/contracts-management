import { Entity } from '../types/entity.enum';
import { Operation } from '../types/operation.enum';
import { EventEntity } from '../entities/Event.entity';

export class EventView {
  id: string;
  entity: Entity;
  createdAt: Date;
  operation: Operation;
  entityId: string;
  departementId: string;
  directionId: string;
  departementAbriviation: string;
  directionAbriviation: string;

  static from(e: EventEntity): EventView {
    return Object.assign(new EventView(), e);
  }

  static fromMany(entities: EventEntity[]): EventView[] {
    return entities.map(EventView.from);
  }
}
