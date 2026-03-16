import { describe, it, expect } from 'vitest';
import { Notification } from '../notification';

const NOTIF_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const USER_ID  = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

describe('Notification (Aggregate Root)', () => {

  describe('create', () => {
    it('happy path – should create notification with correct fields', () => {
      // Act
      const notification = Notification.create(
        NOTIF_ID,
        USER_ID,
        'Votre contrat AGR-2024-001 a été mis à jour',
      );

      // Assert
      expect(notification.message.value).toBe('Votre contrat AGR-2024-001 a été mis à jour');
      expect(notification.userId).toBe(USER_ID);
      expect(notification.createdAt.value).toBeInstanceOf(Date);
    });

    it('failure path – should throw when message is empty', () => {
      expect(() => Notification.create(NOTIF_ID, USER_ID, ''))
        .toThrowError('Notification message must not be empty');
    });

    it('failure path – should throw when message is only whitespace', () => {
      expect(() => Notification.create(NOTIF_ID, USER_ID, '   '))
        .toThrowError('Notification message must not be empty');
    });
  });
});
