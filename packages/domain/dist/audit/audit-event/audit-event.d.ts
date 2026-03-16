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
export declare class AuditEvent extends AggregateRoot<number | null> {
    /** Maps to `entity` column in DB */
    readonly entity: EntityType;
    readonly entityId: string;
    readonly operation: OperationType;
    readonly organizationContext: OrganizationContext;
    readonly directionId: string | null;
    readonly departementId: string | null;
    readonly createdAt: Date;
    private constructor();
    /** Factory — the only way to create an audit event (immutable after creation) */
    static record(entityType: EntityTypeEnum, operation: OperationTypeEnum, entityId: string, context?: OrganizationContextProps & {
        directionId?: string | null;
        departementId?: string | null;
    }): AuditEvent;
    static reconstitute(props: AuditEventProps): AuditEvent;
}
//# sourceMappingURL=audit-event.d.ts.map