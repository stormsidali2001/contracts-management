import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { UserEntity } from 'src/core/entities/User.entity';
import { NotificationEntity } from 'src/core/entities/Notification.entity';
import { typeOrmTestingModule } from 'src/test-utils/typeorm-testing';
import { UserRepository } from './user.repository';
import { User } from '../../domain/user.aggregate';
import { UserRole } from 'src/core/types/UserRole.enum';

describe('UserRepository (integration)', () => {
  let module: TestingModule;
  let repo: UserRepository;
  let dataSource: DataSource;

  const userIds: string[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        typeOrmTestingModule(),
        TypeOrmModule.forFeature([UserEntity, NotificationEntity]),
      ],
      providers: [UserRepository],
    }).compile();

    repo = module.get(UserRepository);
    dataSource = module.get(DataSource);
  });

  afterAll(async () => {
    await module.close();
  });

  afterEach(async () => {
    if (userIds.length) {
      await dataSource.query(
        `DELETE FROM users WHERE id IN (${userIds.map(() => '?').join(',')})`,
        [...userIds],
      );
      userIds.length = 0;
    }
  });

  function buildUser() {
    const s = uuid().replace(/-/g, '').slice(0, 8);
    return User.create({
      id: uuid(),
      email: `test-${s}@test.com`,
      username: `user-${s}`,
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.EMPLOYEE,
    });
  }

  // ── save ─────────────────────────────────────────────────────────────────

  describe('save', () => {
    it('returns a User aggregate, never a TypeORM entity', async () => {
      const user = buildUser();
      userIds.push(user.id);

      const result = await repo.save(user);

      expect(result).toBeInstanceOf(User);
      expect(result).not.toBeInstanceOf(UserEntity);
      expect(typeof result.pullEvents).toBe('function');
    });

    it('persists all scalar fields to the database', async () => {
      const user = buildUser();
      userIds.push(user.id);
      await repo.save(user);

      // Verify round-trip: read back from DB and check all fields
      const found = await repo.findById(user.id);
      expect(found.id).toBe(user.id);
      expect(found.email).toBe(user.email);
      expect(found.username).toBe(user.username);
      expect(found.firstName).toBe(user.firstName);
      expect(found.lastName).toBe(user.lastName);
      expect(found.role).toBe(UserRole.EMPLOYEE);
      expect(found.active).toBe(true);
      expect(found.recieve_notifications).toBe(false);
      expect(found.directionId).toBeNull();
      expect(found.departementId).toBeNull();
    });

    it('persists an update to an existing user', async () => {
      const user = buildUser();
      userIds.push(user.id);
      await repo.save(user);

      user.update({ firstName: 'Updated' });
      await repo.save(user);

      const found = await repo.findById(user.id);
      expect(found.firstName).toBe('Updated');
    });
  });

  // ── findById ─────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('reconstitutes a User aggregate from the database', async () => {
      const user = buildUser();
      userIds.push(user.id);
      await repo.save(user);

      const result = await repo.findById(user.id);

      expect(result).toBeInstanceOf(User);
      expect(result).not.toBeInstanceOf(UserEntity);
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
    });

    it('returns null for an unknown id', async () => {
      expect(await repo.findById(uuid())).toBeNull();
    });
  });

  // ── findByEmailOrUsername ─────────────────────────────────────────────────

  describe('findByEmailOrUsername', () => {
    it('finds user by email', async () => {
      const user = buildUser();
      userIds.push(user.id);
      await repo.save(user);

      const result = await repo.findByEmailOrUsername(user.email, 'no-match');

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(user.id);
    });

    it('finds user by username', async () => {
      const user = buildUser();
      userIds.push(user.id);
      await repo.save(user);

      const result = await repo.findByEmailOrUsername(
        'no@test.com',
        user.username,
      );

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(user.id);
    });

    it('returns null when neither email nor username match', async () => {
      expect(
        await repo.findByEmailOrUsername('no@test.com', 'no-username'),
      ).toBeNull();
    });
  });

  // ── findProfileById ───────────────────────────────────────────────────────

  describe('findProfileById', () => {
    it('returns a UserProfile with null direction and departement when user has none', async () => {
      const user = buildUser();
      userIds.push(user.id);
      await repo.save(user);

      const result = await repo.findProfileById(user.id);

      expect(result).not.toBeNull();
      expect(result).not.toBeInstanceOf(UserEntity);
      expect(result.id).toBe(user.id);
      // No direction/departement assigned — must map to null, not undefined or entity
      expect(result.direction).toBeNull();
      expect(result.departement).toBeNull();
    });

    it('returns null for an unknown id', async () => {
      expect(await repo.findProfileById(uuid())).toBeNull();
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('removes the user so it can no longer be found', async () => {
      const user = buildUser();
      userIds.push(user.id); // safety net: afterEach cleans up if repo.delete throws
      await repo.save(user);

      await repo.delete(user.id);

      expect(await repo.findById(user.id)).toBeNull();
    });
  });
});
