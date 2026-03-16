import { describe, it, expect } from 'vitest';
import { User } from '../user';
import { UserRoleEnum } from '../value-objects/user-role';

// ─── Helpers ────────────────────────────────────────────────────────────────

const USER_ID    = '11111111-1111-4111-8111-111111111111';
const DIR_ID     = '22222222-2222-4222-8222-222222222222';
const DEPT_ID    = '33333333-3333-4333-8333-333333333333';
const OTHER_ID   = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

function makeUser(overrides: Partial<Parameters<typeof User.create>[0]> = {}): User {
  return User.create({
    id: USER_ID,
    email: 'ali.benali@example.com',
    username: 'ali.benali',
    password: '$2b$10$hashedpasswordvalue',
    role: UserRoleEnum.EMPLOYEE,
    firstName: 'Ali',
    lastName: 'Benali',
    directionId: DIR_ID,
    departementId: DEPT_ID,
    ...overrides,
  });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('User (Aggregate Root)', () => {

  describe('create', () => {
    it('happy path – EMPLOYEE with org membership should have directionId and departementId set', () => {
      // Act
      const user = makeUser();

      // Assert
      expect(user.role.value).toBe(UserRoleEnum.EMPLOYEE);
      expect(user.active).toBe(true);
      expect(user.membership.isAssigned()).toBe(true);
      expect(user.membership.directionId).toBe(DIR_ID);
      expect(user.membership.departementId).toBe(DEPT_ID);
      expect(user.recieve_notifications.receiveNotifications).toBe(false);
      expect(user.refresh_token_hash.isPresent()).toBe(false);
      expect(user.password_token).toBeNull();
    });

    it('happy path – ADMIN should have no org membership even when ids provided', () => {
      // Act
      const admin = makeUser({
        role: UserRoleEnum.ADMIN,
        directionId: DIR_ID,
        departementId: DEPT_ID,
      });

      // Assert
      expect(admin.membership.isAssigned()).toBe(false);
      expect(admin.membership.directionId).toBeNull();
    });

    it('happy path – JURIDICAL should have no org membership', () => {
      const user = makeUser({ role: UserRoleEnum.JURIDICAL });
      expect(user.membership.isAssigned()).toBe(false);
    });

    it('failure path – should throw on invalid email format', () => {
      expect(() => makeUser({ email: 'not-an-email' }))
        .toThrowError('Invalid email address');
    });

    it('failure path – should throw on username too short', () => {
      expect(() => makeUser({ username: 'ab' }))
        .toThrowError('Invalid username');
    });

    it('failure path – should throw on empty first name', () => {
      expect(() => makeUser({ firstName: '' }))
        .toThrowError('First name must not be empty');
    });
  });

  describe('changeRole', () => {
    it('happy path – changing EMPLOYEE to ADMIN clears org membership', () => {
      // Arrange
      const user = makeUser({ role: UserRoleEnum.EMPLOYEE });
      expect(user.membership.isAssigned()).toBe(true);

      // Act
      user.changeRole(UserRoleEnum.ADMIN);

      // Assert
      expect(user.role.value).toBe(UserRoleEnum.ADMIN);
      expect(user.membership.isAssigned()).toBe(false);
    });

    it('happy path – changing ADMIN to JURIDICAL keeps membership cleared', () => {
      const user = makeUser({ role: UserRoleEnum.ADMIN });

      user.changeRole(UserRoleEnum.JURIDICAL);

      expect(user.role.value).toBe(UserRoleEnum.JURIDICAL);
      expect(user.membership.isAssigned()).toBe(false);
    });
  });

  describe('assignToOrganization', () => {
    it('happy path – should assign EMPLOYEE to a direction and departement', () => {
      // Arrange
      const user = makeUser({ role: UserRoleEnum.EMPLOYEE, directionId: null, departementId: null });

      // Act
      user.assignToOrganization(DIR_ID, DEPT_ID);

      // Assert
      expect(user.membership.directionId).toBe(DIR_ID);
      expect(user.membership.departementId).toBe(DEPT_ID);
    });

    it('failure path – should throw when assigning ADMIN to an organization', () => {
      const admin = makeUser({ role: UserRoleEnum.ADMIN });

      expect(() =>
        admin.assignToOrganization(DIR_ID, DEPT_ID),
      ).toThrowError('cannot be assigned to an organization');
    });
  });

  describe('toggleNotifications', () => {
    it('happy path – should toggle from false to true', () => {
      const user = makeUser();
      expect(user.recieve_notifications.receiveNotifications).toBe(false);

      user.toggleNotifications();

      expect(user.recieve_notifications.receiveNotifications).toBe(true);
    });

    it('happy path – should toggle back to false on second call', () => {
      const user = makeUser();
      user.toggleNotifications();
      user.toggleNotifications();

      expect(user.recieve_notifications.receiveNotifications).toBe(false);
    });
  });

  describe('activate / deactivate', () => {
    it('happy path – should deactivate an active user', () => {
      const user = makeUser();
      user.deactivate();
      expect(user.active).toBe(false);
    });

    it('happy path – should reactivate a deactivated user', () => {
      const user = makeUser();
      user.deactivate();
      user.activate();
      expect(user.active).toBe(true);
    });
  });

  describe('setRefreshToken / clearRefreshToken', () => {
    it('happy path – should store a refresh token hash', () => {
      const user = makeUser();
      user.setRefreshToken('$2b$10$refreshtokenhash');
      expect(user.refresh_token_hash.isPresent()).toBe(true);
    });

    it('happy path – should clear the refresh token', () => {
      const user = makeUser();
      user.setRefreshToken('$2b$10$refreshtokenhash');
      user.clearRefreshToken();
      expect(user.refresh_token_hash.isPresent()).toBe(false);
    });
  });

  describe('requestPasswordReset / resetPassword', () => {
    it('happy path – should create a password reset token that is not expired', () => {
      // Arrange
      const user = makeUser();

      // Act
      const token = user.requestPasswordReset('random-token-string');

      // Assert
      expect(user.password_token).not.toBeNull();
      expect(token.token).toBe('random-token-string');
      expect(token.isExpired()).toBe(false);
      expect(token.isValid('random-token-string')).toBe(true);
    });

    it('happy path – resetPassword should update hash and clear the token', () => {
      // Arrange
      const user = makeUser();
      user.requestPasswordReset('reset-token');

      // Act
      user.resetPassword('$2b$10$newhashedpassword');

      // Assert
      expect(user.password_token).toBeNull();
      expect(user.password.value).toBe('$2b$10$newhashedpassword');
    });

    it('failure path – token should be invalid with wrong value', () => {
      const user = makeUser();
      user.requestPasswordReset('correct-token');

      expect(user.password_token!.isValid('wrong-token')).toBe(false);
    });
  });

  describe('canAccessDepartement / isInOrganization', () => {
    it('happy path – returns true when user belongs to the given departement', () => {
      const user = makeUser();
      expect(user.canAccessDepartement(DEPT_ID)).toBe(true);
    });

    it('failure path – returns false for a different departement', () => {
      const user = makeUser();
      expect(user.canAccessDepartement(OTHER_ID)).toBe(false);
    });

    it('happy path – returns true when user is in the correct direction and departement', () => {
      const user = makeUser();
      expect(
        user.isInOrganization(
          DIR_ID,
          DEPT_ID,
        ),
      ).toBe(true);
    });

    it('failure path – returns false when direction does not match', () => {
      const user = makeUser();
      expect(
        user.isInOrganization(
          OTHER_ID,
          DEPT_ID,
        ),
      ).toBe(false);
    });
  });
});
