import { Entity, Operation } from '@contracts/types';

export interface UserEvent {
  entityId: string;
  entity: Entity;
  operation: Operation;
  createdAt: Date;
  departementId: string;
  directionId: string;
  departementAbriviation: string;
  directionAbriviation: string;
}
