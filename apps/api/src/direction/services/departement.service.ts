import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateDepartementDTO,
  UpdateDepartementDTO,
} from 'src/core/dtos/departement.dto';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { DepartementRepository } from '../departement.repository';

@Injectable()
export class DepartementService {
  constructor(private readonly departementRepository: DepartementRepository) {}

  async createDepartement(
    departement: CreateDepartementDTO,
  ): Promise<DepartementEntity> {
    const { directionId, ...otherDepartementData } = departement;

    const direction = await this.departementRepository.findDirectionById(
      directionId,
    );
    if (!direction)
      throw new BadRequestException(
        'une erreur lors de la creation de departement',
      );

    const existing = await this.departementRepository.findByUniqueInDirection(
      otherDepartementData.title,
      otherDepartementData.abriviation,
      directionId,
    );
    if (existing)
      throw new BadRequestException(
        'un departement avec les memes identifiant exist deja dans cette direction',
      );

    return this.departementRepository.create({
      ...otherDepartementData,
      direction,
    });
  }

  async updateDepartement(
    id: string,
    departement: UpdateDepartementDTO,
  ): Promise<UpdateResult> {
    return this.departementRepository.update(id, departement);
  }

  async deleteDepartement(id: string): Promise<DeleteResult> {
    const departementDb =
      await this.departementRepository.findByIdWithUserCount(id);

    if (!departementDb)
      throw new BadRequestException("le departement n'existe pas.");

    // @ts-ignore — users count is loaded via loadRelationCountAndMap
    if (departementDb.users > 0)
      throw new BadRequestException(
        'vous ne pouvez pas supprimer le departement car il contient des utilisateur',
      );

    return this.departementRepository.delete(id);
  }

  async findById(id: string): Promise<DepartementEntity> {
    return this.departementRepository.findById(id);
  }

  async findAll(offset = 0, limit = 10): Promise<DepartementEntity[]> {
    return this.departementRepository.findAll(offset, limit);
  }
}
