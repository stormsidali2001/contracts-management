"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateRoot = void 0;
class AggregateRoot {
    constructor(_id) {
        this._id = _id;
        this._domainEvents = [];
    }
    getId() {
        return this._id;
    }
    equals(other) {
        if (!(other instanceof AggregateRoot))
            return false;
        return JSON.stringify(this._id) === JSON.stringify(other._id);
    }
    addDomainEvent(event) {
        this._domainEvents.push(event);
    }
    pullDomainEvents() {
        const events = [...this._domainEvents];
        this._domainEvents.length = 0;
        return events;
    }
}
exports.AggregateRoot = AggregateRoot;
//# sourceMappingURL=aggregate-root.js.map