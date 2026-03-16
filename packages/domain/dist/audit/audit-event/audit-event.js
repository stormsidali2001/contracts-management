"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditEvent = void 0;
const aggregate_root_1 = require("../../shared/aggregate-root");
const entity_type_1 = require("./value-objects/entity-type");
const operation_type_1 = require("./value-objects/operation-type");
const organization_context_1 = require("./value-objects/organization-context");
class AuditEvent extends aggregate_root_1.AggregateRoot {
    constructor(props) {
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
    static record(entityType, operation, entityId, context) {
        return new AuditEvent({
            id: null, // assigned by DB on insert
            entity: new entity_type_1.EntityType(entityType),
            entityId,
            operation: new operation_type_1.OperationType(operation),
            organizationContext: new organization_context_1.OrganizationContext(context),
            directionId: context?.directionId ?? null,
            departementId: context?.departementId ?? null,
            createdAt: new Date(),
        });
    }
    static reconstitute(props) {
        return new AuditEvent(props);
    }
}
exports.AuditEvent = AuditEvent;
//# sourceMappingURL=audit-event.js.map