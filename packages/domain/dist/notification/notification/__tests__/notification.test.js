"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const notification_1 = require("../notification");
const NOTIF_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const USER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
(0, vitest_1.describe)('Notification (Aggregate Root)', () => {
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('happy path – should create notification with correct fields', () => {
            // Act
            const notification = notification_1.Notification.create(NOTIF_ID, USER_ID, 'Votre contrat AGR-2024-001 a été mis à jour');
            // Assert
            (0, vitest_1.expect)(notification.message.value).toBe('Votre contrat AGR-2024-001 a été mis à jour');
            (0, vitest_1.expect)(notification.userId).toBe(USER_ID);
            (0, vitest_1.expect)(notification.createdAt.value).toBeInstanceOf(Date);
        });
        (0, vitest_1.it)('failure path – should throw when message is empty', () => {
            (0, vitest_1.expect)(() => notification_1.Notification.create(NOTIF_ID, USER_ID, ''))
                .toThrowError('Notification message must not be empty');
        });
        (0, vitest_1.it)('failure path – should throw when message is only whitespace', () => {
            (0, vitest_1.expect)(() => notification_1.Notification.create(NOTIF_ID, USER_ID, '   '))
                .toThrowError('Notification message must not be empty');
        });
    });
});
//# sourceMappingURL=notification.test.js.map