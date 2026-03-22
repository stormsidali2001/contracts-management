import { describe, it, expect } from '@jest/globals';
import { User } from './user.aggregate';
import { UserCreatedEvent } from './events/user-created.event';
import { UserUpdatedEvent } from './events/user-updated.event';
import { UserDeletedEvent } from './events/user-deleted.event';
import { UserRole } from '../../core/types/UserRole.enum';

function makeProps(overrides: Partial<Parameters<typeof User.create>[0]> = {}) {
  return {
    id: 'user-1',
    email: 'alice@example.com',
    username: 'alice',
    firstName: 'Alice',
    lastName: 'Smith',
    ...overrides,
  };
}

function createUser(overrides: Partial<Parameters<typeof User.create>[0]> = {}) {
  return User.create(makeProps(overrides));
}

describe('User (Aggregate Root)', () => {
  describe('create', () => {
    it('happy path – should set provided props and apply defaults', () => {
      // Act
      const user = createUser();

      // Assert
      expect(user.id).toBe('user-1');
      expect(user.email).toBe('alice@example.com');
      expect(user.username).toBe('alice');
      expect(user.role).toBe(UserRole.EMPLOYEE);
      expect(user.active).toBe(true);
      expect(user.recieve_notifications).toBe(false);
      expect(user.imageUrl).toBe('');
      expect(user.directionId).toBeNull();
      expect(user.departementId).toBeNull();
    });

    it('happy path – should not emit events on create (events deferred to recordCreated)', () => {
      const user = createUser();
      expect(user.pullEvents()).toHaveLength(0);
    });

    it('happy path – should accept custom role and departement/direction ids', () => {
      const user = createUser({
        role: UserRole.ADMIN,
        departementId: 'dept-1',
        directionId: 'dir-1',
      });

      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.departementId).toBe('dept-1');
      expect(user.directionId).toBe('dir-1');
    });
  });

  describe('reconstitute', () => {
    it('happy path – should not emit any events', () => {
      const user = User.reconstitute(makeProps());
      expect(user.pullEvents()).toHaveLength(0);
    });
  });

  describe('recordCreated', () => {
    it('happy path – should emit UserCreatedEvent with all identity fields', () => {
      // Arrange
      const user = createUser({ departementId: 'dept-1', directionId: 'dir-1' });

      // Act
      user.recordCreated('DEPT', 'DIR');

      // Assert
      const events = user.pullEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as UserCreatedEvent;
      expect(event).toBeInstanceOf(UserCreatedEvent);
      expect(event.userId).toBe('user-1');
      expect(event.email).toBe('alice@example.com');
      expect(event.role).toBe(UserRole.EMPLOYEE);
      expect(event.departementId).toBe('dept-1');
      expect(event.directionId).toBe('dir-1');
      expect(event.departementAbriviation).toBe('DEPT');
      expect(event.directionAbriviation).toBe('DIR');
    });
  });

  describe('recordUpdated', () => {
    it('happy path – should emit UserUpdatedEvent with current state', () => {
      // Arrange
      const user = createUser({ departementId: 'dept-1', directionId: 'dir-1' });

      // Act
      user.recordUpdated('DEPT', 'DIR');

      // Assert
      const events = user.pullEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as UserUpdatedEvent;
      expect(event).toBeInstanceOf(UserUpdatedEvent);
      expect(event.userId).toBe('user-1');
    });
  });

  describe('recordDeleted', () => {
    it('happy path – should emit UserDeletedEvent with correct ids', () => {
      // Arrange
      const user = createUser({ departementId: 'dept-2', directionId: 'dir-2' });

      // Act
      user.recordDeleted('D2', 'R2');

      // Assert
      const events = user.pullEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as UserDeletedEvent;
      expect(event).toBeInstanceOf(UserDeletedEvent);
      expect(event.userId).toBe('user-1');
      expect(event.departementAbriviation).toBe('D2');
      expect(event.directionAbriviation).toBe('R2');
    });
  });

  describe('update', () => {
    it('happy path – should update only provided fields, leave rest intact', () => {
      // Arrange
      const user = createUser();

      // Act
      user.update({ firstName: 'Alicia', role: UserRole.ADMIN });

      // Assert
      expect(user.firstName).toBe('Alicia');
      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.lastName).toBe('Smith'); // unchanged
      expect(user.email).toBe('alice@example.com'); // unchanged
    });
  });

  describe('updateImage', () => {
    it('happy path – should update imageUrl', () => {
      // Arrange
      const user = createUser();

      // Act
      user.updateImage('https://cdn/avatar.png');

      // Assert
      expect(user.imageUrl).toBe('https://cdn/avatar.png');
    });
  });

  describe('toggleNotifications', () => {
    it('happy path – should toggle from false to true', () => {
      const user = createUser({ recieve_notifications: false });
      user.toggleNotifications();
      expect(user.recieve_notifications).toBe(true);
    });

    it('happy path – should toggle from true back to false', () => {
      const user = createUser({ recieve_notifications: true });
      user.toggleNotifications();
      expect(user.recieve_notifications).toBe(false);
    });
  });
});
