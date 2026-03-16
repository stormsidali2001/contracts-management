import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateDirectionDTO,
  updateDirectionDTO,
} from 'src/core/dtos/direction.dto';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { UpdateResult } from 'typeorm';
import { DirectionRepository } from '../direction.repository';

@Injectable()
export class DirectionService {
  constructor(private readonly directionRepository: DirectionRepository) {}

  async createDirection(direction: CreateDirectionDTO) {
    const { departements, ...otherDirectionData } = direction;

    const existing = await this.directionRepository.findOneByTitleOrAbriviation(
      otherDirectionData.title,
      otherDirectionData.abriviation,
    );
    if (existing)
      throw new BadRequestException(
        "l'abriviation ou le nom de la direction exist deja",
      );

    return this.directionRepository.createWithDepartements(
      otherDirectionData,
      departements,
    );
  }

  async findAll(offset: number, limit: number): Promise<DirectionEntity[]> {
    console.log(offset, limit, 'limit offset');
    console.log('.........', offset, limit, typeof offset, typeof limit);
    return this.directionRepository.findAll(offset, limit);
  }

  async findDirectionWithDepartement(
    directionId: string,
    departementId: string,
  ) {
    return this.directionRepository.findDirectionWithDepartement(
      directionId,
      departementId,
    );
  }

  async find(id: string): Promise<DirectionEntity> {
    return this.directionRepository.findById(id);
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

  async getTopDirection() {
    return this.directionRepository.getTopDirection();
  }
}
