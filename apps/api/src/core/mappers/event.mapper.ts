import { EventView } from '@contracts/types';
import { EventEntity } from 'src/core/entities/Event.entity';

export class EventMapper {
  static from(entity: EventEntity): EventView {
    return {
      id: entity.id,
      entity: entity.entity,
      createdAt: entity.createdAt,
      operation: entity.operation,
      entityId: entity.entityId,
      departementId: entity.departementId,
      directionId: entity.directionId,
      departementAbriviation: entity.departementAbriviation,
      directionAbriviation: entity.directionAbriviation,
    };
  }

  static fromMany(entities: EventEntity[]): EventView[] {
    return entities.map(EventMapper.from);
  }
}
