import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateDirectionDTO,
  updateDirectionDTO,
} from 'src/core/dtos/direction.dto';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { DepartementView } from 'src/core/views/departement.view';
import { DirectionView } from 'src/core/views/direction.view';
import { UpdateResult } from 'typeorm';
import { DirectionRepository } from '../direction.repository';

@Injectable()
export class DirectionService {
  constructor(private readonly directionRepository: DirectionRepository) {}

  async createDirection(
    direction: CreateDirectionDTO,
  ): Promise<{ direction: DirectionView; departements: DepartementView[] }> {
    const { departements, ...otherDirectionData } = direction;

    const existing = await this.directionRepository.findOneByTitleOrAbriviation(
      otherDirectionData.title,
      otherDirectionData.abriviation,
    );
    if (existing)
      throw new BadRequestException(
        "l'abriviation ou le nom de la direction exist deja",
      );

    const result = await this.directionRepository.createWithDepartements(
      otherDirectionData,
      departements,
    );
    return {
      direction: DirectionView.from(result.direction),
      departements: result.departements.map((d) => DepartementView.from(d)),
    };
  }

  async findAll(offset: number, limit: number): Promise<DirectionView[]> {
    console.log(offset, limit, 'limit offset');
    console.log('.........', offset, limit, typeof offset, typeof limit);
    const entities = await this.directionRepository.findAll(offset, limit);
    return DirectionView.fromMany(entities);
  }

  // Internal use only — callers need the entity to persist relations
  async findDirectionWithDepartement(
    directionId: string,
    departementId: string,
  ): Promise<DirectionEntity | null> {
    return this.directionRepository.findDirectionWithDepartement(
      directionId,
      departementId,
    );
  }

  async find(id: string): Promise<DirectionView | null> {
    const entity = await this.directionRepository.findById(id);
    return entity ? DirectionView.from(entity) : null;
  }

  async deleteDirection(id: string): Promise<string> {
    const direction =
      await this.directionRepository.findByIdWithDepartementsAndUserCounts(id);

    if (!direction) throw new BadRequestException('la direction éxiste pas');

    // @ts-ignore — users count is loaded via loadRelationCountAndMap
    if (direction.departements.some((d) => d.users > 0))
      throw new BadRequestException(
        "l'un des departement de la direction contient des utilisateurs",
      );

    if (direction.departements.length > 0) {
      await this.directionRepository.deleteDepartementsByIds(
        direction.departements.map((dp) => dp.id),
      );
    }

    await this.directionRepository.deleteById(id);
    return 'done';
  }

  async updateDirection(
    id: string,
    direction: updateDirectionDTO,
  ): Promise<UpdateResult> {
    return this.directionRepository.update(id, direction);
  }

  async getTopDirection(): Promise<DirectionView[]> {
    const entities = await this.directionRepository.getTopDirection();
    return DirectionView.fromMany(entities);
  }
}
