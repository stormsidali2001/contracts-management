import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateDepartementDTO } from 'src/core/dtos/departement.dto';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class DepartementRepository {
  constructor(
    @InjectRepository(DepartementEntity)
    private readonly repo: Repository<DepartementEntity>,
    @InjectRepository(DirectionEntity)
    private readonly directionRepo: Repository<DirectionEntity>,
  ) {}

  async findDirectionById(id: string): Promise<DirectionEntity | null> {
    return this.directionRepo.findOneBy({ id });
  }

  async findByUniqueInDirection(
    title: string,
    abriviation: string,
    directionId: string,
  ): Promise<DepartementEntity | null> {
    return this.repo
      .createQueryBuilder('d')
      .where('d.title = :title or d.abriviation = :abriviation', {
        title,
        abriviation,
      })
      .andWhere('d.directionId = :directionId', { directionId })
      .getOne();
  }

  async create(data: Partial<DepartementEntity>): Promise<DepartementEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: UpdateDepartementDTO): Promise<UpdateResult> {
    return this.repo.update(id, data);
  }

  async findByIdWithUserCount(id: string): Promise<DepartementEntity | null> {
    return this.repo
      .createQueryBuilder('dp')
      .where('dp.id = :departementId', { departementId: id })
      .loadRelationCountAndMap('dp.users', 'dp.employees', 'users')
      .getOne();
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.repo.delete(id);
  }

  async findById(id: string): Promise<DepartementEntity | null> {
    return this.repo.findOneBy({ id });
  }

  async findAll(offset = 0, limit = 10): Promise<DepartementEntity[]> {
    return this.repo
      .createQueryBuilder('departement')
      .loadRelationCountAndMap('departement.users', 'departements.employees')
      .take(limit)
      .skip(offset)
      .getMany();
  }
}
