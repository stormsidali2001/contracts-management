import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { NotificationEntity } from 'src/core/entities/Notification.entity';
import { UserEntity } from 'src/core/entities/User.entity';
import { typeOrmTestingModule } from 'src/test-utils/typeorm-testing';
import { NotificationRepository } from './notification.repository';
import { Notification } from 'src/user/domain/notification';
import { UserRole } from 'src/core/types/UserRole.enum';

describe('NotificationRepository (integration)', () => {
  let module: TestingModule;
  let repo: NotificationRepository;
  let dataSource: DataSource;

  // FK prerequisite shared across all tests
  let userId: string;

  const notificationIds: string[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        typeOrmTestingModule(),
        TypeOrmModule.forFeature([NotificationEntity, UserEntity]),
      ],
      providers: [NotificationRepository],
    }).compile();

    repo = module.get(NotificationRepository);
    dataSource = module.get(DataSource);

    // Insert a prerequisite user directly — notifications require a valid userId FK
    const s = uuid().replace(/-/g, '').slice(0, 8);
    userId = uuid();
    await dataSource.query(
      `INSERT INTO users (id, email, username, firstName, lastName, role, active, recieve_notifications)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, `notif-${s}@test.com`, `notif-${s}`, 'Test', 'User', UserRole.EMPLOYEE, true, false],
    );
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM users WHERE id = ?', [userId]);
    await module.close();
  });

  afterEach(async () => {
    if (notificationIds.length) {
      await dataSource.query(
        `DELETE FROM notifications WHERE id IN (${notificationIds.map(() => '?').join(',')})`,
        [...notificationIds],
      );
      notificationIds.length = 0;
    }
  });

  // ── saveMany ──────────────────────────────────────────────────────────────

  describe('saveMany', () => {
    it('returns Notification domain objects, never TypeORM entities', async () => {
      const results = await repo.saveMany([
        { message: 'msg-1', userId },
        { message: 'msg-2', userId },
      ]);
      results.forEach((n) => notificationIds.push(n.id));

      expect(results).toHaveLength(2);
      results.forEach((n) => {
        expect(n).toBeInstanceOf(Notification);
        expect(n).not.toBeInstanceOf(NotificationEntity);
      });
    });

    it('persists all provided notifications with isRead defaulting to false', async () => {
      const [n] = await repo.saveMany([{ message: 'hello', userId }]);
      notificationIds.push(n.id);

      expect(n.message).toBe('hello');
      expect(n.isRead).toBe(false);
      expect(n.id).toBeTruthy();
      expect(n.createdAt).toBeInstanceOf(Date);
    });
  });

  // ── findByUserId ──────────────────────────────────────────────────────────

  describe('findByUserId', () => {
    it('returns all notifications for the user ordered by createdAt DESC', async () => {
      const saved = await repo.saveMany([
        { message: 'first', userId },
        { message: 'second', userId },
      ]);
      saved.forEach((n) => notificationIds.push(n.id));

      const results = await repo.findByUserId(userId);

      const messages = results.map((n) => n.message);
      expect(messages).toContain('first');
      expect(messages).toContain('second');
      // Verify DESC order: each createdAt >= the next one
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].createdAt.getTime()).toBeGreaterThanOrEqual(
          results[i + 1].createdAt.getTime(),
        );
      }
    });

    it('returns an empty array for a user with no notifications', async () => {
      const otherId = uuid();
      await dataSource.query(
        `INSERT INTO users (id, email, username, firstName, lastName, role, active, recieve_notifications)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [otherId, `other-${otherId.slice(0, 6)}@test.com`, `other-${otherId.slice(0, 6)}`, 'Other', 'User', UserRole.EMPLOYEE, true, false],
      );

      const results = await repo.findByUserId(otherId);

      await dataSource.query('DELETE FROM users WHERE id = ?', [otherId]);
      expect(results).toEqual([]);
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns the notification when id and userId match', async () => {
      const [n] = await repo.saveMany([{ message: 'find-me', userId }]);
      notificationIds.push(n.id);

      const result = await repo.findById(n.id, userId);

      expect(result).toBeInstanceOf(Notification);
      expect(result).not.toBeInstanceOf(NotificationEntity);
      expect(result.id).toBe(n.id);
      expect(result.message).toBe('find-me');
    });

    it('returns null when the notification belongs to a different user', async () => {
      const [n] = await repo.saveMany([{ message: 'not-yours', userId }]);
      notificationIds.push(n.id);

      expect(await repo.findById(n.id, uuid())).toBeNull();
    });

    it('returns null for an unknown notification id', async () => {
      expect(await repo.findById(uuid(), userId)).toBeNull();
    });
  });

  // ── save (mark as read) ───────────────────────────────────────────────────

  describe('save', () => {
    it('persists the isRead update to the database', async () => {
      const [n] = await repo.saveMany([{ message: 'mark-me', userId }]);
      notificationIds.push(n.id);

      n.markAsRead();
      await repo.save(n);

      const reloaded = await repo.findById(n.id, userId);
      expect(reloaded.isRead).toBe(true);
    });
  });
});
