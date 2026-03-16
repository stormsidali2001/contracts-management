"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
class Entity {
    constructor(_id) {
        this._id = _id;
    }
    getId() {
        return this._id;
    }
    equals(other) {
        if (!(other instanceof Entity))
            return false;
        return JSON.stringify(this._id) === JSON.stringify(other._id);
    }
}
exports.Entity = Entity;
//# sourceMappingURL=entity.js.map