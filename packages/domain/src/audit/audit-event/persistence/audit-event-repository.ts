import { AuditEvent } from '../audit-event';

export interface AuditEventRepository {
  findByEntityId(entityId: string): Promise<AuditEvent[]>;
  save(event: AuditEvent): Promise<void>;
  // No findById / delete — audit log is append-only
}
