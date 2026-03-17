import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  CreateDirectionDTO,
  updateDirectionDTO,
} from 'src/core/dtos/direction.dto';
import { DepartementView } from 'src/core/views/departement.view';
import { DirectionView } from 'src/core/views/direction.view';
import { Direction } from '../domain/direction';
import {
  DIRECTION_REPOSITORY,
  IDirectionRepository,
} from '../domain/direction.repository';

@Injectable()
export class DirectionService {
  constructor(
    @Inject(DIRECTION_REPOSITORY)
    private readonly directionRepository: IDirectionRepository,
  ) {}

  async createDirection(
    dto: CreateDirectionDTO,
  ): Promise<{ direction: DirectionView; departements: DepartementView[] }> {
    const existing = await this.directionRepository.findByTitleOrAbriviation(
      dto.title,
      dto.abriviation,
    );
    if (existing)
      throw new BadRequestException(
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
    return {
      direction: DirectionView.from(saved),
      departements: saved.departements.map((d) => DepartementView.from(d)),
    };
  }

  async findAll(offset: number, limit: number): Promise<DirectionView[]> {
    const directions = await this.directionRepository.findAll(offset, limit);
    return DirectionView.fromMany(directions);
  }

  async find(id: string): Promise<DirectionView | null> {
    const direction = await this.directionRepository.findById(id);
    return direction ? DirectionView.from(direction) : null;
  }

  // Internal use — callers (UserService, AgreementService) use direction.id and
  // departements[0].id for TypeORM relation assignment until those services are
  // refactored to DDD.
  async findWithDepartement(
    directionId: string,
    departementId: string,
  ): Promise<Direction | null> {
    return this.directionRepository.findWithDepartement(
      directionId,
      departementId,
    );
  }

  async deleteDirection(id: string): Promise<string> {
    const direction = await this.directionRepository.findById(id);
    if (!direction) throw new BadRequestException('la direction éxiste pas');
    if (!direction.canBeDeleted())
      throw new BadRequestException(
        "l'un des departement de la direction contient des utilisateurs",
      );
    await this.directionRepository.delete(id);
    return 'done';
  }

  async updateDirection(
    id: string,
    dto: updateDirectionDTO,
  ): Promise<DirectionView> {
    const direction = await this.directionRepository.findById(id);
    if (!direction) throw new BadRequestException('la direction éxiste pas');
    direction.rename(dto.title, direction.abriviation);
    const saved = await this.directionRepository.save(direction);
    return DirectionView.from(saved);
  }

  async getTopDirection(): Promise<DirectionView[]> {
    const directions = await this.directionRepository.getTopDirections();
    return DirectionView.fromMany(directions);
  }
}
