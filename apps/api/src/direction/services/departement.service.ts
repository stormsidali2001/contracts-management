import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  CreateDepartementDTO,
  UpdateDepartementDTO,
} from 'src/core/dtos/departement.dto';
import { DepartementView } from 'src/core/views/departement.view';
import {
  DIRECTION_REPOSITORY,
  IDirectionRepository,
} from '../domain/direction.repository';

@Injectable()
export class DepartementService {
  constructor(
    @Inject(DIRECTION_REPOSITORY)
    private readonly directionRepository: IDirectionRepository,
  ) {}

  async createDepartement(dto: CreateDepartementDTO): Promise<DepartementView> {
    const direction = await this.directionRepository.findById(dto.directionId);
    if (!direction)
      throw new BadRequestException(
        'une erreur lors de la creation de departement',
      );

    const newId = uuid();
    direction.addDepartement(newId, dto.title, dto.abriviation);
    await this.directionRepository.save(direction);
    return DepartementView.from(direction.getDepartement(newId)!);
  }

  async updateDepartement(
    id: string,
    dto: UpdateDepartementDTO,
  ): Promise<DepartementView> {
    const direction = await this.directionRepository.findByDepartementId(id);
    if (!direction)
      throw new BadRequestException("le departement n'existe pas.");

    direction.updateDepartement(id, dto.title, dto.abriviation);
    await this.directionRepository.save(direction);
    return DepartementView.from(direction.getDepartement(id)!);
  }

  async deleteDepartement(id: string): Promise<string> {
    const direction = await this.directionRepository.findByDepartementId(id);
    if (!direction)
      throw new BadRequestException("le departement n'existe pas.");

    direction.removeDepartement(id);
    await this.directionRepository.save(direction);
    return 'done';
  }

  async findById(id: string): Promise<DepartementView | null> {
    const dept = await this.directionRepository.findDepartementById(id);
    return dept ? DepartementView.from(dept) : null;
  }

  async findAll(offset = 0, limit = 10): Promise<DepartementView[]> {
    const depts = await this.directionRepository.findAllDepartements(
      offset,
      limit,
    );
    return DepartementView.fromMany(depts);
  }
}
