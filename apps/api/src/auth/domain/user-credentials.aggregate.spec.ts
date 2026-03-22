import { describe, it, expect } from '@jest/globals';
import { UserCredentials } from './user-credentials.aggregate';

function createCredentials(
  overrides: Partial<Parameters<typeof UserCredentials.create>[0]> = {},
) {
  return UserCredentials.create({
    userId: 'user-1',
    passwordHash: 'hashed-password',
    ...overrides,
  });
}

describe('UserCredentials (Aggregate Root)', () => {
  describe('create', () => {
    it('happy path – should set userId, passwordHash and default nulls', () => {
      // Act
      const creds = createCredentials();

      // Assert
      expect(creds.userId).toBe('user-1');
      expect(creds.passwordHash).toBe('hashed-password');
      expect(creds.refreshTokenHash).toBeNull();
      expect(creds.passwordToken).toBeUndefined();
    });

    it('happy path – should accept an initial refreshTokenHash', () => {
      const creds = createCredentials({ refreshTokenHash: 'refresh-hash-abc' });
      expect(creds.refreshTokenHash).toBe('refresh-hash-abc');
    });

    it('happy path – should not emit any domain events on create', () => {
      const creds = createCredentials();
      expect(creds.pullEvents()).toHaveLength(0);
    });
  });

  describe('reconstitute', () => {
    it('happy path – should restore all fields without emitting events', () => {
      // Arrange + Act
      const creds = UserCredentials.reconstitute({
        userId: 'user-1',
        passwordHash: 'h1',
        refreshTokenHash: 'r1',
        passwordToken: { token: 't', expiresIn: new Date('2099-01-01') },
      });

      // Assert
      expect(creds.passwordHash).toBe('h1');
      expect(creds.refreshTokenHash).toBe('r1');
      expect(creds.passwordToken?.token).toBe('t');
      expect(creds.pullEvents()).toHaveLength(0);
    });
  });

  describe('setRefreshToken', () => {
    it('happy path – should store the hashed refresh token', () => {
      // Arrange
      const creds = createCredentials();

      // Act
      creds.setRefreshToken('new-refresh-hash');

      // Assert
      expect(creds.refreshTokenHash).toBe('new-refresh-hash');
    });
  });

  describe('clearRefreshToken', () => {
    it('happy path – should set refreshTokenHash to null', () => {
      // Arrange
      const creds = createCredentials({ refreshTokenHash: 'existing-hash' });

      // Act
      creds.clearRefreshToken();

      // Assert
      expect(creds.refreshTokenHash).toBeNull();
    });
  });

  describe('requestPasswordReset', () => {
    it('happy path – should store hashed token and expiry', () => {
      // Arrange
      const creds = createCredentials();
      const expiresIn = new Date('2099-12-31');

      // Act
      creds.requestPasswordReset('reset-token-hash', expiresIn);

      // Assert
      expect(creds.passwordToken).not.toBeNull();
      expect(creds.passwordToken?.token).toBe('reset-token-hash');
      expect(creds.passwordToken?.expiresIn).toEqual(expiresIn);
    });

    it('happy path – should overwrite an existing pending reset token', () => {
      // Arrange
      const creds = createCredentials();
      creds.requestPasswordReset('old-token', new Date('2099-01-01'));

      // Act
      creds.requestPasswordReset('new-token', new Date('2099-06-01'));

      // Assert
      expect(creds.passwordToken?.token).toBe('new-token');
    });
  });

  describe('resetPassword', () => {
    it('happy path – should update passwordHash and clear passwordToken', () => {
      // Arrange
      const creds = createCredentials();
      creds.requestPasswordReset('token', new Date('2099-01-01'));

      // Act
      creds.resetPassword('new-hashed-password');

      // Assert
      expect(creds.passwordHash).toBe('new-hashed-password');
      expect(creds.passwordToken).toBeNull();
    });
  });

  describe('clearPasswordToken', () => {
    it('happy path – should set passwordToken to null', () => {
      // Arrange
      const creds = createCredentials();
      creds.requestPasswordReset('token', new Date('2099-01-01'));

      // Act
      creds.clearPasswordToken();

      // Assert
      expect(creds.passwordToken).toBeNull();
    });

    it('happy path – should be a no-op when passwordToken is already null', () => {
      const creds = createCredentials();
      expect(() => creds.clearPasswordToken()).not.toThrow();
      expect(creds.passwordToken).toBeNull();
    });
  });
});
