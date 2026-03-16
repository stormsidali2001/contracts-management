"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserId = void 0;
const uuid_1 = require("../../../shared/value-objects/uuid");
class UserId extends uuid_1.Uuid {
    constructor(value) {
        super(value);
    }
}
exports.UserId = UserId;
//# sourceMappingURL=user-id.js.map