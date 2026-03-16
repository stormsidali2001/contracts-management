import { AuditEvent } from '../audit-event';
export interface AuditEventRepository {
    findByEntityId(entityId: string): Promise<AuditEvent[]>;
    save(event: AuditEvent): Promise<void>;
}
//# sourceMappingURL=audit-event-repository.d.ts.map