import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Departement } from '../domain/departement';
import { Direction } from '../domain/direction';
import { IDirectionRepository } from '../domain/direction.repository';

@Injectable()
export class DirectionRepository implements IDirectionRepository {
  constructor(
    @InjectRepository(DirectionEntity)
    private readonly repo: Repository<DirectionEntity>,
    @InjectRepository(DepartementEntity)
    private readonly departementRepo: Repository<DepartementEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ── Persistence ───────────────────────────────────────────────────────────

  async save(direction: Direction): Promise<Direction> {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const directionRepo = manager.getRepository(DirectionEntity);
      const departementRepo = manager.getRepository(DepartementEntity);

      await directionRepo.save({
        id: direction.id,
        title: direction.title,
        abriviation: direction.abriviation,
      });

      const existing = await departementRepo.find({
        where: { direction: { id: direction.id } },
      });
      const existingIds = existing.map((d) => d.id);
      const aggregateIds = direction.departements.map((d) => d.id);

      const toDelete = existingIds.filter((id) => !aggregateIds.includes(id));
      if (toDelete.length) {
        await departementRepo.delete(toDelete);
      }

      if (direction.departements.length) {
        await departementRepo.save(
          direction.departements.map((d) => ({
            id: d.id,
            title: d.title,
            abriviation: d.abriviation,
            direction: { id: direction.id },
          })),
        );
      }
    });

    return direction;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // ── Aggregate loaders ─────────────────────────────────────────────────────

  async findById(id: string): Promise<Direction | null> {
    const entity = await this.repo
      .createQueryBuilder('direction')
      .where('direction.id = :id', { id })
      .leftJoinAndSelect('direction.departements', 'departements')
      .loadRelationCountAndMap('departements.users', 'departements.employees')
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  async findByDepartementId(departementId: string): Promise<Direction | null> {
    const entity = await this.repo
      .createQueryBuilder('direction')
      .innerJoinAndSelect('direction.departements', 'departements')
      .where('departements.id = :departementId', { departementId })
      .loadRelationCountAndMap('departements.users', 'departements.employees')
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  async findByTitleOrAbriviation(
    title: string,
    abriviation: string,
  ): Promise<Direction | null> {
    const entity = await this.repo
      .createQueryBuilder('d')
      .where('d.title = :title or d.abriviation = :abriviation', {
        title,
        abriviation,
      })
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  async findAll(offset: number, limit: number): Promise<Direction[]> {
    let q = this.repo
      .createQueryBuilder('direction')
      .leftJoinAndSelect('direction.departements', 'departements')
      .loadRelationCountAndMap('departements.users', 'departements.employees');

    if (Number.isInteger(offset) && Number.isInteger(limit)) {
      q = q.skip(offset).take(limit);
    }

    const entities = await q.getMany();
    return entities.map((e) => this.toDomain(e));
  }

  async getTopDirections(): Promise<Direction[]> {
    const entities = await this.repo
      .createQueryBuilder('dr')
      .loadRelationCountAndMap('dr.agreementCount', 'dr.agreements')
      .getMany();

    return entities.map((e) => this.toDomain(e));
  }

  // ── Read-model queries ────────────────────────────────────────────────────

  async findDepartementById(id: string): Promise<Departement | null> {
    const entity = await this.departementRepo
      .createQueryBuilder('dp')
      .leftJoinAndSelect('dp.direction', 'direction')
      .where('dp.id = :id', { id })
      .getOne();

    return entity ? this.departementToDomain(entity, entity.direction?.id) : null;
  }

  async findAllDepartements(
    offset: number,
    limit: number,
  ): Promise<Departement[]> {
    const entities = await this.departementRepo
      .createQueryBuilder('departement')
      .leftJoinAndSelect('departement.direction', 'direction')
      .loadRelationCountAndMap('departement.users', 'departement.employees')
      .skip(offset)
      .take(limit)
      .getMany();

    return entities.map((e) => this.departementToDomain(e, e.direction?.id));
  }

  // ── Mappers ───────────────────────────────────────────────────────────────

  private toDomain(entity: DirectionEntity): Direction {
    return Direction.create({
      id: entity.id,
      title: entity.title,
      abriviation: entity.abriviation,
      departements: (entity.departements ?? []).map((d) =>
        this.departementToDomain(d, entity.id),
      ),
      agreementCount: (entity as any).agreementCount,
    });
  }

  private departementToDomain(
    entity: DepartementEntity,
    directionId: string,
  ): Departement {
    return Departement.create({
      id: entity.id,
      title: entity.title,
      abriviation: entity.abriviation,
      directionId,
      userCount: (entity as any).users ?? 0,
    });
  }
}
