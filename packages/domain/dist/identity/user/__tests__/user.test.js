"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const user_1 = require("../user");
const user_role_1 = require("../value-objects/user-role");
// ─── Helpers ────────────────────────────────────────────────────────────────
const USER_ID = '11111111-1111-4111-8111-111111111111';
const DIR_ID = '22222222-2222-4222-8222-222222222222';
const DEPT_ID = '33333333-3333-4333-8333-333333333333';
const OTHER_ID = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
function makeUser(overrides = {}) {
    return user_1.User.create({
        id: USER_ID,
        email: 'ali.benali@example.com',
        username: 'ali.benali',
        password: '$2b$10$hashedpasswordvalue',
        role: user_role_1.UserRoleEnum.EMPLOYEE,
        firstName: 'Ali',
        lastName: 'Benali',
        directionId: DIR_ID,
        departementId: DEPT_ID,
        ...overrides,
    });
}
// ─── Tests ──────────────────────────────────────────────────────────────────
(0, vitest_1.describe)('User (Aggregate Root)', () => {
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('happy path – EMPLOYEE with org membership should have directionId and departementId set', () => {
            // Act
            const user = makeUser();
            // Assert
            (0, vitest_1.expect)(user.role.value).toBe(user_role_1.UserRoleEnum.EMPLOYEE);
            (0, vitest_1.expect)(user.active).toBe(true);
            (0, vitest_1.expect)(user.membership.isAssigned()).toBe(true);
            (0, vitest_1.expect)(user.membership.directionId).toBe(DIR_ID);
            (0, vitest_1.expect)(user.membership.departementId).toBe(DEPT_ID);
            (0, vitest_1.expect)(user.recieve_notifications.receiveNotifications).toBe(false);
            (0, vitest_1.expect)(user.refresh_token_hash.isPresent()).toBe(false);
            (0, vitest_1.expect)(user.password_token).toBeNull();
        });
        (0, vitest_1.it)('happy path – ADMIN should have no org membership even when ids provided', () => {
            // Act
            const admin = makeUser({
                role: user_role_1.UserRoleEnum.ADMIN,
                directionId: DIR_ID,
                departementId: DEPT_ID,
            });
            // Assert
            (0, vitest_1.expect)(admin.membership.isAssigned()).toBe(false);
            (0, vitest_1.expect)(admin.membership.directionId).toBeNull();
        });
        (0, vitest_1.it)('happy path – JURIDICAL should have no org membership', () => {
            const user = makeUser({ role: user_role_1.UserRoleEnum.JURIDICAL });
            (0, vitest_1.expect)(user.membership.isAssigned()).toBe(false);
        });
        (0, vitest_1.it)('failure path – should throw on invalid email format', () => {
            (0, vitest_1.expect)(() => makeUser({ email: 'not-an-email' }))
                .toThrowError('Invalid email address');
        });
        (0, vitest_1.it)('failure path – should throw on username too short', () => {
            (0, vitest_1.expect)(() => makeUser({ username: 'ab' }))
                .toThrowError('Invalid username');
        });
        (0, vitest_1.it)('failure path – should throw on empty first name', () => {
            (0, vitest_1.expect)(() => makeUser({ firstName: '' }))
                .toThrowError('First name must not be empty');
        });
    });
    (0, vitest_1.describe)('changeRole', () => {
        (0, vitest_1.it)('happy path – changing EMPLOYEE to ADMIN clears org membership', () => {
            // Arrange
            const user = makeUser({ role: user_role_1.UserRoleEnum.EMPLOYEE });
            (0, vitest_1.expect)(user.membership.isAssigned()).toBe(true);
            // Act
            user.changeRole(user_role_1.UserRoleEnum.ADMIN);
            // Assert
            (0, vitest_1.expect)(user.role.value).toBe(user_role_1.UserRoleEnum.ADMIN);
            (0, vitest_1.expect)(user.membership.isAssigned()).toBe(false);
        });
        (0, vitest_1.it)('happy path – changing ADMIN to JURIDICAL keeps membership cleared', () => {
            const user = makeUser({ role: user_role_1.UserRoleEnum.ADMIN });
            user.changeRole(user_role_1.UserRoleEnum.JURIDICAL);
            (0, vitest_1.expect)(user.role.value).toBe(user_role_1.UserRoleEnum.JURIDICAL);
            (0, vitest_1.expect)(user.membership.isAssigned()).toBe(false);
        });
    });
    (0, vitest_1.describe)('assignToOrganization', () => {
        (0, vitest_1.it)('happy path – should assign EMPLOYEE to a direction and departement', () => {
            // Arrange
            const user = makeUser({ role: user_role_1.UserRoleEnum.EMPLOYEE, directionId: null, departementId: null });
            // Act
            user.assignToOrganization(DIR_ID, DEPT_ID);
            // Assert
            (0, vitest_1.expect)(user.membership.directionId).toBe(DIR_ID);
            (0, vitest_1.expect)(user.membership.departementId).toBe(DEPT_ID);
        });
        (0, vitest_1.it)('failure path – should throw when assigning ADMIN to an organization', () => {
            const admin = makeUser({ role: user_role_1.UserRoleEnum.ADMIN });
            (0, vitest_1.expect)(() => admin.assignToOrganization(DIR_ID, DEPT_ID)).toThrowError('cannot be assigned to an organization');
        });
    });
    (0, vitest_1.describe)('toggleNotifications', () => {
        (0, vitest_1.it)('happy path – should toggle from false to true', () => {
            const user = makeUser();
            (0, vitest_1.expect)(user.recieve_notifications.receiveNotifications).toBe(false);
            user.toggleNotifications();
            (0, vitest_1.expect)(user.recieve_notifications.receiveNotifications).toBe(true);
        });
        (0, vitest_1.it)('happy path – should toggle back to false on second call', () => {
            const user = makeUser();
            user.toggleNotifications();
            user.toggleNotifications();
            (0, vitest_1.expect)(user.recieve_notifications.receiveNotifications).toBe(false);
        });
    });
    (0, vitest_1.describe)('activate / deactivate', () => {
        (0, vitest_1.it)('happy path – should deactivate an active user', () => {
            const user = makeUser();
            user.deactivate();
            (0, vitest_1.expect)(user.active).toBe(false);
        });
        (0, vitest_1.it)('happy path – should reactivate a deactivated user', () => {
            const user = makeUser();
            user.deactivate();
            user.activate();
            (0, vitest_1.expect)(user.active).toBe(true);
        });
    });
    (0, vitest_1.describe)('setRefreshToken / clearRefreshToken', () => {
        (0, vitest_1.it)('happy path – should store a refresh token hash', () => {
            const user = makeUser();
            user.setRefreshToken('$2b$10$refreshtokenhash');
            (0, vitest_1.expect)(user.refresh_token_hash.isPresent()).toBe(true);
        });
        (0, vitest_1.it)('happy path – should clear the refresh token', () => {
            const user = makeUser();
            user.setRefreshToken('$2b$10$refreshtokenhash');
            user.clearRefreshToken();
            (0, vitest_1.expect)(user.refresh_token_hash.isPresent()).toBe(false);
        });
    });
    (0, vitest_1.describe)('requestPasswordReset / resetPassword', () => {
        (0, vitest_1.it)('happy path – should create a password reset token that is not expired', () => {
            // Arrange
            const user = makeUser();
            // Act
            const token = user.requestPasswordReset('random-token-string');
            // Assert
            (0, vitest_1.expect)(user.password_token).not.toBeNull();
            (0, vitest_1.expect)(token.token).toBe('random-token-string');
            (0, vitest_1.expect)(token.isExpired()).toBe(false);
            (0, vitest_1.expect)(token.isValid('random-token-string')).toBe(true);
        });
        (0, vitest_1.it)('happy path – resetPassword should update hash and clear the token', () => {
            // Arrange
            const user = makeUser();
            user.requestPasswordReset('reset-token');
            // Act
            user.resetPassword('$2b$10$newhashedpassword');
            // Assert
            (0, vitest_1.expect)(user.password_token).toBeNull();
            (0, vitest_1.expect)(user.password.value).toBe('$2b$10$newhashedpassword');
        });
        (0, vitest_1.it)('failure path – token should be invalid with wrong value', () => {
            const user = makeUser();
            user.requestPasswordReset('correct-token');
            (0, vitest_1.expect)(user.password_token.isValid('wrong-token')).toBe(false);
        });
    });
    (0, vitest_1.describe)('canAccessDepartement / isInOrganization', () => {
        (0, vitest_1.it)('happy path – returns true when user belongs to the given departement', () => {
            const user = makeUser();
            (0, vitest_1.expect)(user.canAccessDepartement(DEPT_ID)).toBe(true);
        });
        (0, vitest_1.it)('failure path – returns false for a different departement', () => {
            const user = makeUser();
            (0, vitest_1.expect)(user.canAccessDepartement(OTHER_ID)).toBe(false);
        });
        (0, vitest_1.it)('happy path – returns true when user is in the correct direction and departement', () => {
            const user = makeUser();
            (0, vitest_1.expect)(user.isInOrganization(DIR_ID, DEPT_ID)).toBe(true);
        });
        (0, vitest_1.it)('failure path – returns false when direction does not match', () => {
            const user = makeUser();
            (0, vitest_1.expect)(user.isInOrganization(OTHER_ID, DEPT_ID)).toBe(false);
        });
    });
});
//# sourceMappingURL=user.test.js.map