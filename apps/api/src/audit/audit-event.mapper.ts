import { EventEntity } from 'src/core/entities/Event.entity';
import {
  AuditEvent,
  EntityType,
  EntityTypeEnum,
  OperationType,
  OperationTypeEnum,
  OrganizationContext,
} from '@contracts/domain';

export class AuditEventMapper {
  static toDomain(entity: EventEntity): AuditEvent {
    return AuditEvent.reconstitute({
      id: entity.id as unknown as number,
      entity: new EntityType(entity.entity as unknown as EntityTypeEnum),
      entityId: entity.entityId,
      operation: new OperationType(entity.operation as unknown as OperationTypeEnum),
      organizationContext: new OrganizationContext({
        departementAbriviation: entity.departementAbriviation ?? null,
        directionAbriviation: entity.directionAbriviation ?? null,
      }),
      directionId: entity.directionId ?? null,
      departementId: entity.departementId ?? null,
      createdAt: entity.createdAt,
    });
  }

  static toPersistence(domain: AuditEvent): Partial<EventEntity> {
    return {
      entity: domain.entity.value as unknown as EventEntity['entity'],
      entityId: domain.entityId,
      operation: domain.operation.value as unknown as EventEntity['operation'],
      directionId: domain.directionId ?? undefined,
      departementId: domain.departementId ?? undefined,
      departementAbriviation: domain.organizationContext.departementAbriviation ?? undefined,
      directionAbriviation: domain.organizationContext.directionAbriviation ?? undefined,
    };
  }
}
