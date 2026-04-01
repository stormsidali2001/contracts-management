import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEventDTO } from 'src/core/entities/event.dto';
import { EventEntity } from 'src/core/entities/Event.entity';
import { Entity } from 'src/core/types/entity.enum';
import { UserRole } from 'src/core/types/UserRole.enum';
import { Repository } from 'typeorm';

@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(EventEntity)
    private readonly repo: Repository<EventEntity>,
  ) {}

  async save({
    entity,
    entityId,
    operation,
    departementId = null,
    directionId = null,
    departementAbriviation,
    directionAbriviation,
  }: CreateEventDTO): Promise<void> {
    if (directionId && departementId) {
      await this.repo.save({
        entity,
        entityId,
        operation,
        departementId,
        directionId,
        departementAbriviation,
        directionAbriviation,
      });
      return;
    }
    await this.repo.save({ entity, entityId, operation });
  }

  findPaginated(
    limit: number,
    role: UserRole,
    departementId?: string | null,
    directionId?: string | null,
  ): Promise<EventEntity[]> {
    let query = this.repo
      .createQueryBuilder('e')
      .limit(limit)
      .orderBy('e.createdAt', 'DESC');

    if (role === UserRole.EMPLOYEE) {
      query = query
        .where(
          '(e.departementId = :departementId or e.departementId IS NULL)',
          { departementId },
        )
        .andWhere('(e.directionId = :directionId or e.directionId IS NULL)', {
          directionId,
        });
    }

    if (role === UserRole.JURIDICAL || role === UserRole.EMPLOYEE) {
      query = query.andWhere('e.entity in (:...entities)', {
        entities: [Entity.CONTRACT, Entity.CONVENSION, Entity.VENDOR],
      });
    }

    return query.getMany();
  }
}
