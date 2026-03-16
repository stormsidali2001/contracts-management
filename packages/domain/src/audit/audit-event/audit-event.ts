import { AggregateRoot } from '../../shared/aggregate-root';
import { EntityType, EntityTypeEnum } from './value-objects/entity-type';
import { OperationType, OperationTypeEnum } from './value-objects/operation-type';
import { OrganizationContext, OrganizationContextProps } from './value-objects/organization-context';

export interface AuditEventProps {
  /** Maps to DB `@PrimaryGeneratedColumn()` int — null when not yet persisted */
  id: number | null;
  /** Maps to `entity` column in DB */
  entity: EntityType;
  /** Maps to `entityId` column in DB */
  entityId: string;
  /** Maps to `operation` column in DB */
  operation: OperationType;
  organizationContext: OrganizationContext;
  directionId: string | null;
  departementId: string | null;
  /** Maps to `createdAt` column in DB */
  createdAt: Date;
}

export class AuditEvent extends AggregateRoot<number | null> {
  /** Maps to `entity` column in DB */
  readonly entity: EntityType;
  readonly entityId: string;
  readonly operation: OperationType;
  readonly organizationContext: OrganizationContext;
  readonly directionId: string | null;
  readonly departementId: string | null;
  readonly createdAt: Date;

  private constructor(props: AuditEventProps) {
    super(props.id);
    this.entity = props.entity;
    this.entityId = props.entityId;
    this.operation = props.operation;
    this.organizationContext = props.organizationContext;
    this.directionId = props.directionId;
    this.departementId = props.departementId;
    this.createdAt = new Date(props.createdAt.getTime());
  }

  /** Factory — the only way to create an audit event (immutable after creation) */
  static record(
    entityType: EntityTypeEnum,
    operation: OperationTypeEnum,
    entityId: string,
    context?: OrganizationContextProps & {
      directionId?: string | null;
      departementId?: string | null;
    },
  ): AuditEvent {
    return new AuditEvent({
      id: null, // assigned by DB on insert
      entity: new EntityType(entityType),
      entityId,
      operation: new OperationType(operation),
      organizationContext: new OrganizationContext(context),
      directionId: context?.directionId ?? null,
      departementId: context?.departementId ?? null,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: AuditEventProps): AuditEvent {
    return new AuditEvent(props);
  }
}
