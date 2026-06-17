import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { typeOrmTestingModule } from 'src/test-utils/typeorm-testing';
import { DirectionRepository } from './direction.repository';
import { Direction } from '../../domain/direction';

describe('DirectionRepository (integration)', () => {
  let module: TestingModule;
  let repo: DirectionRepository;
  let dataSource: DataSource;

  const directionIds: string[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        typeOrmTestingModule(),
        TypeOrmModule.forFeature([DirectionEntity, DepartementEntity]),
      ],
      providers: [DirectionRepository],
    }).compile();

    repo = module.get(DirectionRepository);
    dataSource = module.get(DataSource);
  });

  afterAll(async () => {
    await module.close();
  });

  afterEach(async () => {
    if (directionIds.length) {
      const placeholders = directionIds.map((_, i) => `$${i + 1}`).join(',');
      // Departements must be removed before directions due to the FK constraint
      await dataSource.query(
        `DELETE FROM departements WHERE "directionId" IN (${placeholders})`,
        [...directionIds],
      );
      await dataSource.query(
        `DELETE FROM directions WHERE id IN (${placeholders})`,
        [...directionIds],
      );
      directionIds.length = 0;
    }
  });

  function buildDirection() {
    const s = uuid().replace(/-/g, '').slice(0, 8);
    return Direction.create({
      id: uuid(),
      title: `Direction-${s}`,
      abriviation: `DIR-${s}`,
    });
  }

  // ── save ─────────────────────────────────────────────────────────────────

  describe('save', () => {
    it('returns a Direction aggregate, never a TypeORM entity', async () => {
      const direction = buildDirection();
      directionIds.push(direction.id);

      const result = await repo.save(direction);

      expect(result).toBeInstanceOf(Direction);
      expect(result).not.toBeInstanceOf(DirectionEntity);
      expect(typeof result.pullEvents).toBe('function');
    });

    it('persists all scalar fields correctly', async () => {
      const direction = buildDirection();
      directionIds.push(direction.id);

      await repo.save(direction);
      const found = await repo.findById(direction.id);

      expect(found.id).toBe(direction.id);
      expect(found.title).toBe(direction.title);
      expect(found.abriviation).toBe(direction.abriviation);
    });

    it('persists departements along with the direction', async () => {
      const direction = buildDirection();
      directionIds.push(direction.id);
      direction.addDepartement(
        uuid(),
        `Dept-${uuid().slice(0, 6)}`,
        `DP-${uuid().slice(0, 4)}`,
      );

      await repo.save(direction);
      const found = await repo.findById(direction.id);

      expect(found.departements).toHaveLength(1);
      expect(found.departements[0].id).toBe(direction.departements[0].id);
      expect(found.departements[0]).not.toBeInstanceOf(DepartementEntity);
    });

    it('removes a departement when it is dropped from the aggregate', async () => {
      const direction = buildDirection();
      directionIds.push(direction.id);
      const deptId = uuid();
      direction.addDepartement(
        deptId,
        `Dept-${uuid().slice(0, 6)}`,
        `DP-${uuid().slice(0, 4)}`,
      );
      await repo.save(direction);

      // Remove the departement and re-save
      direction.removeDepartement(deptId);
      await repo.save(direction);

      const found = await repo.findById(direction.id);
      expect(found.departements).toHaveLength(0);
    });

    it('persists an update to the direction title', async () => {
      const direction = buildDirection();
      directionIds.push(direction.id);
      await repo.save(direction);

      direction.rename('Updated Title', direction.abriviation);
      await repo.save(direction);

      const found = await repo.findById(direction.id);
      expect(found.title).toBe('Updated Title');
    });
  });

  // ── findById ─────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('reconstitutes a Direction aggregate from the database', async () => {
      const direction = buildDirection();
      directionIds.push(direction.id);
      await repo.save(direction);

      const result = await repo.findById(direction.id);

      expect(result).toBeInstanceOf(Direction);
      expect(result).not.toBeInstanceOf(DirectionEntity);
      expect(result.id).toBe(direction.id);
      expect(result.title).toBe(direction.title);
    });

    it('returns null for an unknown id', async () => {
      expect(await repo.findById(uuid())).toBeNull();
    });
  });

  // ── findByDepartementId ───────────────────────────────────────────────────

  describe('findByDepartementId', () => {
    it('returns the owning Direction when the departement exists', async () => {
      const direction = buildDirection();
      directionIds.push(direction.id);
      const deptId = uuid();
      direction.addDepartement(
        deptId,
        `Dept-${uuid().slice(0, 6)}`,
        `DP-${uuid().slice(0, 4)}`,
      );
      await repo.save(direction);

      const result = await repo.findByDepartementId(deptId);

      expect(result).toBeInstanceOf(Direction);
      expect(result.id).toBe(direction.id);
    });

    it('returns null for an unknown departement id', async () => {
      expect(await repo.findByDepartementId(uuid())).toBeNull();
    });
  });

  // ── findByTitleOrAbriviation ──────────────────────────────────────────────

  describe('findByTitleOrAbriviation', () => {
    it('finds a direction by title', async () => {
      const direction = buildDirection();
      directionIds.push(direction.id);
      await repo.save(direction);

      const result = await repo.findByTitleOrAbriviation(
        direction.title,
        'NO-MATCH',
      );

      expect(result).toBeInstanceOf(Direction);
      expect(result.id).toBe(direction.id);
    });

    it('finds a direction by abriviation', async () => {
      const direction = buildDirection();
      directionIds.push(direction.id);
      await repo.save(direction);

      const result = await repo.findByTitleOrAbriviation(
        'No Match Title',
        direction.abriviation,
      );

      expect(result).toBeInstanceOf(Direction);
      expect(result.id).toBe(direction.id);
    });

    it('returns null when neither title nor abriviation match', async () => {
      expect(
        await repo.findByTitleOrAbriviation('no-title', 'NO-ABRV'),
      ).toBeNull();
    });
  });

  // ── findDepartementById ───────────────────────────────────────────────────

  describe('findDepartementById', () => {
    it('returns a Departement domain object, not a TypeORM entity', async () => {
      const direction = buildDirection();
      directionIds.push(direction.id);
      const deptId = uuid();
      direction.addDepartement(
        deptId,
        `Dept-${uuid().slice(0, 6)}`,
        `DP-${uuid().slice(0, 4)}`,
      );
      await repo.save(direction);

      const result = await repo.findDepartementById(deptId);

      expect(result).not.toBeNull();
      expect(result).not.toBeInstanceOf(DepartementEntity);
      expect(result.id).toBe(deptId);
      expect(result.directionId).toBe(direction.id);
    });

    it('returns null for an unknown departement id', async () => {
      expect(await repo.findDepartementById(uuid())).toBeNull();
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('removes the direction so it can no longer be found', async () => {
      const direction = buildDirection();
      directionIds.push(direction.id); // safety net: afterEach cleans up if repo.delete throws
      await repo.save(direction);

      await repo.delete(direction.id);

      expect(await repo.findById(direction.id)).toBeNull();
    });
  });
});
