import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuditEvent, EntityTypeEnum, OperationTypeEnum } from '@contracts/domain';
import { CreateEventDTO } from 'src/core/entities/event.dto';
import { UserEntity } from 'src/core/entities/User.entity';
import { TypeOrmAuditEventRepository } from 'src/audit/typeorm-audit-event.repository';

@Injectable()
export class EventService {
  constructor(
    @Inject('IAuditEventRepository')
    private readonly auditEventRepository: TypeOrmAuditEventRepository,
  ) {}

  async addEvent({
    entity,
    entityId,
    operation,
    departementId = null,
    directionId = null,
    departementAbriviation,
    directionAbriviation,
  }: CreateEventDTO) {
    Logger.debug(
      'yooooooooow' + directionAbriviation + ' ' + departementAbriviation,
    );

    const auditEvent = AuditEvent.record(
      entity as unknown as EntityTypeEnum,
      operation as unknown as OperationTypeEnum,
      entityId,
      directionId && departementId
        ? { directionId, departementId, directionAbriviation, departementAbriviation }
        : undefined,
    );

    await this.auditEventRepository.save(auditEvent);
  }

  async getEvents(limit: number, user: UserEntity) {
    return this.auditEventRepository.getEvents(limit, user);
  }
}
