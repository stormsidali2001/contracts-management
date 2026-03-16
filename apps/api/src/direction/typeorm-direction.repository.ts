import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository, UpdateResult } from 'typeorm';
import { Direction, DirectionRepository } from '@contracts/domain';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { DirectionMapper } from './direction.mapper';

@Injectable()
export class TypeOrmDirectionRepository implements DirectionRepository {
  constructor(
    @InjectRepository(DirectionEntity)
    private readonly repo: Repository<DirectionEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // ── Domain-repository interface ───────────────────────────────────────

  async findById(id: string): Promise<Direction | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['departements'],
    });
    return entity ? DirectionMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Direction[]> {
    const entities = await this.repo.find({ relations: ['departements'] });
    return entities.map(DirectionMapper.toDomain);
  }

  async save(direction: Direction): Promise<void> {
    await this.repo.save(DirectionMapper.toPersistence(direction));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // ── Service-level query methods ───────────────────────────────────────

  async findOneBy(id: string): Promise<DirectionEntity | null> {
    return this.repo.findOneBy({ id });
  }

  async updateDirection(id: string, direction: Partial<DirectionEntity>): Promise<UpdateResult> {
    return this.repo.update(id, direction);
  }

  async findAllWithDepartements(
    offset: number,
    limit: number,
  ): Promise<DirectionEntity[]> {
    let q = this.repo
      .createQueryBuilder('direction')
      .leftJoinAndSelect('direction.departements', 'departements')
      .loadRelationCountAndMap('departements.users', 'departements.employees');

    if (Number.isInteger(offset) && Number.isInteger(limit)) {
      q = q.skip(offset).take(limit);
    }
    return q.getMany();
  }

  async findWithDepartement(
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

  async findByTitleOrAbriviation(
    title: string,
    abriviation: string,
    manager: EntityManager,
  ): Promise<DirectionEntity | null> {
    return manager
      .getRepository(DirectionEntity)
      .createQueryBuilder('d')
      .where('d.title = :title or d.abriviation = :abriviation', { title, abriviation })
      .getOne();
  }

  async createDirectionWithDepartements(
    directionData: Partial<DirectionEntity>,
    departements: Partial<DepartementEntity>[],
  ): Promise<{ direction: DirectionEntity; departements: DepartementEntity[] }> {
    return this.dataSource.manager.transaction(async (entityManager: EntityManager) => {
      const directionRepository = entityManager.getRepository(DirectionEntity);
      const departementRepository = entityManager.getRepository(DepartementEntity);

      const directionDb = await directionRepository
        .createQueryBuilder('d')
        .where('d.title = :title or d.abriviation = :abriviation', {
          title: directionData.title,
          abriviation: directionData.abriviation,
        })
        .getOne();

      if (directionDb) {
        throw new Error("l'abriviation ou le nom de la direction exist deja");
      }

      const newDirection = await directionRepository.save(directionData as DirectionEntity);

      const savedDepartements = await departementRepository.save(
        departements.map((dp) => {
          return departementRepository.create({
            ...dp,
            direction: newDirection,
          });
        }),
      );

      return { direction: newDirection, departements: savedDepartements };
    });
  }

  async deleteDirectionWithDepartements(id: string): Promise<string> {
    return this.dataSource.manager.transaction(async (entityManager: EntityManager) => {
      const directionRepository = entityManager.getRepository(DirectionEntity);
      const departementRepository = entityManager.getRepository(DepartementEntity);

      const direction = await directionRepository
        .createQueryBuilder('direction')
        .where('direction.id = :id', { id })
        .leftJoinAndSelect('direction.departements', 'departements')
        .loadRelationCountAndMap('departements.users', 'departements.employees')
        .getOne();

      if (!direction) {
        throw new Error('la direction éxiste pas');
      }
      //@ts-ignore
      if (direction.departements.some((d) => d.users > 0)) {
        throw new Error(
          "l'un des departement de la direction contient des utilisateurs",
        );
      }

      if (direction.departements.length > 0) {
        await departementRepository
          .createQueryBuilder()
          .delete()
          .where('departements.id in (:...ids)', {
            ids: direction.departements.map((dp) => dp.id),
          })
          .execute();
      }

      await directionRepository.delete(id);
      return 'done';
    });
  }

  async getTopDirections(): Promise<DirectionEntity[]> {
    return this.repo
      .createQueryBuilder('dr')
      .loadRelationCountAndMap('dr.agreementCount', 'dr.agreements')
      .getMany();
  }
}
