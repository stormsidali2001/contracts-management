import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEvent, AuditEventRepository } from '@contracts/domain';
import { EventEntity } from 'src/core/entities/Event.entity';
import { Entity } from 'src/core/types/entity.enum';
import { UserEntity } from 'src/core/entities/User.entity';
import { UserRole } from 'src/core/types/UserRole.enum';
import { AuditEventMapper } from './audit-event.mapper';

@Injectable()
export class TypeOrmAuditEventRepository implements AuditEventRepository {
  constructor(
    @InjectRepository(EventEntity)
    private readonly repo: Repository<EventEntity>,
  ) {}

  async save(event: AuditEvent): Promise<void> {
    await this.repo.save(AuditEventMapper.toPersistence(event));
  }

  async findByEntityId(entityId: string): Promise<AuditEvent[]> {
    const entities = await this.repo.find({ where: { entityId } });
    return entities.map(AuditEventMapper.toDomain);
  }

  async getEvents(limit: number, user: UserEntity): Promise<EventEntity[]> {
    let query = this.repo
      .createQueryBuilder('e')
      .limit(limit)
      .orderBy('e.createdAt', 'DESC');

    if (user.role === UserRole.EMPLOYEE) {
      query = query
        .where(
          '(e.departementId = :departementId or e.departementId IS NULL)',
          { departementId: user.departementId },
        )
        .andWhere('(e.directionId = :directionId or e.directionId IS NULL)', {
          directionId: user.directionId,
        });
    }
    if (user.role === UserRole.JURIDICAL || user.role === UserRole.EMPLOYEE) {
      query = query.andWhere('e.entity in (:...entities)', {
        entities: [Entity.CONTRACT, Entity.CONVENSION, Entity.VENDOR],
      });
    }

    return query.getMany();
  }
}
