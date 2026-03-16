"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationMessage = void 0;
class NotificationMessage {
    constructor(value) {
        if (!value || value.trim().length === 0) {
            throw new Error('Notification message must not be empty');
        }
        this.value = value.trim();
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.NotificationMessage = NotificationMessage;
//# sourceMappingURL=notification-message.js.map