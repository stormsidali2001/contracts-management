import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  CreateDirectionDTO,
  updateDirectionDTO,
} from 'src/core/dtos/direction.dto';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import {
  DataSource,
  EntityManager,
  Repository,
  UpdateResult,
} from 'typeorm';

@Injectable()
export class DirectionRepository {
  constructor(
    @InjectRepository(DirectionEntity)
    private readonly repo: Repository<DirectionEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findOneByTitleOrAbriviation(
    title: string,
    abriviation: string,
  ): Promise<DirectionEntity | null> {
    return this.repo
      .createQueryBuilder('d')
      .where('d.title = :title or d.abriviation = :abriviation', {
        title,
        abriviation,
      })
      .getOne();
  }

  async createWithDepartements(
    directionData: Omit<CreateDirectionDTO, 'departements'>,
    departements: CreateDirectionDTO['departements'],
  ): Promise<{ direction: DirectionEntity; departements: DepartementEntity[] }> {
    return this.dataSource.manager.transaction(
      async (entityManager: EntityManager) => {
        const directionRepo = entityManager.getRepository(DirectionEntity);
        const departementRepo = entityManager.getRepository(DepartementEntity);

        const newDirection = await directionRepo.save({ ...directionData });
        const savedDepartements = await departementRepo.save(
          departements.map((dp) =>
            departementRepo.create({ ...dp, direction: newDirection }),
          ),
        );
        return { direction: newDirection, departements: savedDepartements };
      },
    );
  }

  async findAll(offset: number, limit: number): Promise<DirectionEntity[]> {
    let q = this.repo
      .createQueryBuilder('direction')
      .leftJoinAndSelect('direction.departements', 'departements')
      .loadRelationCountAndMap('departements.users', 'departements.employees');

    if (Number.isInteger(offset) && Number.isInteger(limit)) {
      q = q.skip(offset).take(limit);
    }
    return q.getMany();
  }

  async findDirectionWithDepartement(
    directionId: string,
    departementId: string,
  ): Promise<DirectionEntity | null> {
    return this.repo
      .createQueryBuilder('dr')
      .where('dr.id = :directionId', { directionId })
      .leftJoinAndSelect('dr.departements', 'dp')
      .andWhere('dp.id = :departementId', { departementId })
      .getOne();
  }

  async findById(id: string): Promise<DirectionEntity | null> {
    return this.repo.findOneBy({ id });
  }

  async findByIdWithDepartementsAndUserCounts(
    id: string,
  ): Promise<DirectionEntity | null> {
    return this.repo
      .createQueryBuilder('direction')
      .where('direction.id = :id', { id })
      .leftJoinAndSelect('direction.departements', 'departements')
      .loadRelationCountAndMap('departements.users', 'departements.employees')
      .getOne();
  }

  async deleteDepartementsByIds(ids: string[]): Promise<void> {
    await this.dataSource.manager
      .getRepository(DepartementEntity)
      .createQueryBuilder()
      .delete()
      .where('departements.id in (:...ids)', { ids })
      .execute();
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async update(
    id: string,
    direction: updateDirectionDTO,
  ): Promise<UpdateResult> {
    return this.repo.update(id, direction);
  }

  async getTopDirection(): Promise<DirectionEntity[]> {
    return this.repo
      .createQueryBuilder('dr')
      .loadRelationCountAndMap('dr.agreementCount', 'dr.agreements')
      .getMany();
  }
}
