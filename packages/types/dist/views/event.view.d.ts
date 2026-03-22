import { Entity } from '../enums/entity.enum';
import { Operation } from '../enums/operation.enum';
export interface EventView {
    id: string;
    entity: Entity;
    createdAt: Date;
    operation: Operation;
    entityId: string;
    departementId: string;
    directionId: string;
    departementAbriviation: string;
    directionAbriviation: string;
}
//# sourceMappingURL=event.view.d.ts.map