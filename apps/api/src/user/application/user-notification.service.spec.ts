import { UserNotificationService } from './user-notification.service';
import { INotificationRepository } from '../domain/notification.repository';
import { Notification } from '../domain/notification';

// ── Typed mock factory ───────────────────────────────────────────────────────

function mockOf<T>(methods: (keyof T)[]): jest.Mocked<T> {
  return Object.fromEntries(
    methods.map((m) => [m, jest.fn()]),
  ) as jest.Mocked<T>;
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeNotification(userId = 'user-1'): Notification {
  return { id: `notif-${userId}`, message: 'hello', createdAt: new Date() };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('UserNotificationService', () => {
  let notifRepo: jest.Mocked<INotificationRepository>;
  let service: UserNotificationService;

  beforeEach(() => {
    notifRepo = mockOf<INotificationRepository>(['findByUserId', 'saveMany']);
    service = new UserNotificationService(notifRepo);
  });

  // ── getUserNotifications ─────────────────────────────────────────────────────

  describe('getUserNotifications', () => {
    it('returns notifications for the given user', async () => {
      const notifs = [makeNotification('user-1')];
      notifRepo.findByUserId.mockResolvedValue(notifs);

      const result = await service.getUserNotifications('user-1');

      expect(notifRepo.findByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toBe(notifs);
    });

    it('returns an empty array when user has no notifications', async () => {
      notifRepo.findByUserId.mockResolvedValue([]);

      expect(await service.getUserNotifications('user-1')).toEqual([]);
    });
  });

  // ── saveForUsers ─────────────────────────────────────────────────────────────

  describe('saveForUsers', () => {
    it('delegates to the repository with the exact notification list', async () => {
      notifRepo.saveMany.mockResolvedValue(undefined);
      const items = [
        { userId: 'user-1', message: 'msg A' },
        { userId: 'user-2', message: 'msg B' },
      ];

      await service.saveForUsers(items);

      expect(notifRepo.saveMany).toHaveBeenCalledWith(items);
    });

    it('no-op when given an empty array', async () => {
      notifRepo.saveMany.mockResolvedValue(undefined);

      await service.saveForUsers([]);

      expect(notifRepo.saveMany).toHaveBeenCalledWith([]);
    });
  });
});
