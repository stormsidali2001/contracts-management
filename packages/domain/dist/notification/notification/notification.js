"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const aggregate_root_1 = require("../../shared/aggregate-root");
const created_at_1 = require("../../shared/value-objects/created-at");
const notification_id_1 = require("./value-objects/notification-id");
const notification_message_1 = require("./value-objects/notification-message");
class Notification extends aggregate_root_1.AggregateRoot {
    constructor(props) {
        super(props.id);
        this.message = props.message;
        this.userId = props.userId;
        this.createdAt = props.createdAt;
    }
    static create(id, userId, message) {
        return new Notification({
            id: new notification_id_1.NotificationId(id),
            message: new notification_message_1.NotificationMessage(message),
            userId,
            createdAt: new created_at_1.CreatedAt(),
        });
    }
    static reconstitute(props) {
        return new Notification(props);
    }
}
exports.Notification = Notification;
//# sourceMappingURL=notification.js.map