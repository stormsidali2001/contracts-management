import { Inject, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';
import {
  CreateDirectionDTO,
  updateDirectionDTO,
} from 'src/core/dtos/direction.dto';
import { Direction } from '../domain/direction';
import {
  DIRECTION_REPOSITORY,
  IDirectionRepository,
} from '../domain/direction.repository';
import { DirectionDeletedEvent } from '../domain/events/direction-deleted.event';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from 'src/shared/domain/errors';

@Injectable()
export class DirectionService {
  constructor(
    @Inject(DIRECTION_REPOSITORY)
    private readonly directionRepository: IDirectionRepository,
    private readonly eventBus: EventBus,
  ) {}

  async createDirection(dto: CreateDirectionDTO): Promise<Direction> {
    const existing = await this.directionRepository.findByTitleOrAbriviation(
      dto.title,
      dto.abriviation,
    );
    if (existing)
      throw new ConflictError(
        "l'abriviation ou le nom de la direction exist deja",
      );

    const direction = Direction.create({
      id: uuid(),
      title: dto.title,
      abriviation: dto.abriviation,
    });
    for (const dp of dto.departements) {
      direction.addDepartement(uuid(), dp.title, dp.abriviation);
    }
    const saved = await this.directionRepository.save(direction);
    this.eventBus.publishAll(direction.pullEvents());
    return saved;
  }

  async findAll(offset: number, limit: number): Promise<Direction[]> {
    return this.directionRepository.findAll(offset, limit);
  }

  async find(id: string): Promise<Direction | null> {
    return this.directionRepository.findById(id);
  }

  async deleteDirection(id: string): Promise<string> {
    const direction = await this.directionRepository.findById(id);
    if (!direction) throw new NotFoundError('la direction éxiste pas');
    if (!direction.canBeDeleted())
      throw new ForbiddenError(
        "l'un des departement de la direction contient des utilisateurs",
      );
    await this.directionRepository.delete(id);
    this.eventBus.publish(new DirectionDeletedEvent(id));
    return 'done';
  }

  async updateDirection(
    id: string,
    dto: updateDirectionDTO,
  ): Promise<Direction> {
    const direction = await this.directionRepository.findById(id);
    if (!direction) throw new NotFoundError('la direction éxiste pas');
    direction.rename(dto.title, direction.abriviation);
    const saved = await this.directionRepository.save(direction);
    this.eventBus.publishAll(direction.pullEvents());
    return saved;
  }

  async getTopDirection(): Promise<Direction[]> {
    return this.directionRepository.getTopDirections();
  }
}
