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
  return Notification.reconstitute(
    `notif-${userId}`,
    'hello',
    new Date(),
    false,
  );
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('UserNotificationService', () => {
  let notifRepo: jest.Mocked<INotificationRepository>;
  let service: UserNotificationService;

  beforeEach(() => {
    notifRepo = mockOf<INotificationRepository>([
      'findByUserId',
      'findById',
      'saveMany',
      'save',
    ]);
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
    it('delegates to the repository and returns userId+notification pairs', async () => {
      const savedNotifs = [
        Notification.reconstitute('id-1', 'msg A', new Date(), false),
        Notification.reconstitute('id-2', 'msg B', new Date(), false),
      ];
      notifRepo.saveMany.mockResolvedValue(savedNotifs);
      const items = [
        { userId: 'user-1', message: 'msg A' },
        { userId: 'user-2', message: 'msg B' },
      ];

      const result = await service.saveForUsers(items);

      expect(notifRepo.saveMany).toHaveBeenCalledWith(items);
      expect(result).toEqual([
        { userId: 'user-1', notification: savedNotifs[0] },
        { userId: 'user-2', notification: savedNotifs[1] },
      ]);
    });

    it('returns empty array when given an empty array', async () => {
      notifRepo.saveMany.mockResolvedValue([]);

      const result = await service.saveForUsers([]);

      expect(result).toEqual([]);
    });
  });

  // ── markAsRead ───────────────────────────────────────────────────────────────

  describe('markAsRead', () => {
    it('loads, marks, and saves the notification', async () => {
      const notif = makeNotification('user-1');
      notifRepo.findById.mockResolvedValue(notif);
      notifRepo.save.mockResolvedValue(undefined);

      await service.markAsRead('notif-user-1', 'user-1');

      expect(notifRepo.findById).toHaveBeenCalledWith('notif-user-1', 'user-1');
      expect(notif.isRead).toBe(true);
      expect(notifRepo.save).toHaveBeenCalledWith(notif);
    });

    it('is a no-op when notification is not found', async () => {
      notifRepo.findById.mockResolvedValue(null);

      await service.markAsRead('unknown', 'user-1');

      expect(notifRepo.save).not.toHaveBeenCalled();
    });
  });

  // ── markAllAsRead ────────────────────────────────────────────────────────────

  describe('markAllAsRead', () => {
    it('marks only unread notifications and saves each', async () => {
      const unread = Notification.reconstitute('n1', 'msg', new Date(), false);
      const alreadyRead = Notification.reconstitute(
        'n2',
        'msg',
        new Date(),
        true,
      );
      notifRepo.findByUserId.mockResolvedValue([unread, alreadyRead]);
      notifRepo.save.mockResolvedValue(undefined);

      await service.markAllAsRead('user-1');

      expect(unread.isRead).toBe(true);
      expect(notifRepo.save).toHaveBeenCalledTimes(1);
      expect(notifRepo.save).toHaveBeenCalledWith(unread);
    });

    it('is a no-op when all notifications are already read', async () => {
      const read = Notification.reconstitute('n1', 'msg', new Date(), true);
      notifRepo.findByUserId.mockResolvedValue([read]);
      notifRepo.save.mockResolvedValue(undefined);

      await service.markAllAsRead('user-1');

      expect(notifRepo.save).not.toHaveBeenCalled();
    });
  });
});
