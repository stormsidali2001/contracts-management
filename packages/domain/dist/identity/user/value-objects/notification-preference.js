"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPreference = void 0;
class NotificationPreference {
    constructor(receiveNotifications) {
        this.receiveNotifications = receiveNotifications;
    }
    toggle() {
        return new NotificationPreference(!this.receiveNotifications);
    }
    equals(other) {
        return this.receiveNotifications === other.receiveNotifications;
    }
}
exports.NotificationPreference = NotificationPreference;
//# sourceMappingURL=notification-preference.js.map