import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Direction } from '@contracts/domain';
import {
  CreateDirectionDTO,
  updateDirectionDTO,
} from 'src/core/dtos/direction.dto';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { UpdateResult } from 'typeorm';
import { TypeOrmDirectionRepository } from '../typeorm-direction.repository';

@Injectable()
export class DirectionService {
  constructor(
    @Inject('IDirectionRepository')
    private readonly directionRepo: TypeOrmDirectionRepository,
  ) {}

  async createDirection(dto: CreateDirectionDTO) {
    const { departements, ...otherDirectionData } = dto;

    // Validate domain invariants early (throws if title/abriviation invalid)
    const dirId = uuidv4();
    Direction.create({
      id: dirId,
      title: otherDirectionData.title,
      abriviation: otherDirectionData.abriviation,
      departements: (departements ?? []).map((d) => ({
        id: uuidv4(),
        title: d.title,
        abriviation: d.abriviation,
        directionId: dirId,
      })),
    });

    try {
      return await this.directionRepo.createDirectionWithDepartements(
        { ...otherDirectionData },
        dto.departements ?? [],
      );
    } catch (err) {
      if (err instanceof Error && err.message.includes("l'abriviation")) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async findAll(offset: number, limit: number): Promise<DirectionEntity[]> {
    console.log(offset, limit, 'limit offset');
    console.log('.........', offset, limit, typeof offset, typeof limit);
    return this.directionRepo.findAllWithDepartements(offset, limit);
  }

  async findDirectionWithDepartement(
    directionId: string,
    departementId: string,
  ) {
    return this.directionRepo.findWithDepartement(directionId, departementId);
  }

  async find(id: string): Promise<DirectionEntity> {
    return this.directionRepo.findOneBy(id);
  }

  async deleteDirection(id: string): Promise<string> {
    try {
      return await this.directionRepo.deleteDirectionWithDepartements(id);
    } catch (err) {
      if (err instanceof Error) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async updateDirection(
    id: string,
    direction: updateDirectionDTO,
  ): Promise<UpdateResult> {
    return this.directionRepo.updateDirection(id, direction);
  }

  async getTopDirection() {
    return this.directionRepo.getTopDirections();
  }
}
