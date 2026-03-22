import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  CreateDepartementDTO,
  UpdateDepartementDTO,
} from 'src/core/dtos/departement.dto';
import { Departement } from '../domain/departement';
import {
  DIRECTION_REPOSITORY,
  IDirectionRepository,
} from '../domain/direction.repository';
import { NotFoundError } from 'src/shared/domain/errors';

@Injectable()
export class DepartementService {
  constructor(
    @Inject(DIRECTION_REPOSITORY)
    private readonly directionRepository: IDirectionRepository,
  ) {}

  async createDepartement(dto: CreateDepartementDTO): Promise<Departement> {
    const direction = await this.directionRepository.findById(dto.directionId);
    if (!direction)
      throw new NotFoundError('une erreur lors de la creation de departement');

    const newId = uuid();
    direction.addDepartement(newId, dto.title, dto.abriviation);
    await this.directionRepository.save(direction);
    return direction.getDepartement(newId)!;
  }

  async updateDepartement(
    id: string,
    dto: UpdateDepartementDTO,
  ): Promise<Departement> {
    const direction = await this.directionRepository.findByDepartementId(id);
    if (!direction)
      throw new NotFoundError("le departement n'existe pas.");

    direction.updateDepartement(id, dto.title, dto.abriviation);
    await this.directionRepository.save(direction);
    return direction.getDepartement(id)!;
  }

  async deleteDepartement(id: string): Promise<string> {
    const direction = await this.directionRepository.findByDepartementId(id);
    if (!direction)
      throw new NotFoundError("le departement n'existe pas.");

    direction.removeDepartement(id);
    await this.directionRepository.save(direction);
    return 'done';
  }

  async findById(id: string): Promise<Departement | null> {
    return this.directionRepository.findDepartementById(id);
  }

  async findAll(offset = 0, limit = 10): Promise<Departement[]> {
    return this.directionRepository.findAllDepartements(offset, limit);
  }
}
