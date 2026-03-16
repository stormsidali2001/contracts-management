"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditEventId = void 0;
const uuid_1 = require("../../../shared/value-objects/uuid");
class AuditEventId extends uuid_1.Uuid {
    constructor(value) {
        super(value);
    }
}
exports.AuditEventId = AuditEventId;
//# sourceMappingURL=audit-event-id.js.map